import { KNOWLEDGE_BASE } from "../config/knowledgeBase.js";
import { logger } from "../utils/logger.js";

/**
 * Tokenise text into meaningful words (length >= 3, remove stopwords).
 */
const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "has",
  "her", "was", "one", "our", "out", "day", "get", "has", "him", "his",
  "how", "its", "may", "who", "did", "let", "put", "too", "use", "way",
  "she", "had", "have", "been", "that", "this", "with", "from", "they",
  "will", "your", "been", "does", "into", "more", "also", "when", "what",
  "then", "than", "here", "just", "over", "such", "very", "well", "were",
]);

function tokenise(text) {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

/**
 * Score a document against query tokens.
 * Weights: tag match = 3, title match = 2, content match = 1
 */
function scoreDoc(doc, queryTokens) {
  let score = 0;
  const titleTokens = tokenise(doc.title);
  const contentTokens = tokenise(doc.content);
  const tagTokens = doc.tags || [];

  for (const qt of queryTokens) {
    for (const tag of tagTokens) {
      if (tag.includes(qt) || qt.includes(tag)) score += 3;
    }
    for (const tt of titleTokens) {
      if (tt === qt) score += 2;
    }
    for (const ct of contentTokens) {
      if (ct === qt) score += 1;
    }
  }
  return score;
}

/**
 * Retrieve top-K relevant documents from the knowledge base.
 * @param {string} ticketText - Raw ticket content
 * @param {number} topK - Number of documents to return (default 3)
 * @returns {Array} Array of matched documents with scores
 */
export function retrieveDocuments(ticketText, topK = 3) {
  const queryTokens = tokenise(ticketText);

  if (queryTokens.length === 0) {
    logger.warn("RAG retrieval: no usable tokens extracted from ticket");
    return [];
  }

  const scored = KNOWLEDGE_BASE.map((doc) => ({
    ...doc,
    relevanceScore: scoreDoc(doc, queryTokens),
  }))
    .filter((doc) => doc.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK);

  logger.info(`RAG retrieval: ${scored.length} documents matched`, {
    topDoc: scored[0]?.title,
    topScore: scored[0]?.relevanceScore,
  });

  return scored;
}

/**
 * Format retrieved documents as a context block for the LLM prompt.
 */
export function formatDocsAsContext(docs) {
  if (docs.length === 0) {
    return "No specific knowledge base articles matched this ticket. Use general support best practices.";
  }
  return docs
    .map((doc, i) => `[Source ${i + 1}: ${doc.title} (${doc.category})]\n${doc.content}`)
    .join("\n\n---\n\n");
}
