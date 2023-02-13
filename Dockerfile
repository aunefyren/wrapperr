FROM golang

ARG TARGETARCH 
ARG TARGETOS 

LABEL org.opencontainers.image.source=https://github.com/aunefyren/wrapperr

ENV port=8282

WORKDIR /app

COPY . .

RUN GO111MODULE=on CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build 

EXPOSE ${port}

ENTRYPOINT /app/wrapperr -port=${port}
