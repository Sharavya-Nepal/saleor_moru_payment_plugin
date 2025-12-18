# DigitalOcean Deployment Guide

This guide shows how to deploy the Moru Saleor Payment App to DigitalOcean using Container Registry and App Platform.

## Prerequisites

1. **DigitalOcean Account**: Sign up at [digitalocean.com](https://www.digitalocean.com)
2. **doctl CLI**: Install the DigitalOcean command-line tool
3. **Docker**: Ensure Docker is installed and running
4. **Personal Access Token**: Create one in DigitalOcean dashboard

## Setup Instructions

### 1. Install doctl CLI

**macOS:**
```bash
brew install doctl
```

**Linux:**
```bash
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-1.104.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin
```

**Windows:**
```bash
choco install doctl
```

### 2. Authenticate doctl

```bash
doctl auth init
```

Enter your DigitalOcean Personal Access Token when prompted.

### 3. Create Container Registry

```bash
# Create a registry (one-time setup)
doctl registry create your-registry-name --region nyc3

# Or list existing registries
doctl registry list
```

**Available regions:** `nyc3`, `sfo3`, `ams3`, `sgp1`, `fra1`

### 4. Set Environment Variables

```bash
export DO_REGISTRY_NAME=your-registry-name
export VERSION=v1.0.0
```

Or create a `.env.deploy` file:

```bash
DO_REGISTRY_NAME=your-registry-name
VERSION=v1.0.0
```

## Deployment Methods

### Method 1: Using the Automated Script

Make the script executable and run:

```bash
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh
```

### Method 2: Manual Deployment

#### Step 1: Login to Container Registry

```bash
doctl registry login
```

#### Step 2: Build Docker Image

```bash
docker build -t moru-payment-app:latest .
```

#### Step 3: Tag Image

```bash
docker tag moru-payment-app:latest \
  registry.digitalocean.com/your-registry-name/moru-payment-app:latest
```

#### Step 4: Push to Registry

```bash
docker push registry.digitalocean.com/your-registry-name/moru-payment-app:latest
```

#### Step 5: Verify Upload

```bash
doctl registry repository list-v2
doctl registry repository list-tags moru-payment-app
```

## Deploy to DigitalOcean App Platform

### Option A: Using doctl

Create an `app.yaml` file:

```yaml
name: moru-payment-app
region: nyc

services:
- name: web
  image:
    registry_type: DOCR
    repository: moru-payment-app
    tag: latest
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
  
  envs:
  - key: APL
    value: file
  - key: MORU_API_URL
    value: https://test.moru-gateway.pnpl.com.np/gateway
  - key: MORU_AUTH_KEY
    value: ${MORU_AUTH_KEY}
    type: SECRET
  - key: APP_API_BASE_URL
    value: ${APP_URL}
  - key: NEXT_PUBLIC_STOREFRONT_URL
    value: https://dev.reboncelnepal.com
  - key: NODE_ENV
    value: production
  
  health_check:
    http_path: /api/manifest
    initial_delay_seconds: 10
    period_seconds: 30
    timeout_seconds: 10
    success_threshold: 1
    failure_threshold: 3
```

Deploy:

```bash
doctl apps create --spec app.yaml
```

### Option B: Using DigitalOcean Dashboard

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Select **DigitalOcean Container Registry**
4. Choose your registry and image
5. Configure:
   - **Name**: moru-payment-app
   - **Region**: Choose closest to your users
   - **Instance Size**: Basic (512 MB RAM / $5/mo)
   - **HTTP Port**: 3000

6. Add Environment Variables:
   ```
   APL=file
   MORU_API_URL=https://test.moru-gateway.pnpl.com.np/gateway
   MORU_AUTH_KEY=<your-auth-key>
   APP_API_BASE_URL=${APP_URL}
   NEXT_PUBLIC_STOREFRONT_URL=https://dev.reboncelnepal.com
   NODE_ENV=production
   ```

7. Configure Health Check:
   - **Path**: `/api/manifest`
   - **Port**: 3000

8. Click **Create Resources**

## Production Considerations

### 1. Use Upstash for APL

For production, switch from file-based to Upstash:

```yaml
envs:
- key: APL
  value: upstash
- key: UPSTASH_URL
  value: ${UPSTASH_URL}
  type: SECRET
- key: UPSTASH_TOKEN
  value: ${UPSTASH_TOKEN}
  type: SECRET
```

### 2. Custom Domain

Add your custom domain:

```bash
doctl apps update <app-id> --spec app.yaml
```

Or via dashboard: **Settings** → **Domains** → **Add Domain**

### 3. SSL/TLS

DigitalOcean automatically provisions SSL certificates for:
- App Platform domains (*.ondigitalocean.app)
- Custom domains via Let's Encrypt

### 4. Scaling

Scale your app:

```bash
# Horizontal scaling (more instances)
doctl apps update <app-id> --spec app.yaml  # Update instance_count

# Vertical scaling (bigger instances)
# Available sizes: basic-xxs, basic-xs, basic-s, basic-m, professional-xs, professional-s, professional-m
```

### 5. Monitoring

Enable monitoring:

```bash
doctl apps logs <app-id> --type run --follow
```

Or use the dashboard: **App** → **Runtime Logs**

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to DigitalOcean

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Install doctl
      uses: digitalocean/action-doctl@v2
      with:
        token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
    
    - name: Build image
      run: docker build -t moru-payment-app .
    
    - name: Login to DO Container Registry
      run: doctl registry login --expiry-seconds 600
    
    - name: Tag and push image
      run: |
        docker tag moru-payment-app \
          registry.digitalocean.com/${{ secrets.REGISTRY_NAME }}/moru-payment-app:${{ github.sha }}
        docker push registry.digitalocean.com/${{ secrets.REGISTRY_NAME }}/moru-payment-app:${{ github.sha }}
    
    - name: Update deployment
      run: |
        doctl apps update ${{ secrets.APP_ID }} \
          --image registry.digitalocean.com/${{ secrets.REGISTRY_NAME }}/moru-payment-app:${{ github.sha }}
```

Add these secrets to GitHub:
- `DIGITALOCEAN_ACCESS_TOKEN`
- `REGISTRY_NAME`
- `APP_ID`

## Cost Estimation

### Container Registry
- **Storage**: $0.02/GB per month
- **Transfer**: $0.01/GB (first 500GB free)

### App Platform (Basic Tier)
- **512 MB RAM**: $5/month
- **1 GB RAM**: $12/month
- **2 GB RAM**: $24/month

### Total Estimated Cost
- Development: ~$5-7/month
- Production: ~$12-30/month (depending on instance size)

## Troubleshooting

### Build fails in registry

Check build logs:
```bash
doctl apps logs <app-id> --type build
```

### Container crashes

Check runtime logs:
```bash
doctl apps logs <app-id> --type run --follow
```

### Health check fails

Verify the manifest endpoint:
```bash
curl https://your-app-url.ondigitalocean.app/api/manifest
```

### Registry authentication issues

Re-authenticate:
```bash
doctl registry logout
doctl registry login
```

## Cleanup

Remove app:
```bash
doctl apps delete <app-id>
```

Remove images:
```bash
doctl registry repository delete-manifest moru-payment-app <digest>
```

Remove registry:
```bash
doctl registry delete your-registry-name
```

## Additional Resources

- [DigitalOcean Container Registry Docs](https://docs.digitalocean.com/products/container-registry/)
- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [doctl Reference](https://docs.digitalocean.com/reference/doctl/)
