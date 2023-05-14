# DeadDrop Server
The documentation here relates ONLY to the server directory.

# 🏗️ Building the server locally

## Hardware
We build on UNIX like environments (MacOS || WSL || Linux).
DeadDrop is deployed via Container and Kubernetes. At a minumum you should have docker on your system.

## First Start
1. Using docker, pull postgres:latest
2. Start the postgres container `docker run -p 5432:5432 --env POSTGRES_PASSWORD=postgres postgres`
3. Install depenendcies `npm install`
4. Start the server `npm start`