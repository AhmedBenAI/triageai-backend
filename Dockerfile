# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:20-slim AS production

# Create non-root user for security (Debian-style syntax for node:20-slim)
RUN groupadd --system triageai && useradd --system --gid triageai --no-create-home triageai

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package*.json ./

# Create logs directory with correct permissions
RUN mkdir -p logs data && chown -R triageai:triageai /app

USER triageai

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
