SHELL := /bin/bash

#  install all dependencies then cargo install cargo-watch
setup-dev: 
	@cd client && npm install
	@cd server && cargo install --path .
	@cargo install cargo-watch
	@cargo install diesel_cli --no-default-features --features postgres

# CLIENT
client-build: ## Build the client
	@cd client && npm run build

# kill-servers:
# 	@pkill -f bin/shepherd-server || true

logs: ## Logs the backend
	@docker logs -f shepherd_server

## Start Docker Containers
up: 
	@docker-compose --file docker-compose.yaml up -d --build

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
