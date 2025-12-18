# Docker Deployment Guide

This guide explains how to build and run the Moru Saleor Payment App using Docker.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher (optional, for docker-compose deployment)
- Environment variables configured in `.env` file

## Configuration

Before building the Docker image, ensure your `.env` file contains all required variables:

```bash
# Saleor Configuration
APL=file

# Moru Payment Gateway Configuration
MORU_API_URL=https://test.moru-gateway.pnpl.com.np/gateway
MORU_AUTH_KEY=your_auth_key_here

# App Configuration
APP_DEBUG=false
APP_API_BASE_URL=https://your-app-url.com

# Storefront URL
NEXT_PUBLIC_STOREFRONT_URL=https://your-storefront-url.com
```

## Building the Docker Image

### Option 1: Using Docker

Build the image:

```bash
docker build -t moru-payment-app:latest .
```

Run the container:

```bash
docker run -d \
  --name moru-payment-app \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/.saleor-app-auth:/app/.saleor-app-auth \
  moru-payment-app:latest
```

### Option 2: Using Docker Compose

Build and start the service:

```bash
docker-compose up -d
```

Stop the service:

```bash
docker-compose down
```

View logs:

```bash
docker-compose logs -f moru-payment-app
```

## Accessing the Application

Once running, the application will be available at:

- Local: `http://localhost:3000`
- Manifest: `http://localhost:3000/api/manifest`

## Production Deployment

### Environment Variables

For production, consider using environment-specific configurations:

1. **APL (Auth Persistence Layer)**: Switch from `file` to `upstash` for scalability
2. **Set production URLs** for `APP_API_BASE_URL` and `NEXT_PUBLIC_STOREFRONT_URL`
3. **Use production Moru credentials** instead of test credentials

Example production `.env`:

```bash
# Saleor Configuration
APL=upstash
UPSTASH_URL=https://your-upstash-instance.upstash.io
UPSTASH_TOKEN=your_upstash_token

# Moru Payment Gateway Configuration
MORU_API_URL=https://production.moru-gateway.pnpl.com.np/gateway
MORU_AUTH_KEY=production_auth_key

# App Configuration
APP_DEBUG=false
APP_API_BASE_URL=https://moru-payment.your-domain.com
NEXT_PUBLIC_STOREFRONT_URL=https://your-storefront.com
```

### Health Checks

The Docker image includes a health check endpoint that verifies the application is running correctly:

```bash
curl http://localhost:3000/api/manifest
```

### Volume Persistence

The container uses a volume to persist authentication data:

- **Volume**: `app-auth-data:/app/.saleor-app-auth`
- **Purpose**: Stores Saleor app authentication tokens

To back up authentication data:

```bash
docker run --rm -v app-auth-data:/data -v $(pwd):/backup alpine tar czf /backup/auth-backup.tar.gz -C /data .
```

To restore:

```bash
docker run --rm -v app-auth-data:/data -v $(pwd):/backup alpine tar xzf /backup/auth-backup.tar.gz -C /data
```

## Troubleshooting

### Container won't start

Check logs:

```bash
docker logs moru-payment-app
# OR with docker-compose
docker-compose logs moru-payment-app
```

### Permission issues

Ensure the container has proper permissions for the volume:

```bash
docker exec moru-payment-app ls -la /app/.saleor-app-auth
```

### Network connectivity

Verify the container can reach external services:

```bash
docker exec moru-payment-app wget --spider https://test.moru-gateway.pnpl.com.np/gateway
```

### Rebuild after changes

```bash
# Docker
docker build --no-cache -t moru-payment-app:latest .

# Docker Compose
docker-compose build --no-cache
docker-compose up -d
```

## Image Optimization

The Dockerfile uses multi-stage builds for optimal image size:

- **Stage 1 (deps)**: Installs dependencies
- **Stage 2 (builder)**: Builds the application
- **Stage 3 (runner)**: Minimal runtime image

Final image size is optimized by:
- Using Alpine Linux base
- Only copying necessary runtime files
- Running as non-root user for security

## Security Best Practices

1. **Non-root user**: Application runs as `nextjs` user (UID 1001)
2. **Environment secrets**: Never commit `.env` files with production credentials
3. **Network isolation**: Use Docker networks to isolate services
4. **Regular updates**: Keep base images updated

## Scaling

For production deployments with high traffic:

1. **Use orchestration**: Deploy with Kubernetes or Docker Swarm
2. **Load balancing**: Put multiple containers behind a load balancer
3. **Upstash APL**: Switch from file-based to Upstash for distributed auth
4. **External secrets**: Use Docker secrets or external secret management
