FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock tsconfig.base.json vite.config.ts ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/backend/package.json ./apps/backend/

RUN bun install --frozen-lockfile --ignore-scripts

COPY apps/frontend ./apps/frontend

RUN bun run --cwd apps/frontend build

FROM nginx:alpine AS runner

RUN apk upgrade --no-cache

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
