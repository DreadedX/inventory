FROM --platform=$BUILDPLATFORM golang:alpine AS build-proto
RUN apk add protoc bash

WORKDIR /src/proto

COPY proto/go.mod .
COPY proto/go.sum .
COPY proto/install.sh .
RUN ./install.sh

RUN mkdir ../server ../printer
COPY proto .
RUN ./generate.sh


FROM golang:alpine AS build-server

WORKDIR /src/server
COPY server/go.mod .
COPY server/go.sum .
RUN go mod download

COPY --from=build-proto /src/server .
COPY server .

RUN go build


FROM --platform=$BUILDPLATFORM node:alpine AS build-ui

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

ENV NODE_OPTIONS=--localstorage-file=./local-storage
RUN yarn build


FROM python:3.10-alpine AS build-printer

WORKDIR /app

RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

RUN apk add build-base jpeg-dev zlib-dev
COPY printer/requirements.txt .
RUN pip install -r requirements.txt


FROM python:3.10-alpine AS printer

RUN apk add zlib jpeg
COPY --from=build-printer /venv /venv
ENV PATH="/venv/bin:$PATH"

WORKDIR /app
COPY --from=build-proto /src/printer .
COPY printer .
EXPOSE 4000
CMD ["uvicorn", "server:app", "--port=4000", "--host=0.0.0.0"]

FROM scratch AS server


WORKDIR /app

COPY --from=build-server /src/server/fonts fonts
COPY --from=build-server /src/server/inventory .
COPY --from=build-ui /src/ui/build ./ui

ENV GIN_MODE=release
EXPOSE 8080
CMD ["./inventory"]
