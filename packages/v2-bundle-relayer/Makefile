# Build docker target
docker-build:
	docker build --build-arg=GIT_REV=$$(git rev-parse --short HEAD) -f Dockerfile -t hopprotocol/v2-bundle-relayer .

# Tag docker image with latest
docker-image-tag-latest:
	docker tag hopprotocol/v2-bundle-relayer:latest hopprotocol/v2-bundle-relayer:latest

# Tag docker image
docker-image-tag:
	$(eval REV=$(shell git rev-parse HEAD | cut -c1-7))
	$(eval BRANCH=$(shell git branch --show-current))
	docker tag hopprotocol/v2-bundle-relayer:latest hopprotocol/v2-bundle-relayer:$(REV)
	docker tag hopprotocol/v2-bundle-relayer:latest hopprotocol/v2-bundle-relayer:$(BRANCH)

# Push to registry
docker-registry-push:
	$(eval REV=$(shell git rev-parse HEAD | cut -c1-7))
	$(eval BRANCH=$(shell git branch --show-current))
	docker push hopprotocol/v2-bundle-relayer:latest
	docker push hopprotocol/v2-bundle-relayer:$(REV)
	docker push hopprotocol/v2-bundle-relayer:$(BRANCH)

# Build docker image and push to registry
docker-build-and-push: docker-build docker-image-tag docker-registry-push

# Tag docker and push to registry
docker-tag-and-push: docker-image-tag docker-registry-push

docker-start:
	docker run --env-file .env hopprotocol/v2-bundle-relayer

