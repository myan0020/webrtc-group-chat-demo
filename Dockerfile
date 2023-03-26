# syntax=docker/dockerfile:1

FROM node:16

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

COPY webpack.config.js ./webpack.config.js
COPY .env ./.env
COPY public ./public
COPY react_client ./react_client
COPY express_server ./express_server

RUN npm run build

ENTRYPOINT [ "/usr/local/bin/npm", "run", "express" ]