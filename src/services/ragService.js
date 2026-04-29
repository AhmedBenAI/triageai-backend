import { pipeline, env } from "@xenova/transformers";
import path from "path";
import { fileURLToPath } from "url";
import { KNOWLEDGE_BASE } from "../config/knowledgeBase.js";
import { logger } from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
env.cacheDir = path.join(__dirname, "../../data/model-cache");
env.allowLocalModels = false;

const MODEL = "Xenova/all-MiniLM-L6-v2";

let embedder = null;
let articleEmbeddings = null; // cached on first use

async function getEmbedder() {
  if (!embedder) {
    logger.info("Loading embedding model…", { model: MODEL });
    embedder = await pipeline("feature-extraction", MODEL);
    logger.info("Embedding model ready");
  }
  return embedder;
}

async function embed(text) {
  const model = await getEmbedder();
  const out = await model(text, { pooling: "mean", normalize: true });
  return Array.from(out.data);
}

function cosineSimilarity(a, b) {
  // vectors are already L2-normalised so similarity == dot product
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

async function getArticleEmbeddings() {
  if (articleEmbeddings) return articleEmbeddings;

  logger.info(`Computing embeddings for ${KNOWLEDGE_BASE.length} KB articles…`);
  articleEmbeddings = await Promise.all(
    KNOWLEDGE_BASE.map(async (doc) => ({
      ...doc,
      embedding: await embed(`${doc.title}. ${doc.content}`),
    }))
  );
  logger.info("KB article embeddings cached");
  return articleEmbeddings;
}

/**
 * Pre-warm the embedder and cache article embeddings on server startup.
 * Call once from server.js — non-blocking (fire and forget).
 */
export async function initEmbedder() {
  await getArticleEmbeddings();
}

/**
 * Retrieve top-K relevant documents using cosine similarity over embeddings.
 */
export async function retrieveDocuments(ticketText, topK = 3) {
  const [queryVec, articles] = await Promise.all([
    embed(ticketText),
    getArticleEmbeddings(),
  ]);

  const scored = articles
    .map((doc) => ({
      id: doc.id,
      category: doc.category,
      title: doc.title,
      tags: doc.tags,
      content: doc.content,
      relevanceScore: cosineSimilarity(queryVec, doc.embedding),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topK);

  logger.info(`RAG retrieval complete`, {
    topDoc: scored[0]?.title,
    topScore: scored[0]?.relevanceScore.toFixed(3),
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
