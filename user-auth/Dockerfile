# Stage 1: Install dependencies
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Copy source and run
FROM node:22-alpine

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
