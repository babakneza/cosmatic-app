# VPS Docker Deployment Guide

## Overview
This guide deploys the Next.js app alongside your existing Directus CMS on your Ubuntu VPS using Docker with `network_mode: host`.

---

## Prerequisites

✅ Already on your VPS:
- Docker installed
- Docker Compose installed
- PostgreSQL running (for Directus database)
- Directus container running on port 8055

---

## Step 1: Upload Code to VPS

**Option A: Using Git (Recommended)**
```bash
ssh username@your_vps_ip
cd /opt  # or your preferred directory
git clone https://github.com/your-repo/cosmatic_app_directus.git
cd cosmatic_app_directus
```

**Option B: Using SCP**
```bash
# On your local machine
scp -r c:\projects\cosmatic_app_directus username@your_vps_ip:/opt/
ssh username@your_vps_ip
cd /opt/cosmatic_app_directus
```

---

## Step 2: Configure Environment Variables

```bash
# Copy the VPS environment template
cp .env.vps .env

# Edit with your actual values
nano .env
```

**Required changes in .env:**

```bash
# Get your Directus API Token:
# 1. Log in to your Directus admin: https://admin.buyjan.com
# 2. Go to Settings → API Tokens
# 3. Create or copy a static token
DIRECTUS_API_TOKEN=your_actual_token_here
NEXT_PUBLIC_DIRECTUS_API_TOKEN=your_actual_token_here

# Database password (should match your existing Directus setup)
DB_PASSWORD=Bb7887055@Tt

# Generate secure keys using:
# openssl rand -base64 32    # for DIRECTUS_KEY
# openssl rand -base64 64    # for DIRECTUS_SECRET
DIRECTUS_SECRET=your-64-char-key-here
DIRECTUS_KEY=your-32-char-key-here

# Public role ID (from your existing Directus)
PUBLIC_ROLE=2c9b012f-3c7c-440f-b8e7-4b79beb25dc4
```

---

## Step 3: Build and Start Containers

```bash
# Navigate to project directory
cd /opt/cosmatic_app_directus

# Build the Next.js Docker image
docker-compose -f docker-compose-vps.yml build

# Start both containers
docker-compose -f docker-compose-vps.yml up -d

# Check status
docker-compose -f docker-compose-vps.yml ps
```

---

## Step 4: Verify Deployment

```bash
# Check if containers are running
docker ps | grep -E 'nextjs|directus'

# View Next.js app logs
docker logs -f cosmatic-app

# View Directus logs
docker logs -f directus

# Test Next.js app (from VPS)
curl http://localhost:3000

# Test Directus API (from VPS)
curl http://localhost:8055/admin
```

---

## Step 5: Configure Nginx (Optional but Recommended)

If you want to proxy both through Nginx:

```nginx
# /etc/nginx/sites-available/buyjan.com
server {
    listen 443 ssl http2;
    server_name buyjan.com;
    
    ssl_certificate /path/to/cert;
    ssl_certificate_key /path/to/key;
    
    # Next.js Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name admin.buyjan.com;
    
    ssl_certificate /path/to/cert;
    ssl_certificate_key /path/to/key;
    
    # Directus CMS
    location / {
        proxy_pass http://localhost:8055;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Common Commands

```bash
# View running containers
docker-compose -f docker-compose-vps.yml ps

# View logs (all)
docker-compose -f docker-compose-vps.yml logs -f

# View logs (specific service)
docker-compose -f docker-compose-vps.yml logs -f nextjs-app

# Stop containers
docker-compose -f docker-compose-vps.yml stop

# Start containers
docker-compose -f docker-compose-vps.yml start

# Restart containers
docker-compose -f docker-compose-vps.yml restart

# Remove containers
docker-compose -f docker-compose-vps.yml down

# Rebuild (after code changes)
docker-compose -f docker-compose-vps.yml build --no-cache
docker-compose -f docker-compose-vps.yml up -d
```

---

## Troubleshooting

### ❌ Port 3000 already in use
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>

# Or change the port in docker-compose-vps.yml
```

### ❌ Cannot connect to Directus
```bash
# Check Directus is running
docker ps | grep directus

# Check logs
docker logs directus | tail -50

# Verify PostgreSQL is accessible
psql -h localhost -U directususer -d directus -c "SELECT 1;"
```

### ❌ Next.js container won't start
```bash
# Check build logs
docker-compose -f docker-compose-vps.yml build

# View detailed logs
docker logs cosmatic-app

# Common issues:
# - Missing environment variables
# - Port already in use
# - Node modules not installed properly
```

### ❌ API token not working
```bash
# Get from Directus admin panel
# 1. Open https://admin.buyjan.com
# 2. Admin Settings → API Tokens
# 3. Copy static token value

# Update .env
DIRECTUS_API_TOKEN=your_token
NEXT_PUBLIC_DIRECTUS_API_TOKEN=your_token

# Restart container
docker-compose -f docker-compose-vps.yml restart nextjs-app
```

---

## Updating Code

When you update your code:

```bash
# Pull latest changes
cd /opt/cosmatic_app_directus
git pull origin main

# Rebuild Docker image
docker-compose -f docker-compose-vps.yml build --no-cache

# Restart containers
docker-compose -f docker-compose-vps.yml restart
```

---

## Performance Monitoring

```bash
# Monitor container resources
docker stats

# Check disk usage
docker system df

# Clean up unused images/volumes
docker system prune -a
```

---

## Production Checklist

- ✅ Environment variables configured in `.env`
- ✅ API tokens obtained from Directus
- ✅ SSL/TLS certificates configured in Nginx
- ✅ Backup strategy for PostgreSQL database
- ✅ Log rotation configured
- ✅ Health checks enabled
- ✅ Restart policies set to `unless-stopped`
- ✅ CORS properly configured
- ✅ Rate limiting configured (if needed)

---

## Need Help?

Check logs for errors:
```bash
docker-compose -f docker-compose-vps.yml logs nextjs-app
docker-compose -f docker-compose-vps.yml logs directus
```

Common issues are usually in environment variable configuration or network connectivity between containers.