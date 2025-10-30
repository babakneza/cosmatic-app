# Building Docker Without Docker Desktop

Since Docker Desktop isn't working on your system, here are practical alternatives for building and deploying your Next.js application.

---

## 🌟 **OPTION 1: GitHub Actions (RECOMMENDED - Easiest)**

**Best for:** Production deployment to cloud  
**Cost:** Free (includes runners)  
**Setup time:** 5 minutes  
**Local setup needed:** ❌ None

### How it works:
- Push code to GitHub → Automatically builds Docker image → Pushes to registry → Deploy to cloud

### Setup Steps:

1. **Commit the workflow file:**
   ```bash
   git add .github/workflows/docker-build-deploy.yml
   git commit -m "Add Docker build workflow"
   git push origin main
   ```

2. **Go to GitHub Settings:**
   - Open your repository on GitHub
   - Go to **Settings → Secrets and variables → Actions**
   - Create secrets for your environment variables:
     ```
     DIRECTUS_API_TOKEN=your_token
     NEXT_PUBLIC_DIRECTUS_API_TOKEN=your_token
     NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com
     NEXT_PUBLIC_SITE_URL=https://buyjan.com
     ```

3. **Images are pushed to GitHub Container Registry (GHCR):**
   - Automatically pushed after each commit
   - Access at: `ghcr.io/yourusername/cosmatic_app_directus:latest`

### Deploy to Production:

**AWS ECS:**
```bash
# Update ECS task definition to use:
# ghcr.io/yourusername/cosmatic_app_directus:latest
```

**Google Cloud Run:**
```bash
gcloud run deploy cosmatic-app \
  --image ghcr.io/yourusername/cosmatic_app_directus:latest \
  --region us-central1
```

**Azure Container Instances:**
```bash
az container create \
  --resource-group mygroup \
  --name cosmatic-app \
  --image ghcr.io/yourusername/cosmatic_app_directus:latest
```

---

## 🛠️ **OPTION 2: AWS CodeBuild (For AWS Deployment)**

**Best for:** If you're already using AWS  
**Cost:** ~$0.005 per build minute  
**Setup time:** 10 minutes  
**Local setup needed:** ❌ None

### Steps:

1. **Create buildspec.yml** (save to project root):
```yaml
version: 0.2

phases:
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
      - REPOSITORY_URI=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/cosmatic-app
      - COMMIT_HASH=$(echo $CODEBUILD_RESOLVED_SOURCE_VERSION | cut -c 1-7)
      - IMAGE_TAG=${COMMIT_HASH:=latest}

  build:
    commands:
      - echo Build started on `date`
      - docker build -t $REPOSITORY_URI:latest .
      - docker tag $REPOSITORY_URI:latest $REPOSITORY_URI:$IMAGE_TAG

  post_build:
    commands:
      - echo Build completed on `date`
      - docker push $REPOSITORY_URI:latest
      - docker push $REPOSITORY_URI:$IMAGE_TAG
      - echo Writing image definitions file...
      - printf '[{"name":"cosmatic-app","imageUri":"%s"}]' $REPOSITORY_URI:$IMAGE_TAG > imagedefinitions.json

artifacts:
  files: imagedefinitions.json
```

2. **Set environment variables in CodeBuild project:**
   - `NEXT_PUBLIC_DIRECTUS_URL`
   - `NEXT_PUBLIC_DIRECTUS_API_TOKEN`
   - etc.

---

## 🌐 **OPTION 3: Google Cloud Build**

**Best for:** If you're using Google Cloud  
**Cost:** Free tier includes 120 build-minutes/day  
**Setup time:** 10 minutes  
**Local setup needed:** ❌ None

### Steps:

1. **Create cloudbuild.yaml:**
```yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/$PROJECT_ID/cosmatic-app:$SHORT_SHA'
      - '-t'
      - 'gcr.io/$PROJECT_ID/cosmatic-app:latest'
      - '.'
    env:
      - 'NEXT_PUBLIC_DIRECTUS_URL=https://admin.buyjan.com'
      - 'NEXT_PUBLIC_DIRECTUS_API_TOKEN=${_DIRECTUS_TOKEN}'

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/$PROJECT_ID/cosmatic-app:$SHORT_SHA'

  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - run
      - --filename=k8s/
      - --image=gcr.io/$PROJECT_ID/cosmatic-app:$SHORT_SHA
      - --location=us-central1-a
      - --cluster=my-cluster

substitutions:
  _DIRECTUS_TOKEN: 'your-token-here'

images:
  - 'gcr.io/$PROJECT_ID/cosmatic-app:$SHORT_SHA'
  - 'gcr.io/$PROJECT_ID/cosmatic-app:latest'
```

