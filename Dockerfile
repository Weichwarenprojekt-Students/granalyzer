FROM node:fermium-alpine
WORKDIR /app

RUN mkdir /app/server
RUN mkdir /app/client

COPY ./server/package.json /app/server

COPY ./server/dist /app/server/dist
COPY ./client/dist /app/client/dist

RUN mkdir /app/server/src
COPY ./server/src/data-scheme /app/server/src/data-scheme
COPY ./server/tsconfig.json /app/server

WORKDIR /app/server
RUN npm install
CMD ["node", "dist/src/main"]