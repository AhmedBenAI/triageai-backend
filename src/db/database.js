import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../data");
const DB_PATH = path.join(DATA_DIR, "triageai.db");

let db;

export function initDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id                  TEXT PRIMARY KEY,
      timestamp           TEXT NOT NULL,
      ticket_text         TEXT NOT NULL,
      category            TEXT,
      priority            TEXT,
      confidence          REAL,
      sentiment           TEXT,
      summary             TEXT,
      intent              TEXT,
      draft_response      TEXT,
      relevance           REAL,
      completeness        REAL,
      tone                REAL,
      actionability       REAL,
      overall_score       REAL,
      flagged             INTEGER DEFAULT 0,
      flag_reason         TEXT,
      total_latency_ms    INTEGER,
      total_input_tokens  INTEGER,
      total_output_tokens INTEGER,
      total_cost_usd      REAL,
      rag_docs_retrieved  INTEGER
    )
  `);

  logger.info("Database initialised", { path: DB_PATH });
  return db;
}

const INSERT = `
  INSERT OR REPLACE INTO tickets VALUES (
    @id, @timestamp, @ticket_text, @category, @priority, @confidence,
    @sentiment, @summary, @intent, @draft_response, @relevance,
    @completeness, @tone, @actionability, @overall_score, @flagged,
    @flag_reason, @total_latency_ms, @total_input_tokens,
    @total_output_tokens, @total_cost_usd, @rag_docs_retrieved
  )
`;

export function saveTicket(result) {
  if (!db) return;
  db.prepare(INSERT).run({
    id:                   result.ticketId,
    timestamp:            result.timestamp,
    ticket_text:          result.ticket,
    category:             result.classification.category,
    priority:             result.classification.priority,
    confidence:           result.classification.confidence,
    sentiment:            result.classification.sentiment,
    summary:              result.classification.summary,
    intent:               result.classification.intent,
    draft_response:       result.draftResponse,
    relevance:            result.evaluation.relevance,
    completeness:         result.evaluation.completeness,
    tone:                 result.evaluation.tone,
    actionability:        result.evaluation.actionability,
    overall_score:        result.evaluation.overall,
    flagged:              result.evaluation.flag ? 1 : 0,
    flag_reason:          result.evaluation.flag_reason || "",
    total_latency_ms:     result.performance.totalLatencyMs,
    total_input_tokens:   result.performance.totalInputTokens,
    total_output_tokens:  result.performance.totalOutputTokens,
    total_cost_usd:       result.performance.totalCostUsd,
    rag_docs_retrieved:   result.rag.docsRetrieved,
  });
}

export function getAllTickets() {
  if (!db) return [];
  return db.prepare("SELECT * FROM tickets ORDER BY timestamp ASC").all();
}

export function getRecentTickets(limit = 20) {
  if (!db) return [];
  return db
    .prepare("SELECT * FROM tickets ORDER BY timestamp DESC LIMIT ?")
    .all(limit);
}

export function clearAllTickets() {
  if (!db) return;
  db.prepare("DELETE FROM tickets").run();
}
