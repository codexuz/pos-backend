# Building stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for build)
RUN npm install --legacy-peer-deps

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Run build
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 7000

CMD [ "npm", "run", "start:prod" ]