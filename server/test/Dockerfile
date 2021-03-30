FROM node:fermium
COPY ./ /src
RUN wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && cp wait-for-it.sh /src/server/test && chmod +x /src/server/test/wait-for-it.sh
