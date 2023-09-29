build:
	npm run build

start:
	./bin/server server

.PHONY: test
test:
	npx jest test/controller.test.ts

# Build docker target
docker-build:
	docker build --build-arg=GIT_REV=$$(git rev-parse --short HEAD) -f Dockerfile -t hopprotocol/v2-message-relayer .

# Tag docker image with latest
docker-image-tag-latest:
	docker tag hopprotocol/v2-message-relayer:latest hopprotocol/v2-message-relayer:latest

# Tag docker image
docker-image-tag:
	$(eval REV=$(shell git rev-parse HEAD | cut -c1-7))
	$(eval BRANCH=$(shell git branch --show-current))
	docker tag hopprotocol/v2-message-relayer:latest hopprotocol/v2-message-relayer:$(REV)
	docker tag hopprotocol/v2-message-relayer:latest hopprotocol/v2-message-relayer:$(BRANCH)

# Push to registry
docker-registry-push:
	$(eval REV=$(shell git rev-parse HEAD | cut -c1-7))
	$(eval BRANCH=$(shell git branch --show-current))
	docker push hopprotocol/v2-message-relayer:latest
	docker push hopprotocol/v2-message-relayer:$(REV)
	docker push hopprotocol/v2-message-relayer:$(BRANCH)

# Build docker image and push to registry
docker-build-and-push: docker-build docker-image-tag docker-registry-push

# Tag docker and push to registry
docker-tag-and-push: docker-image-tag docker-registry-push

docker-stop:
	docker stop v2messagerelayer; docker kill v2messagerelayer; docker rm v2messagerelayer;

docker-start:
	docker run -d --name=v2messagerelayer --restart=unless-stopped --log-driver local --log-opt max-size=2gb --env-file .env -p 8000:8000 hopprotocol/v2-message-relayer
