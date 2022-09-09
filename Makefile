SHELL := /bin/bash


setup-initial: client-dep server-dep ## Setup

client-dep: ## Install dependencies
	@cd DeadDrop.ui && yarn install

server-dep: ## Get Go dependencies
	@cd DeadDrop.api && yarn install

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

