FROM golang

ARG TARGETARCH 
ARG TARGETOS 

LABEL org.opencontainers.image.source=https://github.com/aunefyren/wrapperr

ENV port=8282

WORKDIR /app

COPY . .

RUN export GO111MODULE=on
RUN export CGO_ENABLED=0
RUN export GOOS=${TARGETOS}
RUN export GOARCH=${TARGETARCH}

RUN go build 
# CGO_ENABLED=0

EXPOSE ${port}

ENTRYPOINT /app/wrapperr -port=${port}
