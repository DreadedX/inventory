FROM golang as build-server

WORKDIR /src
COPY server/go.mod .
COPY server/go.sum .

RUN go mod download -x

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

RUN apt-get update && apt-get install -y poppler-utils

WORKDIR /app
RUN mkdir -p /root/.fonts
COPY fonts/SourceCodePro-Regular.ttf /root/.fonts
RUN fc-cache -f /root/.fonts

RUN mkdir ./label
COPY label/requirements.txt ./label
RUN cd ./label && pip install -r requirements.txt

COPY label ./label

COPY --from=build-server /src/inventory .
COPY --from=build-ui /src/build ./ui

CMD ["./inventory"]
