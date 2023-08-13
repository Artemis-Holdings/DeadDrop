SHELL := /bin/bash

#  install all dependencies then cargo install cargo-watch
setup-dev-env: 
	@DATABASE_URL=postgres://postgres:postgres@localhost:5432/dead_drop
	@cd client && npm install && npm run dev-build
	@cd server && cargo install --path .
	@cargo install cargo-watch
	@cargo install diesel_cli --no-default-features --features postgres

setup-dev-database:
	@docker run -d --name postgresql -e POSTGRESQL_PASSWORD=postgres -e POSTGRESQL_USERNAME=postgres -e POSTGRESQL_DATABASE=dead_drop -p 5432:5432 bitnami/postgresql:latest
	@sleep 5
	@cd server && diesel migration run


logs: ## Logs the backend
	@docker logs -f shepherd_server

## Start Docker Containers
# @docker-compose --file docker-compose.yaml up -d --build
dev-up: setup-dev-env setup-dev-database ## Start Docker Containers 
	@cd server && cargo watch -x run

down:
	@docker-compose down

amends: # ONLY USE DURING PIPELINE WORK. Pushes all current changes via an ammend.
	@git add -A && git commit --amend --no-edit --no-verify && git push -fu

help: ## Display this help screen
	@grep -h -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# SERVER
watch-server:
	@cd server && cargo watch -x run

server-check: ## Check the server
	@cd server && cargo check
