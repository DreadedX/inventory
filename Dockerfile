FROM golang:alpine as build-proto
RUN apk add protoc bash

WORKDIR /src/proto

COPY proto/go.mod .
COPY proto/go.sum .
COPY proto/install.sh .
RUN ./install.sh

RUN mkdir ../server ../printer
COPY proto .
RUN ./generate.sh


FROM golang:alpine as build-server

WORKDIR /src/server
COPY server/go.mod .
COPY server/go.sum .
RUN go mod download

COPY --from=build-proto /src/server .
COPY server .

RUN go build


FROM node:alpine as build-ui

RUN apk add protoc git bash

WORKDIR /git
RUN git clone https://github.com/Semantic-Org/Semantic-UI-CSS
RUN cd Semantic-UI-CSS && yarn link

WORKDIR /src/ui
COPY ui/package.json .
COPY ui/yarn.lock .
RUN yarn
RUN yarn link semantic-ui-css

COPY --from=build-proto /src/proto ../proto
COPY ui .

RUN cd ../proto && ./generate_twirpscript.sh

RUN yarn build


FROM python

RUN set -ex && apt-get update && apt-get install musl

WORKDIR /app

RUN mkdir ./printer
COPY printer/requirements.txt ./printer
RUN cd ./printer && pip install -r requirements.txt

COPY --from=build-proto /src/printer ./printer
COPY printer ./printer

COPY --from=build-server /src/server/fonts fonts
COPY --from=build-server /src/server/inventory .
COPY --from=build-ui /src/ui/build ./ui

ENV GIN_MODE=release
CMD ["./inventory"]
