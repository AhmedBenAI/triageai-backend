# TriageAI

AI-powered support ticket automation. Paste a ticket — the pipeline classifies it, retrieves relevant knowledge base articles via RAG, drafts a response, and scores the output quality, all in a single API call.

---

## Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 20 (ESM), Express 4 |
| **AI** | OpenAI GPT-3.5 Turbo |
| **Frontend** | Angular 17, Tailwind CSS, Chart.js |
| **Container** | Docker + Docker Compose + nginx |
| **Logging** | Winston |

---

## Quick Start

### Docker (full stack — recommended)

```bash
# 1. Copy and edit the env file — set your OpenAI key
cp .env.example .env

# 2. Build and start everything
docker compose up --build
```

Open **http://localhost** — the Angular frontend is served by nginx, which also proxies all `/api` calls to the backend.

---

### Local development (no Docker)

**Terminal 1 — backend**
```bash
npm install
npm run dev          # API at http://localhost:3000
```

**Terminal 2 — frontend**
```bash
cd client
npm install
npm run dev          # UI at http://localhost:4200
```

The Angular dev server proxies `/api` and `/health` to `localhost:3000` automatically via `proxy.conf.json`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your key.

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | — | **Required.** Your OpenAI API key |
| `PORT` | `3000` | Backend server port |
| `NODE_ENV` | `development` | Node environment |
| `CORS_ORIGIN` | `http://localhost:4200` | Allowed CORS origin (set to `http://localhost` in Docker) |
| `RATE_LIMIT_RPM` | `20` | Max triage requests per minute per IP |
| `LOG_LEVEL` | `info` | Winston log level (`error` \| `warn` \| `info` \| `debug`) |
| `FRONTEND_PORT` | `80` | Host port for the frontend container |

---

## API Reference

### `GET /health`

```json
{ "status": "ok", "service": "triageai-backend", "timestamp": "...", "version": "1.0.0" }
```

---

### `POST /api/triage`

Run the full 4-stage AI pipeline on a support ticket.

**Request**
```json
{
  "ticket": "I was charged twice for my subscription this month...",
  "options": { "ragTopK": 3 }
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `ticket` | string | ✅ | 10–5000 characters |
| `options.ragTopK` | integer | ❌ | KB docs to retrieve, 1–5 (default 3) |

**Response**
```json
{
  "success": true,
  "data": {
    "ticketId": "uuid",
    "timestamp": "ISO8601",
    "classification": {
      "category": "billing",
      "priority": "high",
      "confidence": 0.95,
      "sentiment": "frustrated",
      "summary": "Customer charged twice, requesting refund",
      "intent": "get refund for duplicate charge"
    },
    "rag": {
      "docsRetrieved": 2,
      "documents": [
        { "id": "kb-001", "category": "billing", "title": "Refund Policy", "relevanceScore": 9 }
      ]
    },
    "draftResponse": "Thank you for reaching out...",
    "evaluation": {
      "relevance": 0.95, "completeness": 0.88, "tone": 0.92,
      "actionability": 0.90, "overall": 0.91,
      "flag": false, "flag_reason": ""
    },
    "performance": {
      "totalLatencyMs": 3200,
      "totalInputTokens": 1850, "totalOutputTokens": 420, "totalTokens": 2270,
      "totalCostUsd": 0.001551,
      "stages": {
        "classify":  { "latencyMs": 700,  "inputTokens": 420, "outputTokens": 80,  "costUsd": 0.000330 },
        "rag":       { "latencyMs": 2,    "docsRetrieved": 2 },
        "draft":     { "latencyMs": 1800, "inputTokens": 980, "outputTokens": 280, "costUsd": 0.000910 },
        "evaluate":  { "latencyMs": 700,  "inputTokens": 450, "outputTokens": 60,  "costUsd": 0.000315 }
      }
    }
  }
}
```

---

### `GET /api/metrics`

Aggregated stats across all processed tickets (resets on restart).

```json
{
  "success": true,
  "data": {
    "totalTickets": 42,
    "totalCostUsd": 0.065142,
    "avgCostPerTicketUsd": 0.001551,
    "latency": { "avgMs": 3200, "p95Ms": 4800, "samples": 42 },
    "categoryBreakdown": { "billing": 18, "technical": 12, "account": 7, "feature": 5 },
    "priorityBreakdown": { "high": 20, "medium": 15, "critical": 4, "low": 3 },
    "flaggedTickets": 1, "flagRate": 0.024, "avgEvalScore": 0.893
  }
}
```

### `DELETE /api/metrics` — Reset counters.

---

### `GET /api/knowledge-base`

List KB documents. Query params: `?full=true`, `?category=billing|technical|account|feature|compliance`

### `GET /api/knowledge-base/search`

Test RAG retrieval. Query params: `?q=<text>` (min 3 chars), `?topK=3`

---

## Project Structure

```
triageai-backend/
├── src/
│   ├── server.js                  # Express app entry point
│   ├── config/
│   │   └── knowledgeBase.js       # 10 hardcoded KB articles (RAG source)
│   ├── routes/
│   │   ├── triage.js              # POST /api/triage
│   │   ├── metrics.js             # GET|DELETE /api/metrics
│   │   └── knowledgeBase.js       # GET /api/knowledge-base
│   ├── services/
│   │   ├── triageService.js       # 4-stage pipeline orchestrator
│   │   ├── openaiService.js       # GPT-3.5 calls (classify, draft, evaluate)
│   │   └── ragService.js          # Keyword-based document retrieval
│   ├── middleware/
│   │   ├── validate.js            # Request validation
│   │   └── errorHandler.js        # Global error handler
│   └── utils/
│       ├── logger.js              # Winston logger
│       └── metrics.js             # In-memory metrics store
│
├── client/                        # Angular 17 frontend
│   ├── src/app/
│   │   ├── pages/                 # Dashboard, Triage, KnowledgeBase
│   │   ├── components/            # Sidebar, Badge, ScoreBar, MetricCard, Icon…
│   │   └── services/              # ApiService, ToastService
│   ├── Dockerfile                 # Node build → nginx serve
│   └── nginx.conf                 # SPA routing + /api proxy
│
├── Dockerfile                     # Backend container
├── docker-compose.yml             # Backend + frontend services
└── .env                           # Local config (never committed)
```

---

## Pipeline Stages

| Stage | Model | What it does |
|---|---|---|
| **1. Classify** | GPT-3.5 Turbo | Category, priority, confidence, sentiment, intent |
| **2. RAG** | — (local) | Keyword scoring against 10 KB articles |
| **3. Draft** | GPT-3.5 Turbo | 150–220 word empathetic response using KB context |
| **4. Evaluate** | GPT-3.5 Turbo | Quality scores (relevance, completeness, tone, actionability) + flag check |

Approximate cost per ticket: **~$0.0016** (GPT-3.5 Turbo pricing).
