# 🚀 Quick Deployment Guide - BuyJan E-Commerce

## Pre-Deployment Checklist (5 minutes)

- [ ] Environment variables set for production
- [ ] Directus API token is valid and not expired  
- [ ] All collections exist in Directus CMS
- [ ] Domain SSL certificates are valid
- [ ] Server has Node.js 18+ and npm installed

---

## Build & Deploy Steps

### Step 1: Prepare Environment
```bash
# Create production environment file
cat > .env.production.local << EOF
NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com
NEXT_PUBLIC_SITE_URL=https://buyjan.com
DIRECTUS_API_TOKEN=<YOUR_SECURE_TOKEN>
NEXT_PUBLIC_DIRECTUS_API_TOKEN=<YOUR_SECURE_TOKEN>
NODE_ENV=production
EOF
```

### Step 2: Build Production Bundle
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Expected output: ✓ Compiled successfully
```

### Step 3: Test Build Locally (Optional)
```bash
# Run production server locally
npm start

# Visit http://localhost:3000
# Test key flows:
# - Homepage loads
# - Products display
# - Checkout flow works
# - Authentication works
```

### Step 4: Deploy to Server

#### Option A: Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start npm --name "buyjan" -- start

# Save PM2 process list to auto-restart on reboot
pm2 save
pm2 startup

# Monitor the app
pm2 logs buyjan
pm2 monit
```

#### Option B: Using Systemd
```bash
# Create service file
sudo tee /etc/systemd/system/buyjan.service > /dev/null << EOF
[Unit]
Description=BuyJan E-Commerce Application
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/buyjan
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
User=www-data

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable buyjan
sudo systemctl start buyjan

# Check status
sudo systemctl status buyjan
```

#### Option C: Using Docker (Recommended for Production)
```bash
# Create Dockerfile if not exists
docker build -t buyjan:latest .

# Run container
docker run -d \
  --name buyjan \
  -p 3000:3000 \
  -e NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com \
  -e NEXT_PUBLIC_SITE_URL=https://buyjan.com \
  -e DIRECTUS_API_TOKEN=<YOUR_TOKEN> \
  -e NEXT_PUBLIC_DIRECTUS_API_TOKEN=<YOUR_TOKEN> \
  -e NODE_ENV=production \
  --restart=always \
  buyjan:latest
```

### Step 5: Configure Reverse Proxy (Nginx)

```bash
# Create nginx config
sudo tee /etc/nginx/sites-available/buyjan > /dev/null << 'EOF'
upstream buyjan_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name buyjan.com www.buyjan.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name buyjan.com www.buyjan.com;

    ssl_certificate /etc/letsencrypt/live/buyjan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/buyjan.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    gzip on;
    gzip_types text/plain text/css text/javascript application/json application/javascript;
    gzip_min_length 1000;

    location / {
        proxy_pass http://buyjan_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /public/ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/buyjan /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Step 6: Set Up SSL Certificate

```bash
# Using Let's Encrypt (Free)
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d buyjan.com -d www.buyjan.com

# Auto-renewal (already enabled)
sudo systemctl enable certbot.timer
```

---

## ✅ Post-Deployment Verification

### Immediate Checks (5 minutes)
```bash
# 1. Check if server is running
curl -I https://buyjan.com

# Expected: HTTP/1.1 200 OK

# 2. Check logs
pm2 logs buyjan  # or  systemctl status buyjan

# 3. Test homepage
curl https://buyjan.com | grep -i "buyjan"

# 4. Test API connectivity
curl https://admin.buyjan.com/api/system/info
```

### Functional Tests (15 minutes)
- [ ] Browse homepage - loads correctly
- [ ] View products - displays with images
- [ ] Search functionality - works
- [ ] Add to cart - items persist
- [ ] Checkout flow - completes successfully
- [ ] Login/Register - authentication works
- [ ] Account page - user data displays
- [ ] Both languages - Arabic/English switch

---

## 🔍 Monitoring & Maintenance

### Daily Checks
```bash
# Check application status
pm2 status
systemctl status buyjan

# Check server resources
free -h       # Memory
df -h         # Disk space
top -b -n 1   # CPU usage
```

### Weekly Tasks
- Review error logs
- Check database backup status
- Monitor performance metrics
- Update dependencies if needed

### Monthly Tasks
- SSL certificate renewal check
- Database optimization
- Performance analysis
- Security updates

---

## ⚠️ Troubleshooting

### Issue: Application won't start
```bash
# Check if port is already in use
sudo lsof -i :3000

# Check logs for errors
pm2 logs buyjan --err

# Restart application
pm2 restart buyjan
```

### Issue: Directus API not responding
```bash
# Verify connectivity to Directus
curl https://admin.buyjan.com/api/system/info

# Check API token validity
# Go to Directus admin panel and verify token hasn't expired
```

### Issue: High memory usage
```bash
# Check for memory leaks
pm2 logs buyjan

# Restart application
pm2 restart buyjan

# Monitor memory growth
pm2 monit
```

### Issue: Slow response times
```bash
# Check CPU usage
top

# Check database queries (in Directus admin)
# Enable caching in next.config.js
# Implement Redis caching for API responses
```

---

## 📊 Performance Optimization (Optional)

### Enable Redis Caching
```javascript
// Add to next.config.js
experimental: {
  isrMemoryCacheSize: 50 * 1024 * 1024, // 50MB ISR cache
}
```

### Enable Image Optimization
Images are already configured to use Directus processing:
```
https://admin.buyjan.com/assets/[asset_id]?fit=contain&width=800
```

### Monitor Performance
```bash
# Using Next.js built-in analytics
# Install WebVitals monitoring

# Or use external services:
# - Sentry for error tracking
# - DataDog for performance monitoring
# - New Relic for APM
```

---

## 🔐 Security Checklist

- [ ] HTTPS/SSL enabled (all traffic)
- [ ] Security headers configured (nginx)
- [ ] API tokens stored securely (not in repo)
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Environment variables not exposed
- [ ] Admin panel access restricted (VPN/IP whitelist)

---

## 📞 Rollback Procedure

If deployment has critical issues:

```bash
# Stop current deployment
pm2 stop buyjan
# or
sudo systemctl stop buyjan

# Restore previous version from git
git checkout <previous-commit>

# Rebuild
npm install
npm run build

# Restart
pm2 restart buyjan
# or
sudo systemctl start buyjan
```

---

## 📋 Deployment Completed Successfully ✅

When you see these signs, deployment is successful:
1. ✅ `npm run build` completes without errors
2. ✅ `npm start` runs without crashes
3. ✅ Homepage loads at https://buyjan.com
4. ✅ Products display with images
5. ✅ Checkout flow completes
6. ✅ No errors in `pm2 logs`

---

## 📚 Additional Resources

- Full Checklist: `PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- Deployment Summary: `DEPLOYMENT_PREP_SUMMARY.md`
- README: `README.md`
- Directus Docs: https://docs.directus.io/
- Next.js Docs: https://nextjs.org/docs

---

**Deployment Time:** ~30-45 minutes  
**Estimated Uptime:** 99.5%+  
**Next Review:** 24 hours post-deployment

✅ **Ready to Deploy!**