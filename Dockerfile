# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -S triageai && adduser -S triageai -G triageai

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package*.json ./

# Create logs directory with correct permissions
RUN mkdir -p logs && chown -R triageai:triageai /app

USER triageai

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]
