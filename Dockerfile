FROM node:fermium-alpine
WORKDIR /app

RUN mkdir /app/server
COPY ./server/package.json /app/server
COPY ./server/.env /app/server

RUN mkdir /app/client

COPY ./server/dist /app/server/dist
COPY ./client/dist /app/client/dist

WORKDIR /app/server
RUN npm install
CMD ["node", "dist/src/main"]