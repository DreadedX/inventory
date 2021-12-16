FROM golang:alpine as build-server

RUN apk add protoc bash

WORKDIR /src
COPY server/go.mod .
COPY server/go.sum .

COPY server .
COPY proto ../proto

RUN ./install.sh && ./generate.sh
RUN go build


FROM node:alpine as build-ui

RUN apk add protoc

WORKDIR /src
COPY ui/package.json .
COPY ui/yarn.lock .
RUN yarn

COPY ui .
COPY proto ../proto

RUN yarn twirpscript

ENV NODE_OPTIONS=--openssl-legacy-provider
RUN yarn build


FROM python

RUN set -ex && apt-get update && apt-get install musl

WORKDIR /app

RUN mkdir ./print
COPY print/requirements.txt ./print
RUN cd ./print && pip install -r requirements.txt

COPY print ./print

COPY --from=build-server /src/fonts fonts
COPY --from=build-server /src/inventory .
COPY --from=build-ui /src/build ./ui

ENV GIN_MODE=release
CMD ["./inventory"]
