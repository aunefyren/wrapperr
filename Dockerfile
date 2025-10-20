FROM golang:1.24.0-bullseye as builder

ARG TARGETARCH 
ARG TARGETOS 

WORKDIR /app

COPY . .

RUN GO111MODULE=on CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build

FROM debian:bullseye-slim as runtime
ARG DEBIAN_FRONTEND=noninteractive
LABEL org.opencontainers.image.source=https://github.com/aunefyren/wrapperr

WORKDIR /app

COPY --from=builder /app .

RUN rm /var/lib/dpkg/info/libc-bin.*
RUN apt clean
RUN apt update
RUN apt install -y ca-certificates curl
RUN chmod +x /app/wrapperr /app/entrypoint.sh

ENTRYPOINT /app/entrypoint.sh