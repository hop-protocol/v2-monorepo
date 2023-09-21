build:
	npm run build

start:
	./bin/server server

.PHONY: test
test:
	npx jest test/controller.test.ts

docker-build:
	docker build --build-arg=GIT_REV=$$(git rev-parse --short HEAD) -f Dockerfile -t hopprotocol/v2-price-oracle .

docker-stop:
	docker stop v2priceoracle; docker kill v2priceoracle; docker rm v2priceoracle;

docker-start:
	docker run --name=v2priceoracle -d --restart=unless-stopped --log-driver local --log-opt max-size=2gb --env-file .env hopprotocol/v2-price-oracle
