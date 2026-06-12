# Multi-stage production image. SQLite lives on a volume at /data in this
# setup; point DATABASE_URL at a managed Postgres for real scale (the Prisma
# schema is Postgres-compatible).

FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV DATABASE_URL="file:/data/prod.db"
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL="file:/data/prod.db"
RUN addgroup -S app && adduser -S app -G app && mkdir -p /data && chown app:app /data

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./

USER app
EXPOSE 3000
VOLUME /data

# Sync the schema on boot (idempotent), then serve
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run start"]
