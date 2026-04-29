import { v4 as uuidv4 } from "uuid";
import { classifyTicket, draftResponse, evaluateResponse } from "./openaiService.js";
import { retrieveDocuments, formatDocsAsContext } from "./ragService.js";
import { recordTicket, calculateCost } from "../utils/metrics.js";
import { saveTicket } from "../db/database.js";
import { logger } from "../utils/logger.js";

/**
 * Full triage pipeline:
 * 1. Classify ticket (category, priority, sentiment)
 * 2. RAG retrieval (top-K knowledge base docs)
 * 3. Draft response (context-aware)
 * 4. Evaluate response (quality scores + flagging)
 * 5. Record metrics
 */
export async function runTriagePipeline(ticketText, options = {}) {
  const ticketId = uuidv4();
  const pipelineStart = Date.now();

  logger.info(`Pipeline started`, { ticketId, ticketLength: ticketText.length });

  // ── Stage 1: Classify ──────────────────────────────────────────────────────
  const stage1Start = Date.now();
  const { classification, meta: classifyMeta } = await classifyTicket(ticketText);
  const stage1Ms = Date.now() - stage1Start;

  // ── Stage 2: RAG Retrieval ─────────────────────────────────────────────────
  const stage2Start = Date.now();
  const retrievedDocs = retrieveDocuments(ticketText, options.ragTopK || 3);
  const ragContext = formatDocsAsContext(retrievedDocs);
  const stage2Ms = Date.now() - stage2Start;

  // ── Stage 3: Draft Response ────────────────────────────────────────────────
  const stage3Start = Date.now();
  const { draftResponse: draft, meta: draftMeta } = await draftResponse(
    ticketText,
    classification,
    ragContext
  );
  const stage3Ms = Date.now() - stage3Start;

  // ── Stage 4: Evaluate ──────────────────────────────────────────────────────
  const stage4Start = Date.now();
  const { evaluation, meta: evalMeta } = await evaluateResponse(ticketText, draft);
  const stage4Ms = Date.now() - stage4Start;

  // ── Aggregate metrics ──────────────────────────────────────────────────────
  const totalLatencyMs = Date.now() - pipelineStart;

  const stages = {
    classify: {
      latencyMs: stage1Ms,
      inputTokens: classifyMeta.inputTokens,
      outputTokens: classifyMeta.outputTokens,
      costUsd: classifyMeta.costUsd,
    },
    rag: {
      latencyMs: stage2Ms,
      docsRetrieved: retrievedDocs.length,
    },
    draft: {
      latencyMs: stage3Ms,
      inputTokens: draftMeta.inputTokens,
      outputTokens: draftMeta.outputTokens,
      costUsd: draftMeta.costUsd,
    },
    evaluate: {
      latencyMs: stage4Ms,
      inputTokens: evalMeta.inputTokens,
      outputTokens: evalMeta.outputTokens,
      costUsd: evalMeta.costUsd,
    },
  };

  const totalInputTokens =
    classifyMeta.inputTokens + draftMeta.inputTokens + evalMeta.inputTokens;
  const totalOutputTokens =
    classifyMeta.outputTokens + draftMeta.outputTokens + evalMeta.outputTokens;
  const totalCostUsd = calculateCost(totalInputTokens, totalOutputTokens);

  // Record to in-memory metrics store
  recordTicket({ latencyMs: totalLatencyMs, stages, classification, evaluation });

  logger.info(`Pipeline completed`, {
    ticketId,
    category: classification.category,
    priority: classification.priority,
    totalLatencyMs,
    totalTokens: totalInputTokens + totalOutputTokens,
    totalCostUsd: totalCostUsd.toFixed(6),
    evalOverall: evaluation.overall,
    flagged: evaluation.flag,
  });

  const result = {
    ticketId,
    timestamp: new Date().toISOString(),
    ticket: ticketText,
    classification,
    rag: {
      docsRetrieved: retrievedDocs.length,
      documents: retrievedDocs.map(({ id, category, title, relevanceScore }) => ({
        id,
        category,
        title,
        relevanceScore,
      })),
    },
    draftResponse: draft,
    evaluation,
    performance: {
      totalLatencyMs,
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      totalCostUsd: parseFloat(totalCostUsd.toFixed(6)),
      stages,
    },
  };

  saveTicket(result);
  return result;
}
