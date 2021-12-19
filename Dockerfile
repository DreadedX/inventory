FROM golang:alpine as build-proto
RUN apk add protoc bash

WORKDIR /src

RUN mkdir ./proto
COPY proto/go.mod ./proto
COPY proto/go.sum ./proto
COPY proto/install.sh ./proto
RUN cd proto && ./install.sh

RUN mkdir ./server ./printer
COPY proto proto
RUN cd proto && ./generate.sh


FROM golang:alpine as build-server

WORKDIR /src
COPY server/go.mod .
COPY server/go.sum .
RUN go mod download

COPY --from=build-proto /src/server .
COPY server .

RUN go build


FROM node:alpine as build-ui

RUN apk add protoc

WORKDIR /src
COPY ui/package.json .
COPY ui/yarn.lock .
RUN yarn

COPY --from=build-proto /src/proto ../proto
COPY ui .

RUN yarn twirpscript

ENV NODE_OPTIONS=--openssl-legacy-provider
RUN yarn build


FROM python

RUN set -ex && apt-get update && apt-get install musl

WORKDIR /app

RUN mkdir ./printer
COPY printer/requirements.txt ./printer
RUN cd ./printer && pip install -r requirements.txt

COPY --from=build-proto /src/printer ./printer
COPY printer ./printer

COPY --from=build-server /src/fonts fonts
COPY --from=build-server /src/inventory .
COPY --from=build-ui /src/build ./ui

ENV GIN_MODE=release
CMD ["./inventory"]