2. **Deploy:**
```bash
gcloud builds submit --config cloudbuild.yaml
```

---

## 💻 **OPTION 4: Docker in WSL2 (If You Want Local Docker)**

**Best for:** Local development without Docker Desktop  
**Cost:** Free  
**Setup time:** 15-20 minutes  
**Local setup needed:** ✅ Yes, but lightweight

### Prerequisites:
```powershell
# Check if you have WSL2
wsl --list --verbose

# If you don't have it, install:
wsl --install
wsl --set-default-version 2
```

### Install Docker in WSL2:

**A. Windows PowerShell (Administrator):**
```powershell
# Open WSL2 Ubuntu
wsl

# Then in Ubuntu:
sudo apt-get update
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
sudo service docker start

# Verify
docker --version
```

**B. From Windows, use WSL Docker directly:**
```bash
# In PowerShell
wsl docker build -t nextjs-app .
wsl docker run -d -p 3000:3000 --env-file .env.local nextjs-app
```

**C. Use Docker in WSL2 from Windows:**
```bash
# Set up Docker CLI on Windows to use WSL2 Docker daemon
# Download Docker CLI: https://download.docker.com/win/static/stable/x86_64/

# Or use this PowerShell command:
$DockerPath = "C:\Program Files\Docker"
$env:DOCKER_HOST = "unix:////wsl$/Ubuntu/var/run/docker.sock"
docker ps
```

---

## 📦 **OPTION 5: Podman (Alternative Container Tool)**

**Best for:** Want containers without Docker  
**Cost:** Free  
**Setup time:** 5 minutes  
**Local setup needed:** ✅ Yes, but minimal

### Install on Windows:

```bash
# Using Chocolatey
choco install podman

# Or download from: https://podman.io/getting-started/installation

# Then use like Docker:
podman build -t nextjs-app .
podman run -d -p 3000:3000 --env-file .env.local nextjs-app
```

**Note:** Podman is daemonless and doesn't require a background service running.

---

## 🚀 **OPTION 6: Deploy Without Docker (Direct to Cloud)**

Don't need Docker at all - deploy directly to cloud platforms:

### **AWS Lightsail (Simplest):**
```bash
# Install AWS CLI
pip install awscli

# Create instance
aws lightsail create-instances \
  --instance-name cosmatic-app \
  --blueprint-id nodejs_18 \
  --bundle-id nano_3_0

# Then SSH and deploy your app
```

### **Google Cloud Run (No Dockerfile needed):**
```bash
# Deploy directly from source
gcloud run deploy cosmatic-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars DIRECTUS_API_TOKEN=xxx
```

### **Azure App Service (Node.js):**
```bash
# Deploy directly via ZIP
az webapp deployment source config-zip \
  --resource-group mygroup \
  --name cosmatic-app \
  --src-path app.zip
```

---

## 🎯 **QUICK RECOMMENDATION**

For your situation (production deployment to cloud, Docker Desktop not working):

✅ **Use GitHub Actions** (Option 1)
- ✨ Easiest setup
- 🚀 Automatic builds on push
- 🔒 Secure secrets management
- 💰 Free tier is generous
- 📦 Works with any cloud provider

**Next Steps:**
1. Push code to GitHub repo
2. Go to your repo → **Settings → Secrets and variables → Actions**
3. Add your environment variables
4. Workflow runs automatically on next push
5. Built image available at: `ghcr.io/yourusername/cosmatic_app_directus:latest`
6. Deploy from there to your cloud provider

---

## 📝 **Summary Table**

| Option | Setup | Cost | Local Docker? | Best For |
|--------|-------|------|---------------|----------|
| GitHub Actions | 5 min | Free | ❌ | Cloud deployment |
| AWS CodeBuild | 10 min | $0.005/min | ❌ | AWS users |
| Google Cloud Build | 10 min | Free tier | ❌ | Google Cloud users |
| WSL2 Docker | 20 min | Free | ✅ | Local development |
| Podman | 5 min | Free | ✅ | Local without Docker |
| Direct Cloud Deploy | 10 min | Varies | ❌ | Simple deployments |

Choose one based on your needs. **GitHub Actions is recommended for your situation.**

---

## ❓ **Still Need Help?**

Let me know which option you choose, and I can:
- Set up GitHub Actions secrets for you
- Configure deployment to specific cloud platform
- Help with WSL2 installation
- Assist with any other method

Just let me know! 🚀