FROM golang:1.23.4-bullseye as builder

ARG TARGETARCH 
ARG TARGETOS 

WORKDIR /app

COPY . .

RUN GO111MODULE=on CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build

FROM debian:bullseye-slim as runtime

ENV port=8282

LABEL org.opencontainers.image.source=https://github.com/aunefyren/wrapperr

WORKDIR /app

COPY --from=builder /app .

RUN apt update
RUN apt install -y curl

EXPOSE ${port}

ENTRYPOINT /app/wrapperr -port=${port}
