# FROM golang:1.19.0-bullseye

FROM alpine:latest

ARG TARGETARCH 
ARG TARGETOS 
ENV port=8282

LABEL org.opencontainers.image.source=https://github.com/aunefyren/wrapperr

RUN apk add --no-cache git make musl-dev go

# Configure Go
ENV GOROOT /usr/lib/go
ENV GOPATH /go
ENV PATH /go/bin:$PATH

RUN mkdir -p ${GOPATH}/src ${GOPATH}/bin

# Install Glide
RUN go get -u github.com/Masterminds/glide/...

WORKDIR $GOPATH

CMD ["make"]

WORKDIR /app

COPY . .

RUN GO111MODULE=on CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build 

EXPOSE ${port}

ENTRYPOINT /app/wrapperr -port=${port}
