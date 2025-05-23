include .env

db:
	docker compose exec shopify_db psql -U ${DB_USER} ${DB_NAME}

build-up:
	docker compose -f docker-compose.local.yml up --build -d

down:
	docker compose -f docker-compose.local.yml down