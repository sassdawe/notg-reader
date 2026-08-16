# Build frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/frontend/package.json packages/frontend/
COPY packages/backend/package.json packages/backend/
RUN npm ci --workspace=@notg-reader/frontend
COPY packages/frontend/ packages/frontend/
COPY tsconfig.json ./
RUN npm run build -w @notg-reader/frontend

# Build backend
FROM node:22-alpine AS backend-build
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/
RUN npm ci --workspace=@notg-reader/backend
COPY packages/backend/ packages/backend/
COPY tsconfig.json ./
RUN npx -w @notg-reader/backend prisma generate
RUN npm run build -w @notg-reader/backend

# Production
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup

COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/
RUN npm ci --workspace=@notg-reader/backend --omit=dev

COPY --from=backend-build /app/packages/backend/dist packages/backend/dist
COPY --from=backend-build /app/packages/backend/prisma packages/backend/prisma
COPY --from=backend-build /app/node_modules/.prisma node_modules/.prisma
COPY --from=frontend-build /app/packages/frontend/dist packages/frontend/dist

ENV NODE_ENV=production
ENV PORT=3001

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001
CMD ["node", "packages/backend/dist/index.js"]
