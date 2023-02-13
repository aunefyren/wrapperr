# FROM golang:1.19.0-bullseye

FROM ubuntu:latest

ARG TARGETARCH 
ARG TARGETOS 
ENV port=8282

LABEL org.opencontainers.image.source=https://github.com/aunefyren/wrapperr

RUN apt update
RUN apt upgrade
RUN apk install -y golang-go 

WORKDIR /app

COPY . .

RUN GO111MODULE=on CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build 

EXPOSE ${port}

ENTRYPOINT /app/wrapperr -port=${port}
