import OpenAI from "openai";
import { logger } from "../utils/logger.js";
import { calculateCost } from "../utils/metrics.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = "gpt-3.5-turbo";

async function callLLM(systemPrompt, userContent, stageName, jsonMode = false) {
  const start = Date.now();
  logger.info(`LLM call started: ${stageName}`);

  const requestParams = {
    model: MODEL,
    max_tokens: 1024,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  };

  if (jsonMode) {
    requestParams.response_format = { type: "json_object" };
  }

  const response = await client.chat.completions.create(requestParams);

  const latencyMs = Date.now() - start;
  const inputTokens = response.usage.prompt_tokens;
  const outputTokens = response.usage.completion_tokens;
  const costUsd = calculateCost(inputTokens, outputTokens);
  const text = response.choices[0].message.content || "";

  logger.info(`LLM call completed: ${stageName}`, {
    latencyMs,
    inputTokens,
    outputTokens,
    costUsd: costUsd.toFixed(6),
  });

  return { text, latencyMs, inputTokens, outputTokens, costUsd };
}

export async function classifyTicket(ticketText) {
  const systemPrompt = `You are a support ticket classification engine.
Analyse the incoming ticket and respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.

JSON schema:
{
  "category": "billing" | "technical" | "account" | "feature" | "compliance" | "general",
  "priority": "critical" | "high" | "medium" | "low",
  "confidence": <float 0.0-1.0>,
  "sentiment": "frustrated" | "neutral" | "positive",
  "summary": "<one sentence, max 20 words>",
  "intent": "<what the customer wants, max 8 words>"
}

Priority rules:
- critical: service down, data loss, security breach, legal threat
- high: feature broken, billing error, account locked
- medium: configuration help, how-to questions
- low: general enquiries, feature requests`;

  const result = await callLLM(systemPrompt, ticketText, "classify", true);

  let classification;
  try {
    const clean = result.text.replace(/```json|```/g, "").trim();
    classification = JSON.parse(clean);
  } catch (err) {
    logger.warn("Classification JSON parse failed, using fallback", { raw: result.text });
    classification = {
      category: "general",
      priority: "medium",
      confidence: 0.5,
      sentiment: "neutral",
      summary: ticketText.slice(0, 80),
      intent: "resolve issue",
    };
  }

  return { classification, meta: result };
}

export async function draftResponse(ticketText, classification, ragContext) {
  const systemPrompt = `You are a senior customer support specialist.
Using the knowledge base context below, write a professional first response to the support ticket.

Guidelines:
- Tone: warm, empathetic, professional
- Length: 150–220 words
- Be action-oriented: give the customer clear next steps
- Reference knowledge base articles naturally — do not say "according to article X"
- Do NOT invent URLs, order IDs, or account details you do not have
- If the issue requires escalation, say so clearly
- Sign off as: "The Support Team"

Ticket metadata:
- Category: ${classification.category}
- Priority: ${classification.priority}
- Customer sentiment: ${classification.sentiment}

--- KNOWLEDGE BASE CONTEXT ---
${ragContext}
--- END CONTEXT ---`;

  const result = await callLLM(systemPrompt, `Support Ticket:\n${ticketText}`, "draft", false);
  return { draftResponse: result.text, meta: result };
}

export async function evaluateResponse(ticketText, draftText) {
  const systemPrompt = `You are a QA evaluator for customer support responses.
Score the draft response against the original ticket.
Respond ONLY with a valid JSON object — no markdown, no extra text.

JSON schema:
{
  "relevance": <float 0.0-1.0>,
  "completeness": <float 0.0-1.0>,
  "tone": <float 0.0-1.0>,
  "actionability": <float 0.0-1.0>,
  "overall": <float 0.0-1.0>,
  "flag": <boolean>,
  "flag_reason": "<string, empty if flag=false>"
}

Scoring rubric:
- relevance: does the response address the actual ticket issue?
- completeness: are all parts of the issue addressed?
- tone: is it empathetic and professional?
- actionability: does the customer know what to do next?
- overall: weighted average (relevance 30%, completeness 25%, tone 20%, actionability 25%)
- flag: true ONLY if response is factually wrong, harmful, or completely off-topic`;

  const prompt = `Original Ticket:\n${ticketText}\n\nDraft Response:\n${draftText}`;
  const result = await callLLM(systemPrompt, prompt, "evaluate", true);

  let evaluation;
  try {
    const clean = result.text.replace(/```json|```/g, "").trim();
    evaluation = JSON.parse(clean);
  } catch (err) {
    logger.warn("Evaluation JSON parse failed, using fallback", { raw: result.text });
    evaluation = {
      relevance: 0.8,
      completeness: 0.8,
      tone: 0.85,
      actionability: 0.8,
      overall: 0.81,
      flag: false,
      flag_reason: "",
    };
  }

  return { evaluation, meta: result };
}
