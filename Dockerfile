FROM golang:1.19.0-bullseye

ARG TARGETARCH 
ARG TARGETOS 
ENV port=8282

LABEL org.opencontainers.image.source=https://github.com/aunefyren/wrapperr

WORKDIR /app

COPY . .

RUN GO111MODULE=on CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build 

EXPOSE ${port}

ENTRYPOINT /app/wrapperr -port=${port}
