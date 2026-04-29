# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx ng build --configuration production

# ── Serve stage ───────────────────────────────────────────────────────────────
FROM nginx:alpine AS production

# Angular 17 application builder outputs to dist/<name>/browser/
COPY --from=builder /app/dist/triageai-frontend/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
