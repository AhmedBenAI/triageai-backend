/**
 * In-memory metrics store.
 * In production, swap this out for a Redis or database-backed store.
 */

const metrics = {
  totalTickets: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCostUsd: 0,
  latencies: [],
  categoryBreakdown: {},
  priorityBreakdown: {},
  flaggedTickets: 0,
  evalScores: [],
  startedAt: new Date().toISOString(),
};

// Pricing per million tokens (gpt-3.5-turbo)
const PRICING = {
  inputPerMillion: 0.5,
  outputPerMillion: 1.5,
};

export function calculateCost(inputTokens, outputTokens) {
  return (
    (inputTokens / 1_000_000) * PRICING.inputPerMillion +
    (outputTokens / 1_000_000) * PRICING.outputPerMillion
  );
}

export function recordTicket({ latencyMs, stages, classification, evaluation }) {
  metrics.totalTickets += 1;

  // Tokens & cost
  let ticketInputTokens = 0;
  let ticketOutputTokens = 0;
  for (const stage of Object.values(stages)) {
    ticketInputTokens += stage.inputTokens || 0;
    ticketOutputTokens += stage.outputTokens || 0;
  }
  metrics.totalInputTokens += ticketInputTokens;
  metrics.totalOutputTokens += ticketOutputTokens;
  metrics.totalCostUsd += calculateCost(ticketInputTokens, ticketOutputTokens);

  // Latency
  metrics.latencies.push(latencyMs);

  // Category breakdown
  const cat = classification?.category || "unknown";
  metrics.categoryBreakdown[cat] = (metrics.categoryBreakdown[cat] || 0) + 1;

  // Priority breakdown
  const pri = classification?.priority || "unknown";
  metrics.priorityBreakdown[pri] = (metrics.priorityBreakdown[pri] || 0) + 1;

  // Flagged
  if (evaluation?.flag) metrics.flaggedTickets += 1;

  // Eval scores
  if (evaluation?.overall != null) {
    metrics.evalScores.push(evaluation.overall);
  }
}

export function getMetrics() {
  const latencies = metrics.latencies;
  const avgLatencyMs =
    latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;
  const p95LatencyMs =
    latencies.length > 0
      ? Math.round(
          [...latencies].sort((a, b) => a - b)[
            Math.floor(latencies.length * 0.95)
          ]
        )
      : 0;

  const evalScores = metrics.evalScores;
  const avgEvalScore =
    evalScores.length > 0
      ? (evalScores.reduce((a, b) => a + b, 0) / evalScores.length).toFixed(3)
      : null;

  return {
    totalTickets: metrics.totalTickets,
    totalInputTokens: metrics.totalInputTokens,
    totalOutputTokens: metrics.totalOutputTokens,
    totalTokens: metrics.totalInputTokens + metrics.totalOutputTokens,
    totalCostUsd: parseFloat(metrics.totalCostUsd.toFixed(6)),
    avgCostPerTicketUsd:
      metrics.totalTickets > 0
        ? parseFloat((metrics.totalCostUsd / metrics.totalTickets).toFixed(6))
        : 0,
    latency: {
      avgMs: avgLatencyMs,
      p95Ms: p95LatencyMs,
      samples: latencies.length,
    },
    categoryBreakdown: metrics.categoryBreakdown,
    priorityBreakdown: metrics.priorityBreakdown,
    flaggedTickets: metrics.flaggedTickets,
    flagRate:
      metrics.totalTickets > 0
        ? parseFloat(
            (metrics.flaggedTickets / metrics.totalTickets).toFixed(3)
          )
        : 0,
    avgEvalScore: avgEvalScore ? parseFloat(avgEvalScore) : null,
    startedAt: metrics.startedAt,
    uptimeSeconds: Math.floor(
      (Date.now() - new Date(metrics.startedAt).getTime()) / 1000
    ),
  };
}

export function resetMetrics() {
  metrics.totalTickets = 0;
  metrics.totalInputTokens = 0;
  metrics.totalOutputTokens = 0;
  metrics.totalCostUsd = 0;
  metrics.latencies = [];
  metrics.categoryBreakdown = {};
  metrics.priorityBreakdown = {};
  metrics.flaggedTickets = 0;
  metrics.evalScores = [];
  metrics.startedAt = new Date().toISOString();
}
