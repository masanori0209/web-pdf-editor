# 1.53 を使用
FROM rust:latest
RUN apt-get update -y && \
    apt-get install -y nodejs npm && \
    npm install n -g && \
    n lts
RUN PATH="$PATH" && \
    npm -v && node -v
RUN npm install @vue/cli-service @vue/cli -g
RUN cargo install wasm-pack && cargo install cargo-generate
WORKDIR /app