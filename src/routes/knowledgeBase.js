import { Router } from "express";
import { KNOWLEDGE_BASE } from "../config/knowledgeBase.js";
import { retrieveDocuments } from "../services/ragService.js";

const router = Router();

/**
 * @route  GET /api/knowledge-base
 * @desc   Return all knowledge base documents (without full content by default)
 * @query  ?full=true to include full content
 * @query  ?category=billing to filter by category
 */
router.get("/", (req, res) => {
  const { full, category } = req.query;
  let docs = KNOWLEDGE_BASE;

  if (category) {
    docs = docs.filter((d) => d.category === category);
  }

  const result = docs.map((doc) => ({
    id: doc.id,
    category: doc.category,
    title: doc.title,
    tags: doc.tags,
    ...(full === "true" ? { content: doc.content } : {}),
  }));

  res.status(200).json({ success: true, count: result.length, data: result });
});

/**
 * @route  GET /api/knowledge-base/search
 * @desc   Simulate RAG retrieval for a given query string
 * @query  ?q=<search text>&topK=3
 */
router.get("/search", (req, res) => {
  const { q, topK } = req.query;

  if (!q || q.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: "Query param 'q' must be at least 3 characters",
    });
  }

  const docs = retrieveDocuments(q, parseInt(topK) || 3);

  res.status(200).json({
    success: true,
    query: q,
    count: docs.length,
    data: docs,
  });
});

export default router;
