# Docker Setup Guide for BuyJan E-commerce Application

This guide explains how to build and run your Next.js application using Docker.

## Files Created

- **Dockerfile** - Multi-stage production build configuration
- **docker-compose.yml** - Docker Compose configuration for easy container management
- **.dockerignore** - Files to exclude from Docker build context
- **.env.docker** - Environment variables template for Docker

## Prerequisites

- Docker installed on your system ([Download Docker Desktop](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Set Up Environment Variables

First, copy the environment template and add your Directus credentials:

```bash
# Create .env.local or use .env.docker
cp .env.local.example .env.local
```

Edit `.env.local` and add your Directus API token:
```
DIRECTUS_API_TOKEN=your_actual_token_here
NEXT_PUBLIC_DIRECTUS_API_TOKEN=your_actual_token_here
```

### 2. Build the Docker Image

Using Docker Compose (Recommended):
```bash
docker-compose build
```

Or using Docker directly:
```bash
docker build -t cosmatic-app:latest .
```

### 3. Run the Container

Using Docker Compose:
```bash
docker-compose up -d
```

Or using Docker directly:
```bash
docker run -d \
  --name cosmatic-app \
  -p 3000:3000 \
  --env-file .env.local \
  cosmatic-app:latest
```

### 4. Access Your Application

Open your browser and navigate to: **http://localhost:3000**

## Commands Reference

### Docker Compose Commands

```bash
# Start containers in the background
docker-compose up -d

# Start containers and view logs
docker-compose up

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app

# Rebuild after code changes
docker-compose build --no-cache
docker-compose up -d

# Remove everything (containers, volumes, networks)
docker-compose down -v
```

### Docker Commands

```bash
# Build image
docker build -t cosmatic-app:latest .

# Run container
docker run -d -p 3000:3000 --env-file .env.local cosmatic-app:latest

# View running containers
docker ps

# View container logs
docker logs -f <container_id>

# Stop container
docker stop <container_id>

# Remove container
docker rm <container_id>

# Remove image
docker rmi cosmatic-app:latest
```

## Environment Variables

Required variables (set in `.env.local`):

```
NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com
NEXT_PUBLIC_SITE_URL=https://buyjan.com
DIRECTUS_API_TOKEN=your_token_here
NEXT_PUBLIC_DIRECTUS_API_TOKEN=your_token_here
NODE_ENV=production
```

## Production Deployment

### AWS ECS Example

1. **Push to ECR (Elastic Container Registry)**:
```bash
# Create ECR repository
aws ecr create-repository --repository-name cosmatic-app

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag cosmatic-app:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/cosmatic-app:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/cosmatic-app:latest
```

2. **Deploy to ECS Cluster** - Use AWS Console or CLI

### Docker Hub Example

```bash
# Tag image
docker tag cosmatic-app:latest yourusername/cosmatic-app:latest

# Push to Docker Hub
docker push yourusername/cosmatic-app:latest

# Others can run it with:
docker run -p 3000:3000 --env-file .env.local yourusername/cosmatic-app:latest
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Verify image was built
docker images | grep cosmatic

# Check if port 3000 is in use
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000
```

### Environment variables not loaded

```bash
# Verify .env.local exists and has correct values
cat .env.local

# Pass env file explicitly
docker-compose --env-file .env.local up
```

### Port 3000 already in use

```bash
# Use different port
docker-compose -f docker-compose.yml up -d
# Then modify docker-compose.yml ports: "3001:3000"

# Or kill existing process on port 3000
# Windows: taskkill /PID <pid> /F
# Mac/Linux: kill -9 <pid>
```

### Container exits immediately

```bash
# Check exit code
docker logs <container_id>

# Common issues:
# 1. Missing environment variables
# 2. Port already in use
# 3. Build errors
```

## Performance Optimization

### Image Size Optimization

The multi-stage build reduces image size by:
- Building dependencies in one stage
- Copying only necessary files to final stage
- Using lightweight Alpine Linux base

Current approximate sizes:
- Builder stage: ~600MB (not included in final image)
- Final image: ~200-250MB

### Container Performance

1. **Memory Limits** - Uncomment in docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      memory: 512M
```

2. **CPU Limits** - Set CPU cores:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
```

## Security Best Practices

✅ **Already Implemented**:
- Non-root user (nodejs:1001)
- Multi-stage build to minimize attack surface
- Production dependencies only
- Health checks enabled

✅ **Additional Recommendations**:
1. Use environment variables for sensitive data
2. Scan images for vulnerabilities:
   ```bash
   docker scan cosmatic-app:latest
   ```
3. Keep Docker and base images updated
4. Use registry secrets for private registries
5. Implement network policies in production

## Scaling

For production with multiple replicas:

```bash
# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml cosmatic

# Kubernetes
kubectl apply -f k8s-deployment.yaml
```

## Next Steps

1. ✅ Set up Docker locally
2. ✅ Build and run the container
3. ✅ Test the application
4. ✅ Push to registry (Docker Hub/ECR/GCR)
5. ✅ Deploy to production environment

For questions or issues, check the main README.md or deployment guides.