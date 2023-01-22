# build client
FROM node:16.19.0-buster as builder

RUN mkdir -p /app

WORKDIR /app 

COPY . /app

RUN cd client && npm install && npm run build

RUN cd server && npm install

# copy build into production server
FROM node:lts-hydrogen

RUN mkdir -p /app

WORKDIR /app

ENV NODE_ENV=production

ENV PORT=8080

EXPOSE ${PORT}

COPY --from=builder /app/server .

CMD ["npm", "start"]



# FROM node:lts-alpine3.17
# # FROM node:latest
# RUN mkdir -p /app

# WORKDIR /app

# COPY /server /app

# ENV RELEASE=production
# ENV PORT=8080

# # RUN apk add make

# # RUN make install
# RUN cd client && npm install && npm run build
# RUN cd server && npm install
# # RUN make build

# EXPOSE ${PORT}

# CMD ["make", "start"]