import { Router } from "express";
import { getMetrics, resetMetrics } from "../utils/metrics.js";
import { clearAllTickets } from "../db/database.js";
import { logger } from "../utils/logger.js";

const router = Router();

/**
 * @route  GET /api/metrics
 * @desc   Return aggregated pipeline metrics (tickets, tokens, cost, latency, eval scores)
 */
router.get("/", (req, res) => {
  const data = getMetrics();
  res.status(200).json({ success: true, data });
});

/**
 * @route  DELETE /api/metrics
 * @desc   Reset all metrics (useful for testing / new sessions)
 */
router.delete("/", (req, res) => {
  clearAllTickets();
  resetMetrics();
  logger.info("Metrics and ticket history reset");
  res.status(200).json({ success: true, message: "Metrics reset successfully" });
});

export default router;
