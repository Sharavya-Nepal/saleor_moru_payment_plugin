#!/bin/bash
# DigitalOcean Container Registry Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY_NAME="${DO_REGISTRY_NAME:-reboncel}"
IMAGE_NAME="moru-payment-app"
VERSION="${VERSION:-latest}"
FULL_IMAGE_NAME="registry.digitalocean.com/${REGISTRY_NAME}/${IMAGE_NAME}:${VERSION}"

echo -e "${GREEN}=== DigitalOcean Container Deployment ===${NC}"

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo -e "${RED}Error: doctl CLI not found${NC}"
    echo "Install it from: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Step 1: Authenticate with DigitalOcean Container Registry
echo -e "${YELLOW}Step 1: Authenticating with DigitalOcean Container Registry...${NC}"
doctl registry login

# Step 2: Build the Docker image
echo -e "${YELLOW}Step 2: Building Docker image for amd64 platform...${NC}"
docker buildx build --platform linux/amd64 -t ${IMAGE_NAME}:${VERSION} --load .

# Step 3: Tag the image for DigitalOcean Registry
echo -e "${YELLOW}Step 3: Tagging image for registry...${NC}"
docker tag ${IMAGE_NAME}:${VERSION} ${FULL_IMAGE_NAME}

# Step 4: Push to DigitalOcean Container Registry
echo -e "${YELLOW}Step 4: Pushing image to registry...${NC}"
docker push ${FULL_IMAGE_NAME}

# Step 5: Clean up local images (optional)
read -p "Do you want to remove local images to free up space? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cleaning up local images...${NC}"
    docker rmi ${IMAGE_NAME}:${VERSION} || true
    docker rmi ${FULL_IMAGE_NAME} || true
fi

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "Image pushed to: ${FULL_IMAGE_NAME}"
echo ""
echo "Next steps:"
echo "1. Deploy using DigitalOcean App Platform or Kubernetes"
echo "2. Set environment variables in your deployment"
echo "3. Configure your domain and SSL"
