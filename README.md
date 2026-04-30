# triageai-backend

AI-powered support ticket triage API — deployed on **Railway**.

**Frontend repo:** [triageai-web](https://github.com/PotatoUser69/triageai-web) (deployed on Vercel)

---

## Deploy to Railway

1. Push this repo to GitHub.
2. Create a new project on [railway.app](https://railway.app) → **Deploy from GitHub repo**.
3. Railway detects the `Dockerfile` automatically.
4. Set environment variables in the Railway dashboard:

   | Variable | Required | Notes |
   |---|---|---|
   | `OPENAI_API_KEY` | One of these two | GPT-3.5 Turbo |
   | `ANTHROPIC_API_KEY` | One of these two | Claude Haiku |
   | `CORS_ORIGIN` | ✅ | Your Vercel frontend URL, e.g. `https://triageai.vercel.app` |
   | `NODE_ENV` | — | Set to `production` |
   | `RATE_LIMIT_RPM` | — | Default `20` |
   | `LOG_LEVEL` | — | Default `info` |

5. **Add a Volume** in Railway (Storage → Add Volume) mounted at `/app/data` to persist the SQLite database and embedding model cache across deploys. Without it, ticket history resets on every deploy.

Railway injects `PORT` automatically — the server reads it with `process.env.PORT`.

---

## Local Development

```bash
cp .env.example .env   # fill in your API key(s)
npm install
npm run dev            # http://localhost:3000
```

---

## Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 20 (ESM), Express 4 |
| **AI Models** | OpenAI GPT-3.5 Turbo · Anthropic Claude Haiku 4.5 |
| **Embeddings** | `@xenova/transformers` — `all-MiniLM-L6-v2` (local, ~22 MB) |
| **Database** | SQLite via `better-sqlite3` |
| **Logging** | Winston |

---

## Project Structure

```
triageai-backend/
├── src/
│   ├── server.js
│   ├── config/
│   │   └── knowledgeBase.js       # 25 KB articles across 5 categories
│   ├── routes/
│   │   ├── triage.js              # POST /api/triage
│   │   ├── metrics.js             # GET|DELETE /api/metrics
│   │   ├── tickets.js             # GET /api/tickets
│   │   └── knowledgeBase.js       # GET /api/knowledge-base[/search]
│   ├── services/
│   │   ├── triageService.js       # 4-stage pipeline orchestrator
│   │   ├── openaiService.js       # GPT-3.5 Turbo
│   │   ├── claudeService.js       # Claude Haiku
│   │   └── ragService.js          # Vector embeddings (MiniLM-L6-v2)
│   ├── db/
│   │   └── database.js            # SQLite helpers
│   ├── middleware/
│   │   ├── validate.js
│   │   └── errorHandler.js
│   └── utils/
│       ├── logger.js
│       └── metrics.js             # In-memory metrics + per-model pricing
├── data/                          # SQLite DB + model cache (mount as Railway Volume)
├── Dockerfile
└── .env.example
```

---

## API Reference

### `GET /health`
```json
{ "status": "ok", "service": "triageai-backend", "timestamp": "...", "version": "1.0.0" }
```

### `POST /api/triage`
```json
{
  "ticket": "I was charged twice...",
  "options": { "model": "openai", "ragTopK": 3 }
}
```
`model` is `"openai"` (default) or `"claude"`.

### `GET /api/metrics` · `DELETE /api/metrics`
### `GET /api/tickets?limit=20`
### `GET /api/knowledge-base?full=true&category=billing`
### `GET /api/knowledge-base/search?q=refund&topK=3`

---

## Pipeline

| Stage | What it does |
|---|---|
| **1. Classify** | Category, priority, confidence, sentiment, intent |
| **2. RAG** | Cosine similarity over sentence embeddings, top-K of 25 articles |
| **3. Draft** | 150–220 word empathetic response using KB context |
| **4. Evaluate** | Quality scores (relevance, completeness, tone, actionability) + flag |

Approximate cost per ticket: **~$0.0007** (Claude Haiku) · **~$0.0016** (GPT-3.5 Turbo)
