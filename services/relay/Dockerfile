# LyncZ Relay - Rust Backend for Railway Deployment
# Build version: v4.1 - Fixed binary path
# 
# IMPORTANT: Build this from the repository root, not from services/relay/
#   docker build -f services/relay/Dockerfile -t lyncz-relay .
#
# To build auto-cancel service, set BUILD_TARGET=auto-cancel:
#   docker build -f services/relay/Dockerfile --build-arg BUILD_TARGET=auto-cancel -t auto-cancel .
#
# This is required because the relay depends on the extractor crate
# located at verifiers/alipay/pdf-utils/extractor

FROM rust:1.84.0 as builder

# Build argument to select which binary to build
# Options: lyncz-relay (default) or auto-cancel
ARG BUILD_TARGET=lyncz-relay

WORKDIR /app

# Copy the full monorepo structure needed for the build
# We need: services/relay/* and verifiers/alipay/pdf-utils/extractor/*

# Copy pdf-utils crates (dependencies)
COPY verifiers/alipay/pdf-utils/extractor verifiers/alipay/pdf-utils/extractor
COPY verifiers/alipay/pdf-utils/signature-validator verifiers/alipay/pdf-utils/signature-validator

# Copy relay service
COPY services/relay/Cargo.toml services/relay/Cargo.lock services/relay/
COPY services/relay/src services/relay/src
COPY services/relay/abi services/relay/abi
COPY services/relay/migrations services/relay/migrations
COPY services/relay/.sqlx services/relay/.sqlx

# Build with release profile - uses BUILD_TARGET arg
WORKDIR /app/services/relay
ENV SQLX_OFFLINE=true
RUN cargo build --release --bin ${BUILD_TARGET}

# Runtime stage - smaller image
FROM debian:bookworm-slim

# Re-declare ARG for use in this stage
ARG BUILD_TARGET=lyncz-relay

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the built binary - always use /app/service for Railway compatibility
COPY --from=builder /app/services/relay/target/release/${BUILD_TARGET} /app/service

# Set environment
ENV RUST_LOG=info
ENV BUILD_VERSION=v4.1

# Expose port (Railway will set PORT env var)
EXPOSE 3000

# Run the service binary
CMD ["/app/service"]
