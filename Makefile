init:
	docker-compose run app npm install
	docker-compose up -d
up:
	docker-compose down
	docker-compose up -d
down:
	docker-compose down
build:
	docker-compose build
comp:
	docker-compose exec app /bin/bash -c "cd wasm && wasm-pack build"
logs:
	docker-compose logs -f
ps:
	docker-compose ps
deploy:
	cp -r .git ./front
	docker-compose exec front npm run build
	docker-compose exec front npm run deploy
	rm -rf ./front/.git