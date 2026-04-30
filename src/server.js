import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initDatabase, getAllTickets } from "./db/database.js";
import { recordTicket } from "./utils/metrics.js";
import { initEmbedder } from "./services/ragService.js";
import triageRoutes from "./routes/triage.js";
import metricsRoutes from "./routes/metrics.js";
import ticketsRoutes from "./routes/tickets.js";
import knowledgeBaseRoutes from "./routes/knowledgeBase.js";

// ── Validate required env vars ─────────────────────────────────────────────
if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
  logger.error("Neither OPENAI_API_KEY nor ANTHROPIC_API_KEY is set. At least one is required. Exiting.");
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY)   logger.warn("OPENAI_API_KEY not set — OpenAI model unavailable");
if (!process.env.ANTHROPIC_API_KEY) logger.warn("ANTHROPIC_API_KEY not set — Claude model unavailable");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security & parsing middleware ──────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: "100kb" }));

app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// ── Rate limiting ──────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,          // 1 minute window
  max: parseInt(process.env.RATE_LIMIT_RPM) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please slow down.",
  },
});

app.use("/api/triage", apiLimiter);

// ── Health check ───────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "triageai-backend",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/triage", triageRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/knowledge-base", knowledgeBaseRoutes);

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);

// ── Embedding model pre-warm (non-blocking) ───────────────────────────────
initEmbedder().catch((err) =>
  logger.warn("Embedding model pre-warm failed", { err: err.message })
);

// ── Database init + metrics replay ────────────────────────────────────────
initDatabase();
const savedTickets = getAllTickets();
for (const t of savedTickets) {
  recordTicket({
    latencyMs: t.total_latency_ms,
    stages: {
      replay: { inputTokens: t.total_input_tokens, outputTokens: t.total_output_tokens },
    },
    classification: { category: t.category, priority: t.priority },
    evaluation: { flag: t.flagged === 1, overall: t.overall_score },
    costUsd: t.total_cost_usd,
  });
}
if (savedTickets.length > 0) {
  logger.info(`Replayed ${savedTickets.length} tickets from database`);
}

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`TriageAI backend running on port ${PORT}`, {
    env: process.env.NODE_ENV || "development",
    port: PORT,
  });
});

export default app;
