build:
	npm run build

start:
	./bin/server server

.PHONY: test
test:
	npx jest test/controller.test.ts

# Build docker target
docker-build:
	docker build --build-arg=GIT_REV=$$(git rev-parse --short HEAD) -f Dockerfile -t hopprotocol/v2-gas-price-oracle .

# Tag docker image with latest
docker-image-tag-latest:
	docker tag hopprotocol/v2-gas-price-oracle:latest hopprotocol/v2-gas-price-oracle:latest

# Tag docker image
docker-image-tag:
	$(eval REV=$(shell git rev-parse HEAD | cut -c1-7))
	$(eval BRANCH=$(shell git branch --show-current))
	docker tag hopprotocol/v2-gas-price-oracle:latest hopprotocol/v2-gas-price-oracle:$(REV)
	docker tag hopprotocol/v2-gas-price-oracle:latest hopprotocol/v2-gas-price-oracle:$(BRANCH)

# Push to registry
docker-registry-push:
	$(eval REV=$(shell git rev-parse HEAD | cut -c1-7))
	$(eval BRANCH=$(shell git branch --show-current))
	docker push hopprotocol/v2-gas-price-oracle:latest
	docker push hopprotocol/v2-gas-price-oracle:$(REV)
	docker push hopprotocol/v2-gas-price-oracle:$(BRANCH)

# Build docker image and push to registry
docker-build-and-push: docker-build docker-image-tag docker-registry-push

# Tag docker and push to registry
docker-tag-and-push: docker-image-tag docker-registry-push

docker-stop:
	docker stop v2priceoracle; docker kill v2priceoracle; docker rm v2priceoracle;

docker-start:
	docker run -d --name=v2priceoracle --restart=unless-stopped --log-driver local --log-opt max-size=2gb --env-file .env -p 8000:8000 -v ./mydb:/tmp/mydb hopprotocol/v2-gas-price-oracle
