import { Router } from "express";
import { getRecentTickets } from "../db/database.js";

const router = Router();

/**
 * @route  GET /api/tickets
 * @desc   Return recent ticket history from the database
 * @query  ?limit=20 (max 100)
 */
router.get("/", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const tickets = getRecentTickets(limit);
  res.json({ success: true, count: tickets.length, data: tickets });
});

export default router;
