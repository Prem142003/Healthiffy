FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL
ARG VITE_SOCKET_URL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json

RUN npm ci --workspace frontend

COPY frontend ./frontend

WORKDIR /app/frontend

RUN npm run build

FROM nginx:1.27-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
