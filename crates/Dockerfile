FROM rust:1.82-bookworm AS build
WORKDIR /src
COPY Cargo.toml Cargo.lock* ./
COPY qinode-core ./qinode-core
COPY qinode-gateway ./qinode-gateway
RUN cargo build --release -p qinode-gateway

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build /src/target/release/qinode-gateway /usr/local/bin/qinode-gateway
ENV LISTEN=0.0.0.0:8088
EXPOSE 8088
CMD ["qinode-gateway"]
