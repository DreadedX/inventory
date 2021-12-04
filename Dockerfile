FROM golang as build-server

WORKDIR /src
COPY server/go.mod .
COPY server/go.sum .

RUN go mod download

COPY server .
RUN go build


FROM node:alpine as build-ui

WORKDIR /src
COPY ui/package.json .
COPY ui/yarn.lock .
RUN yarn

COPY ui .
RUN yarn build


FROM python

WORKDIR /app

RUN mkdir ./print
COPY print/requirements.txt ./print
RUN cd ./print && pip install -r requirements.txt

COPY print ./print

COPY --from=build-server /src/fonts fonts
COPY --from=build-server /src/inventory .
COPY --from=build-ui /src/build ./ui

CMD ["./inventory"]
