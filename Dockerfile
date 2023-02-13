FROM golang:1.19-bullseye

LABEL org.opencontainers.image.source=https://github.com/aunefyren/wrapperr

ENV port=8282

ENV GO111MODULE=on

WORKDIR /app

COPY . .

RUN go build 
# CGO_ENABLED=0

EXPOSE ${port}

ENTRYPOINT /app/wrapperr -port=${port}
