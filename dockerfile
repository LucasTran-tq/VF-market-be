FROM node:lts-alpine
LABEL maintainer "ack@baibay.id"

WORKDIR /app
EXPOSE 3000

COPY package.json yarn.lock ./
RUN touch .env

RUN set -x && yarn

COPY . .

CMD [ "yarn", "start:dev" ]
