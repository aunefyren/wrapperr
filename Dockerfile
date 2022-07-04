FROM golang:1.18-alpine

ENV port=8282

RUN apk update
RUN apk add git

ENV GO111MODULE=on

WORKDIR /app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build

EXPOSE ${port}

ENTRYPOINT /app/Wrapperr -port=${port}