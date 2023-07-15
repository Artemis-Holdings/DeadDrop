# Build

## NODE
# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:20-buster as client
# Create and change to the app directory.
WORKDIR /app
# Copy local code to the container image.
COPY ./client ./client

WORKDIR /app/client
# Make build folder for webpack (should artifact?)
# Install production dependencies.
RUN npm install
# build into build directory
RUN npm run build 

# REMOVE BEFORE FLIGHT
RUN ls

## RUST 
FROM rust:buster as server

WORKDIR /app

COPY ./server ./server

WORKDIR /app/server

RUN cargo build --release

# FROM debian:buster-slim

# COPY --from=builder ./target/release/docker ./target/release/docke
# r
# CMD ["/target/release/docker"]

## Deploy
# FROM debian:buster
FROM ubuntu:lunar
# RUN apk add bash

# RUN apk add --no-cache ca-certificates

WORKDIR /server

RUN apt-get update && apt-get install postgresql -y

COPY --from=client /app/client/build /server/client_build

COPY --from=server /app/server/target/release/dead_drop_server .

COPY --from=server /app/server/Rocket.toml .

COPY --from=server /app/server/diesel.toml .

ENV DATABASE_URL=postgres://postgres:postgres@localhost:5432/dead_drop

# REMOVE BEFORE FLIGHT
ENV RUST_BACKTRACE=full

RUN chown 1001 /server/dead_drop_server && chmod +x /server/dead_drop_server

EXPOSE 8080

CMD ["/server/dead_drop_server"]
