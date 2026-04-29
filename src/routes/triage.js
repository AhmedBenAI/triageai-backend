import { Router } from "express";
import { validateTicketRequest } from "../middleware/validate.js";
import { runTriagePipeline } from "../services/triageService.js";
import { logger } from "../utils/logger.js";

const router = Router();

/**
 * @route  POST /api/triage
 * @desc   Run the full AI triage pipeline on a support ticket
 * @body   { ticket: string, options?: { ragTopK?: number } }
 * @return Full pipeline result: classification, RAG docs, draft response, evaluation, performance
 */
router.post("/", validateTicketRequest, async (req, res, next) => {
  try {
    const { ticket, options = {} } = req.body;

    logger.info("Triage request received", {
      ip: req.ip,
      ticketLength: ticket.length,
    });

    const result = await runTriagePipeline(ticket, options);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
