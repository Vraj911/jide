FROM node:20-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json

RUN npm ci

FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=deps /app/apps/backend/package.json ./apps/backend/package.json
COPY package.json package-lock.json ./
COPY apps/backend/tsconfig.json apps/backend/tsconfig.json
COPY apps/backend/src apps/backend/src

RUN npm run build --workspace apps/backend

FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json

RUN npm ci --omit=dev --workspace apps/backend

COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY lib/jpp ./lib/jpp

WORKDIR /app/apps/backend

EXPOSE 5001

CMD ["node", "dist/main.js"]
