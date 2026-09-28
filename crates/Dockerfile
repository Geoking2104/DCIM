FROM rust:1.90-bookworm AS build
WORKDIR /src
COPY Cargo.toml Cargo.lock* ./
COPY qinode-auth ./qinode-auth
COPY qinode-core ./qinode-core
COPY qinode-gateway ./qinode-gateway
COPY qinode-graph ./qinode-graph
COPY qinode-ingest ./qinode-ingest
COPY qinode-timeseries ./qinode-timeseries
RUN cargo build --release -p qinode-gateway

FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && groupadd --gid 10001 qinode \
    && useradd --uid 10001 --gid 10001 --no-create-home --shell /usr/sbin/nologin qinode \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /src/target/release/qinode-gateway /usr/local/bin/qinode-gateway
ENV LISTEN=0.0.0.0:8088
EXPOSE 8088
USER 10001:10001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD ["curl", "--fail", "--silent", "http://127.0.0.1:8088/health/live"]
CMD ["qinode-gateway"]
