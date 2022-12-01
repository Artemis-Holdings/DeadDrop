# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:lts-buster as client
# Create and change to the app directory.
RUN mkdir app
WORKDIR /app
# RUN npm install --global --force yarn
# Copy local code to the container image.
COPY /client ./
# Install production dependencies.
RUN npm install --frozen-lockfile
# build into build directory
RUN npm run build


# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:lts-buster as server
# Create and change to the app directory.
RUN mkdir app
WORKDIR /app
# RUN npm install --global --force yarn
# Copy local code to the container image.
COPY /server ./
# Install production dependencies.
RUN npm install --frozen-lockfile
# build into build directory
RUN npm run build



# # Use the official Alpine image for a lean production container.
# # https://hub.docker.com/_/alpine
# # https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds
FROM alpine:3.16
RUN apk add --no-cache ca-certificates
# Copy the binary to the production image from the builder stage.
# COPY /root/server/bin/mhub-server /server
COPY --from=client /app/client/build /client
COPY --from=server /app/client/build /server

WORKDIR /server

EXPOSE 8000
USER 1001
# Run the web service on container startup.
CMD ["/mhub/server/mhub-server"]