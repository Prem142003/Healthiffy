FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json

RUN npm ci --workspace backend --omit=dev

COPY backend ./backend

WORKDIR /app/backend

EXPOSE 5000

CMD ["npm", "start"]
