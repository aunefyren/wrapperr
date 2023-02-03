FROM golang:1.19-alpine

LABEL org.opencontainers.image.source=https://github.com/aunefyren/wrapperr

ENV port=8282

RUN apk update
RUN apk add git

ENV GO111MODULE=on

WORKDIR /app

COPY . .

RUN CGO_ENABLED=0 go build

EXPOSE ${port}

ENTRYPOINT /app/wrapperr -port=${port}
