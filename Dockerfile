FROM golang:1.25-bookworm AS builder

ARG TARGETARCH
ARG TARGETOS

WORKDIR /app

COPY . .

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build

FROM debian:bookworm-slim AS runtime
ARG DEBIAN_FRONTEND=noninteractive
LABEL org.opencontainers.image.source=https://github.com/aunefyren/wrapperr

# UID/GID the container drops to at runtime (see entrypoint.sh).
# Override these to match the owner of the mounted ./config volume.
ENV PUID=1000
ENV PGID=1000

WORKDIR /app

COPY --from=builder /app .

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates curl \
	&& rm -rf /var/lib/apt/lists/* \
	&& chmod +x /app/wrapperr /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
