# Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm install --legacy-peer-deps

RUN npx prisma generate

COPY . .

RUN npm run build

CMD ["node", "dist/main.js"]