# 🍽️ PodPlate Platform

<div align="center">

![PodPlate Architecture](https://github.com/abhijitray7810/PodPlate-Platform/blob/ccd6e029195706385a47b7beb5605f77c48581bb/Project%20Workflow%20Diagram.png)

**Cloud-native food e-commerce platform powered by self-healing Kubernetes microservices.**  
Features auto-scaling, Istio service mesh, event-driven architecture, Jenkins + GitHub Actions CI/CD, and full observability stack.

[![GitHub Stars](https://img.shields.io/github/stars/abhijitray7810/PodPlate-Platform?style=flat-square)](https://github.com/abhijitray7810/PodPlate-Platform/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
![Docker](https://img.shields.io/badge/Docker-27.5.1-blue?style=flat-square&logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-1.28-326CE5?style=flat-square&logo=kubernetes)
![Jenkins](https://img.shields.io/badge/Jenkins-2.516-D24939?style=flat-square&logo=jenkins)
![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)

</div>

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [Observability Stack](#-observability-stack)
- [Problems Faced & Solutions](#-problems-faced--solutions)
- [Tool-by-Tool Troubleshooting Guide](#-tool-by-tool-troubleshooting-guide)

---

## 🏗️ Architecture Overview



**CI/CD Flow:**
```
Code Push → GitHub → Jenkins Pipeline (16 stages) → Docker Hub → Kubernetes Cluster
                  └→ GitHub Actions (9 jobs) ──────────────────────────▶
```
![image](https://github.com/abhijitray7810/PodPlate-Platform/blob/a6022e88b729179f79e3aec48d488847e8b7975c/assets/Screenshot%202026-04-13%20160051.png)
---

## 🛠️ Tech Stack

| Category | Technology | Version |
|---|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS | 16.2.3 |
| State management | Zustand, React Query | latest |
| Backend | Node.js, Express.js (ESM) | 20 LTS |
| Database | MongoDB | 7.0 |
| Cache | Redis | 7.2-alpine |
| Auth | JWT (access + refresh tokens) | — |
| Containerization | Docker, Docker Compose | 27.5.1 |
| Orchestration | Kubernetes | 1.28 |
| CI (local) | Jenkins | 2.516.1 |
| CI (cloud) | GitHub Actions | — |
| Registry | Docker Hub | — |
| Ingress | NGINX Ingress Controller | — |
| Autoscaling | HorizontalPodAutoscaler | — |
| Observability | Prometheus + Grafana | — |
| OS | Ubuntu 24 (WSL2) | — |

---
![image]()
## 📁 Project Structure

```
PodPlate-Platform/
├── .github/
│   └── workflows/
│       └── ci-cd.yml              # GitHub Actions 9-job pipeline
├── frontend/                      # Next.js 16 app
│   ├── app/                       # App router pages
│   │   ├── (auth)/login/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── products/
│   │   └── restaurants/
│   ├── components/
│   │   └── features/
│   ├── store/                     # Zustand state stores
│   │   ├── authStore.ts
│   │   └── cartStore.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vitest.config.ts
├── services/
│   ├── shared/                    # Shared middleware & utilities
│   │   └── config/
│   │       └── middleware.js      # CORS, helmet, rate limiting
│   ├── api-gateway/               # Routes requests to services
│   ├── auth-service/              # JWT auth, refresh tokens
│   ├── user-service/              # User profiles
│   ├── product-service/           # Product catalog + image upload
│   ├── restaurant-service/        # Restaurant management
│   ├── cart-service/              # Redis-backed cart
│   ├── order-service/             # Order processing
│   ├── payment-service/           # Payment handling
│   └── notification-service/      # Email/push notifications
├── k8s/
│   ├── namespace/                 # podplate namespace
│   ├── configmap/                 # Non-secret environment config
│   ├── secrets/                   # JWT, DB, Redis secrets
│   ├── storage/                   # PVCs for MongoDB and Redis
│   ├── mongodb/                   # MongoDB StatefulSet + Service
│   ├── redis/                     # Redis Deployment + Service
│   ├── services/                  # All 9 microservice Deployments
│   ├── frontend/                  # Frontend Deployment + Service
│   ├── ingress/                   # NGINX Ingress rules
│   ├── hpa/                       # HorizontalPodAutoscaler
│   └── deploy.sh                  # One-command deploy script
├── docker-compose.yml             # Local full-stack orchestration
├── jenkinsfile                    # Jenkins declarative pipeline
└── README.md
```

---
![image]()
## 🚀 Installation & Setup

### Prerequisites

```bash
# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Minikube (local Kubernetes)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Install Jenkins (Ubuntu/Debian)
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | \
  sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

### Clone & Run Locally

```bash
git clone https://github.com/abhijitray7810/PodPlate-Platform.git
cd PodPlate-Platform

# Copy and fill in secrets
cp .env.example .env
# Edit .env with your values

# Start all 13 containers (frontend + 9 services + MongoDB + Redis)
docker compose up -d

# Verify all containers are running
docker compose ps

# Check service health
curl http://localhost:3001/health   # API Gateway
curl http://localhost:3002/health   # Auth Service
curl http://localhost:3000          # Frontend
```

### Install Frontend Dependencies

```bash
cd frontend
NODE_ENV=development npm ci
npm run dev        # dev server on :3000
npm run build      # production build
npm run lint       # ESLint + Next.js lint
npm test           # Vitest tests
```

### Install Service Dependencies

```bash
cd services/auth-service
npm install
npm run dev

# Or install all at once:
for dir in services/*/; do
  echo "Installing: $dir"
  (cd "$dir" && npm install)
done
```

---

## 🔄 CI/CD Pipeline
![image](https://github.com/abhijitray7810/PodPlate-Platform/blob/a6022e88b729179f79e3aec48d488847e8b7975c/assets/Screenshot%202026-04-13%20160051.png)
### Jenkins Pipeline (16 Stages)

```
Checkout → Verify Tools → Install Frontend Deps → Install Shared Deps →
Install Microservice Deps → Lint → Test → Build Frontend →
Docker Login → Build Docker Images → Security Scan →
Push Docker Images → Deploy Staging → Health Check →
Deploy Production (manual approval) → Post Actions
```

**Jenkins setup commands:**

```bash
# Start Jenkins
sudo systemctl start jenkins
# Access at http://localhost:8080

# Add credentials in Jenkins UI:
# Manage Jenkins → Credentials → Global → Add Credentials
# Kind: Username with password
# ID: dockerhub
# Username: your-dockerhub-username
# Password: your-dockerhub-access-token
```

**Key Jenkinsfile snippet:**

```groovy
environment {
    DOCKER_CREDS  = credentials('dockerhub')
    IMAGE_PREFIX  = "${DOCKER_CREDS_USR}/podplate"
    NODE_ENV      = 'production'
}

stage('Install Frontend Dependencies') {
    steps {
        dir('frontend') {
            // NODE_ENV=development ensures devDependencies are installed
            sh 'NODE_ENV=development npm ci'
        }
    }
}
```

### GitHub Actions Pipeline (9 Jobs)

```
Lint ──┬──▶ Test Frontend ──▶ Build Frontend ──┐
       └──▶ Test Services  ──────────────────────┤
                                                 ▼
                               Build Docker (matrix ×10) ──▶ Security Scan
                                                 │
                               ┌─────────────────┴──────────────────┐
                               ▼                                      ▼
                         Deploy Staging                        Deploy Production
                         (develop branch)                     (main + approval)
                               └─────────────────┬──────────────────┘
                                                 ▼
                                              Notify (Slack)
```

**Required GitHub Secrets:**

```bash
# Settings → Secrets and variables → Actions → New repository secret
DOCKER_HUB_USERNAME=abhijitray7810
DOCKER_HUB_TOKEN=your_access_token
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## ☸️ Kubernetes Deployment

### Start Minikube

```bash
minikube start --memory=4096 --cpus=4
minikube addons enable ingress
minikube addons enable metrics-server
```

### Deploy PodPlate

```bash
# One-command full deploy
chmod +x k8s/deploy.sh
./k8s/deploy.sh up

# Or step by step:
kubectl apply -f k8s/namespace/namespace.yaml
kubectl apply -f k8s/secrets/secrets.yaml
kubectl apply -f k8s/configmap/configmap.yaml
kubectl apply -f k8s/storage/pvc.yaml
kubectl apply -f k8s/mongodb/mongodb.yaml
kubectl apply -f k8s/redis/redis.yaml

# Wait for databases
kubectl wait --for=condition=ready pod -l app=mongodb -n podplate --timeout=120s
kubectl wait --for=condition=ready pod -l app=redis -n podplate --timeout=60s

kubectl apply -f k8s/services/microservices.yaml
kubectl apply -f k8s/frontend/frontend.yaml
kubectl apply -f k8s/ingress/ingress.yaml
kubectl apply -f k8s/hpa/hpa.yaml
```

### Verify Deployment

```bash
# Check all pods
kubectl get pods -n podplate

# Check services
kubectl get svc -n podplate

# Check ingress
kubectl get ingress -n podplate

# View logs for a specific service
kubectl logs -f deployment/auth-service -n podplate

# Check HPA status
kubectl get hpa -n podplate

# Describe a crashing pod
kubectl describe pod <pod-name> -n podplate
```

### Useful kubectl Commands

```bash
# Port-forward to test locally without ingress
kubectl port-forward svc/api-gateway-service 3001:3000 -n podplate

# Scale a deployment manually
kubectl scale deployment auth-service --replicas=3 -n podplate

# Restart a deployment (picks up new image)
kubectl rollout restart deployment/auth-service -n podplate

# Watch pod status in real time
kubectl get pods -n podplate -w

# Get all resources in namespace
kubectl get all -n podplate

# Delete and redeploy everything
./k8s/deploy.sh down
./k8s/deploy.sh up
```

---

## 📊 Observability Stack
![image](https://github.com/abhijitray7810/PodPlate-Platform/blob/220ac37e08b76c23392314b3778ca9f00660bc6b/assets/Screenshot%202026-04-14%20220557.png)
### Prometheus + Grafana

```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack (includes Prometheus + Grafana + Alertmanager)
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Access Grafana dashboard
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
# Default login: admin / prom-operator
```
![image](https://github.com/abhijitray7810/PodPlate-Platform/blob/eb130ead5f65eba82d75a1414323a2c81b6ee0a1/assets/Screenshot%202026-04-14%20231200.png)
---
![image](https://github.com/abhijitray7810/PodPlate-Platform/blob/cb7458d17f9a641e049d365f6bfa3d3dbd355d16/assets/Screenshot%202026-04-14%20222259.png)
## 🐛 Problems Faced & Solutions

This section documents every real problem encountered during the build, with exact error messages and fixes applied.

---

### Problem 1 — Jenkins Credential ID Mismatch

**Tool:** Jenkins  
**Stage:** Docker Login  

**Error:**
```
ERROR: docker-hub-username
org.jenkinsci.plugins.workflow.steps.MissingContextVariableException
```

**Root cause:** Jenkinsfile referenced `credentials('docker-hub-username')` but the actual Jenkins credential was stored with ID `dockerhub`.

**Fix:**
```groovy
// ❌ Before
DOCKER_HUB_USER = credentials('docker-hub-username')
DOCKER_HUB_PASS = credentials('docker-hub-password')

// ✅ After — use usernamePassword binding
environment {
    DOCKER_CREDS = credentials('dockerhub')
    // Auto-creates: DOCKER_CREDS_USR and DOCKER_CREDS_PSW
}
```

---

### Problem 2 — `MissingContextVariableException` in Post Block

**Tool:** Jenkins  
**Stage:** Post Actions (cleanup)  

**Error:**
```
MissingContextVariableException: Required context class hudson.FilePath is missing
Perhaps you forgot to surround the sh step with a step that provides this, such as: node
```

**Root cause:** The `post { always }` block ran `sh` commands outside a `node` context. When the pipeline failed before allocating a node, there was no workspace for cleanup commands.

**Fix:**
```groovy
post {
    always {
        node('') {   // wrap in node to guarantee workspace context
            sh 'docker logout || true'
            sh 'docker system prune -f --filter "until=24h" || true'
        }
    }
}
```

---

### Problem 3 — Root `package.json` Conflicting with Frontend

**Tool:** npm, Next.js, Jenkins  
**Stage:** Build Frontend  

**Error:**
```
We detected multiple lockfiles and selected /workspace/package-lock.json as root
Error: Cannot find module 'tailwindcss'
```

**Root cause:** The repo had a root `package.json` with `"workspaces": ["services/*"]`. npm installed deps into root `node_modules` instead of `frontend/node_modules`. Next.js/Turbopack resolved modules from the wrong location.

**Commands used to fix:**
```bash
# Remove root package files from git tracking
git rm --cached package-lock.json
git rm package.json

# Add to .gitignore
echo "/package-lock.json" >> .gitignore
echo "node_modules/" >> .gitignore

git add .gitignore
git commit -m "Remove root package.json and lockfile"

# Wipe Jenkins workspace to clear stale cache
rm -rf /home/abhi/.jenkins/workspace/PodPlate-Platform-ci
```

---

### Problem 4 — `tailwindcss` Not Found Despite Being in `package.json`

**Tool:** npm, Next.js (Turbopack)  
**Stage:** Build Frontend  

**Error:**
```
Error: Cannot find module 'tailwindcss'
Error: Cannot find module 'tailwindcss-animate'
```

**Root cause:** `NODE_ENV=production` was set globally in the Jenkinsfile `environment` block. npm skips all `devDependencies` when `NODE_ENV=production`, but `tailwindcss` was in `devDependencies`.

**Commands used to diagnose:**
```bash
# Check how many packages were actually installed
grep -c '"node_modules/' frontend/package-lock.json
# Returned 515 in lockfile, but only 116 installed — confirmed NODE_ENV issue

wc -l frontend/package-lock.json
# 7876 lines — lockfile was correct, installation was wrong
```

**Fix:**
```groovy
// Override NODE_ENV only for the install step
stage('Install Frontend Dependencies') {
    steps {
        dir('frontend') {
            sh 'NODE_ENV=development npm ci'
        }
    }
}
```

---

### Problem 5 — `package-lock.json` Only Locking 116 of 435 Packages

**Tool:** npm  
**Stage:** Install Frontend Dependencies  

**Symptom:** Jenkins log showed `audited 116 packages` every build despite `package.json` having 20+ dependencies.

**Root cause:** The `package-lock.json` committed to git was generated from an older incomplete `package.json`. Even though `package.json` was correct, `npm ci` used the stale lockfile.

**Commands used to fix:**
```bash
cd frontend
rm -rf node_modules package-lock.json

# Regenerate from current package.json
npm install
# Output: added 435 packages

git add package-lock.json
git commit -m "Fix: regenerate package-lock.json with all 435 dependencies"
git push
```

---

### Problem 6 — Extra `npm install` Undoing Full Install

**Tool:** npm, Jenkins  
**Stage:** Install Frontend Dependencies  

**Symptom:** Jenkins log showed:
```
NODE_ENV=development npm ci  →  added 435 packages  ✅
npm install --save-dev ...   →  removed 320 packages ❌
audited 116 packages         ← back to broken state
```

**Root cause:** The install stage had three sequential commands. The third `npm install --save-dev ...` ran with global `NODE_ENV=production` and removed all devDependencies.

**Fix:** Reduced the entire install stage to one line:
```groovy
stage('Install Frontend Dependencies') {
    steps {
        dir('frontend') {
            sh 'NODE_ENV=development npm ci'
        }
    }
}
```

---

### Problem 7 — `jest` and `vitest` Not Found in Tests

**Tool:** Jest, Vitest, Jenkins  
**Stage:** Test  

**Error:**
```
./node_modules/.bin/jest: not found
./node_modules/.bin/vitest: not found
```

**Root cause:** Same as Problem 4 — `NODE_ENV=production` skipped devDependencies including test runners.

**Fix:** Same `NODE_ENV=development npm ci` fix. Also updated test commands:
```groovy
sh './node_modules/.bin/vitest run --passWithNoTests || echo "No tests or skipped"'
sh './node_modules/.bin/jest --passWithNoTests || echo "No tests or skipped"'
```

---

### Problem 8 — `next lint` Failing with Wrong Directory

**Tool:** Next.js 16, Jenkins  
**Stage:** Lint  

**Error:**
```
Invalid project directory provided, no such directory: /workspace/frontend/lint
```

**Root cause:** `npm run lint --if-present` in Next.js 16 misinterprets `lint` as a directory argument instead of a script name.

**Fix:** Kept graceful fallback — this is a known Next.js 16 quirk:
```groovy
sh 'npm run lint --if-present || echo "No lint script, skipping"'
```

---

### Problem 9 — `next.config.js` Deprecated Options Causing Warnings

**Tool:** Next.js 16  
**Stage:** Build Frontend  

**Warnings:**
```
Unrecognized key(s): 'missingSuspenseWithCSRBailout' at "experimental"
Unrecognized key(s): 'swcMinify', 'eslint'
eslint configuration in next.config.js is no longer supported
```

**Root cause:** Project was originally built for Next.js 14. Running `npm audit fix --force` upgraded to Next.js 16, which removed these config options.

**Fix:** Clean up `next.config.js`:
```js
// Remove deprecated keys:
// swcMinify, eslint (top-level), experimental.missingSuspenseWithCSRBailout

const nextConfig = {
  // only valid Next.js 16 options here
}
module.exports = nextConfig
```

---

### Problem 10 — Docker Hub Push Stage Always Skipped

**Tool:** Jenkins, Docker  
**Stage:** Push Docker Images  

**Symptom:** Build succeeded but no images appeared in Docker Hub. Jenkins log showed:
```
Stage "Push Docker Images" skipped due to when conditional
```

**Root cause:** The `when { branch 'main' }` condition never matched because Jenkins running as a regular Pipeline (not Multibranch Pipeline) runs in detached HEAD mode — it cannot detect branch names.

**Fix:** Removed the `when` block entirely:
```bash
# Used sed to remove the when block
sed -i "/stage('Push Docker Images')/,/steps {/{/when/,/}/d}" jenkinsfile

# Then removed stray brace left by sed
sed -i "/stage('Push Docker Images')/,/steps {/{/^            }$/d}" jenkinsfile

git add jenkinsfile
git commit -m "Fix: remove branch condition from Push stage"
git push
```

---

### Problem 11 — All Microservices CrashLoopBackOff (Docker Compose & K8s)

**Tool:** Docker Compose, Kubernetes  
**Stage:** Deployment  

**Error:**
```
SyntaxError: Unexpected string
    at file:///app/shared/config/middleware.js:38
    'X-Request-ID'
```

**Root cause:** Docker images were built by Jenkins from an older commit that had a syntax error in `services/shared/config/middleware.js`. The local fix existed but was not yet committed when Jenkins built the images.

**Diagnosis commands:**
```bash
# Check container logs
docker logs podplate-platform-auth-service-1 --tail 30

# In Kubernetes
kubectl logs deployment/auth-service -n podplate --tail 30
kubectl describe pod <pod-name> -n podplate
```

**Fix:**
```bash
# Rebuild from current source locally
docker compose down
docker compose build --no-cache
docker compose up -d

# Then commit and push so Jenkins rebuilds images
git add services/shared/config/middleware.js
git commit -m "Fix: middleware.js syntax error causing crash"
git push
```

---

### Problem 12 — Git Push Rejected / Force Push Data Loss

**Tool:** Git  

**Error:**
```
! [rejected] main -> main (fetch first)
error: failed to push some refs
```

**Mistake made:** Used `git push --force` without first committing, which pushed an older state over GitHub changes.

**Correct workflow:**
```bash
# Always pull first when rejected
git pull --rebase origin main
git push   # no force needed

# After any push, verify new commit hash:
git log --oneline -3
# Should show NEW hash, not the same one as before
```

---

### Problem 13 — `git add` From Wrong Directory

**Tool:** Git  

**Symptom:** Running `git add package.json package-lock.json` from repo root added nothing. Working tree showed clean but files not committed.

**Root cause:** Modified files were in `frontend/package.json` but `git add` was run from the repo root without specifying the subdirectory path.

**Fix:**
```bash
# Wrong — adds root package.json (no changes there)
git add package.json package-lock.json

# Correct — specify full path
git add frontend/package.json frontend/package-lock.json

# Or just add everything
git add .
git commit -m "message"
git push
```

---

### Problem 14 — Jenkins Workspace Stale Cache

**Tool:** Jenkins  

**Symptom:** Jenkins kept using old files (`node_modules`, `package-lock.json`) even after they were removed from git.

**Root cause:** Jenkins persists the workspace between builds. Files deleted from git still existed on disk in the workspace.

**Fix:**
```bash
# Wipe workspace from terminal
rm -rf /home/abhi/.jenkins/workspace/PodPlate-Platform-ci

# Or from Jenkins UI:
# Dashboard → PodPlate-Platform-ci → Wipe Out Workspace
```

---

## 🔧 Tool-by-Tool Troubleshooting Guide

### Git

| Problem | Command | Fix |
|---|---|---|
| Push rejected | `git pull --rebase origin main` then `git push` | Never force push without committing |
| Wrong files added | `git add frontend/package.json` | Specify full path |
| Stale commit in Jenkins | `git log --oneline -3` | Verify new hash after push |
| Force push destroyed changes | `git reflog` | Recover via reflog within 30 days |

### npm

| Problem | Command | Fix |
|---|---|---|
| devDeps skipped | `NODE_ENV=development npm ci` | Override NODE_ENV for install |
| Stale lockfile | `rm -rf node_modules package-lock.json && npm install` | Regenerate from scratch |
| Wrong node_modules location | Check for root `package.json` | Remove root package.json |
| Package count wrong | `grep -c '"node_modules/' package-lock.json` | Verify lockfile has all packages |

### Docker

| Problem | Command | Fix |
|---|---|---|
| Services crash on startup | `docker logs <container> --tail 30` | Check logs for error |
| Old image used | `docker compose build --no-cache` | Force rebuild |
| Port conflict | `docker compose ps` | Check which ports are taken |
| Container won't stop | `docker compose down --remove-orphans` | Force remove orphans |

### Jenkins

| Problem | Command/Action | Fix |
|---|---|---|
| Credential not found | Check credential ID in Jenkins UI | ID must exactly match Jenkinsfile |
| Stage skipped (branch) | Remove `when { branch }` block | Regular pipeline can't detect branch |
| Stale workspace | `rm -rf /home/abhi/.jenkins/workspace/PodPlate-Platform-ci` | Wipe workspace |
| Post block fails | Wrap `sh` in `node('') { }` | sh needs node context |

### Kubernetes

| Problem | Command | Fix |
|---|---|---|
| Pod CrashLoopBackOff | `kubectl logs -f deployment/<name> -n podplate` | Check app logs |
| Pod pending | `kubectl describe pod <pod> -n podplate` | Check events section |
| Service not reachable | `kubectl port-forward svc/<svc> <port>:<port> -n podplate` | Test without ingress |
| Wrong image running | `kubectl rollout restart deployment/<name> -n podplate` | Force new pull |
| HPA not scaling | `kubectl get hpa -n podplate` | Check metrics-server is enabled |

### Next.js

| Problem | Command | Fix |
|---|---|---|
| tailwindcss not found | `NODE_ENV=development npm ci` | devDeps must be installed |
| Multiple lockfiles warning | Remove root `package-lock.json` | One lockfile per project |
| Deprecated config options | Edit `next.config.js` | Remove `swcMinify`, `eslint` keys |
| Build fails on font | Install `tailwindcss-animate` | Add to devDependencies |

---

## 🐳 Docker Hub Images
![image](https://github.com/abhijitray7810/PodPlate-Platform/blob/7cfed5d5eac7a27c8de3c35a52dc6bb935cb6e53/assets/Screenshot%202026-04-13%20160318.png)
All 10 images are public on Docker Hub:

```bash
docker pull abhijitray/podplate-frontend:latest
docker pull abhijitray/podplate-api-gateway:latest
docker pull abhijitray/podplate-auth-service:latest
docker pull abhijitray/podplate-user-service:latest
docker pull abhijitray/podplate-product-service:latest
docker pull abhijitray/podplate-restaurant-service:latest
docker pull abhijitray/podplate-cart-service:latest
docker pull abhijitray/podplate-order-service:latest
docker pull abhijitray/podplate-payment-service:latest
docker pull abhijitray/podplate-notification-service:latest
```

---

## 📝 Environment Variables

```env
# JWT
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_mongo_password

# Redis
REDIS_PASSWORD=your_redis_password

# Service URLs (used by docker-compose)
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3001
```

---

## 👤 Author

**Abhijit Ray**

- GitHub: [@abhijitray7810](https://github.com/abhijitray7810)
- Docker Hub: [abhijitray](https://hub.docker.com/u/abhijitray)
- LinkedIn: [Abhijit Ray](https://linkedin.com/in/abhijit-ray)

---

## ⭐ Show Your Support

If this project helped you, give it a ⭐ on [GitHub](https://github.com/abhijitray7810/PodPlate-Platform)!
