# base node image
FROM node:16-bullseye-slim as base
RUN apt-get update && apt-get install -y openssl && apt-get install -y ca-certificates

# Builder
FROM base as builder

ENV NODE_ENV build
WORKDIR /home/node

COPY package*.json ./

RUN npm ci

# ADD .env .
ADD prisma .
RUN npx prisma generate

COPY . .
RUN npm run build && npm prune --production


# Server
FROM base

ENV NODE_ENV production
WORKDIR /home/node

COPY --from=builder /home/node/package*.json ./
COPY --from=builder /home/node/node_modules/ ./node_modules/
COPY --from=builder /home/node/dist/ ./dist/

CMD ["node", "dist/src/main.js"]

