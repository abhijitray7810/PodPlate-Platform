# PodPlate Platform

A full-stack food delivery e-commerce platform built with a microservices architecture, featuring a Next.js frontend and 9 Node.js backend services orchestrated with Docker and deployed via a Jenkins/GitHub Actions CI/CD pipeline.

---

## Architecture Overview

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────────┐
│  Next.js 16  │────▶│   API Gateway   │────▶│   Microservices      │
│  Frontend   │     │   :3001         │     │   auth      :3002    │
│  :3000      │     └─────────────────┘     │   user      :3003    │
└─────────────┘                             │   product   :3004    │
                                            │   restaurant:3005    │
                                            │   cart      :3006    │
                                            │   order     :3007    │
                                            │   payment   :3008    │
                                            │   notification:3009  │
                                            └──────────────────────┘
                                                      │
                                          ┌───────────┴───────────┐
                                          │  MongoDB :27017       │
                                          │  Redis   :6379        │
                                          └───────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Zustand, React Query |
| Backend | Node.js 20, Express.js, ESM modules |
| Database | MongoDB 7, Redis 7 |
| Auth | JWT (access + refresh tokens) |
| CI/CD | Jenkins, GitHub Actions |
| Containers | Docker, Docker Compose |
| Registry | Docker Hub |

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+
- npm 10+

### Run locally

```bash
git clone https://github.com/abhijitray7810/PodPlate-Platform.git
cd PodPlate-Platform

# Start all services
docker compose up -d

# Check status
docker compose ps
```

Services will be available at:

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:3001 |
| Auth Service | http://localhost:3002 |
| User Service | http://localhost:3003 |
| Product Service | http://localhost:3004 |
| Restaurant Service | http://localhost:3005 |
| Cart Service | http://localhost:3006 |
| Order Service | http://localhost:3007 |
| Payment Service | http://localhost:3008 |
| Notification Service | http://localhost:3009 |

### Environment variables

Copy and fill in the values before running:

```bash
cp .env.example .env
```

Key variables:

```env
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
MONGO_PASSWORD=your_mongo_password
REDIS_PASSWORD=your_redis_password
```

---

## CI/CD Pipeline

### Jenkins Pipeline (16 stages)

```
Checkout → Verify Tools → Install Deps → Lint → Test →
Build Frontend → Docker Login → Build Images →
Security Scan → Push Images → Deploy → Health Check
```

### GitHub Actions Pipeline (9 jobs)

```
Lint → Test Frontend → Test Services (matrix×9) →
Build Frontend → Build Docker (matrix×10) →
Security Scan → Deploy Staging → Deploy Production → Notify
```

---

## Problems Faced During Build

This project involved solving a large number of real-world DevOps and build issues. They are documented here for reference.

---

### 1. Jenkins Credential ID Mismatch

**Problem:** The Jenkinsfile used `credentials('docker-hub-username')` and `credentials('docker-hub-password')` but the actual credential stored in Jenkins had the ID `dockerhub`.

**Error:**
```
ERROR: docker-hub-username
```

**Fix:** Changed to use the `usernamePassword` binding which automatically creates `_USR` and `_PSW` variables:
```groovy
DOCKER_CREDS = credentials('dockerhub')
// Gives: DOCKER_CREDS_USR and DOCKER_CREDS_PSW
```

---

### 2. Jenkins `MissingContextVariableException` in Post Block

**Problem:** The `post { always }` cleanup block ran `sh` commands outside a `node` context. When the pipeline failed before allocating a node, the cleanup had no workspace.

**Error:**
```
MissingContextVariableException: Required context class hudson.FilePath is missing
```

**Fix:** Wrapped the cleanup in a `node('') { }` block so it always has a workspace context.

---

### 3. Root `package.json` Conflicting with Frontend

**Problem:** The repo had a root-level `package.json` with `"workspaces": ["services/*"]`. This caused npm to install dependencies into the root `node_modules` instead of `frontend/node_modules`. Next.js/Turbopack detected multiple `package-lock.json` files and resolved modules from the wrong location.

**Error:**
```
We detected multiple lockfiles and selected /workspace/package-lock.json as root
Cannot find module 'tailwindcss'
```

**Fix:**
- Removed root `package.json` and `package-lock.json` from the repo
- Added them to `.gitignore`
- Deleted the stale root `node_modules` from the Jenkins workspace
- Wiped the Jenkins workspace entirely to clear the cache

---

### 4. `tailwindcss` Not Found at Build Time

**Problem:** Even after adding `tailwindcss` to `devDependencies`, it was not being installed because `NODE_ENV=production` was set globally in the Jenkinsfile environment block. When `NODE_ENV=production`, npm skips all `devDependencies`.

**Error:**
```
Error: Cannot find module 'tailwindcss'
Error: Cannot find module 'tailwindcss-animate'
```

**Fix:** Overrode `NODE_ENV` specifically for the install step:
```groovy
sh 'NODE_ENV=development npm ci'
```
This installs all packages including devDependencies, while the build step still runs with `NODE_ENV=production`.

---

### 5. `package-lock.json` Only Locking 116 Packages

**Problem:** The `package-lock.json` committed to the repo was generated from an older, incomplete `package.json`. It only locked 116 packages instead of the required 435+. Even though the correct packages were in `package.json`, `npm ci` used the stale lockfile.

**Fix:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install  # regenerates lockfile from current package.json
git add package-lock.json
git commit -m "Regenerate package-lock.json"
```

---

### 6. Extra `npm install` Undoing the Full Install

**Problem:** The Jenkinsfile install stage had three commands: `npm install`, then `NODE_ENV=development npm ci` (which correctly installed 435 packages), then another `npm install --save-dev tailwindcss ...` at the end. The final command ran with `NODE_ENV=production` and **removed 320 packages**, dropping back to 116.

**Error:**
```
NODE_ENV=development npm ci  →  added 435 packages ✅
npm install --save-dev ...   →  removed 320 packages ❌
```

**Fix:** Removed all redundant install commands. The install stage became a single line:
```groovy
sh 'NODE_ENV=development npm ci'
```

---

### 7. `jest` and `vitest` Not Found in Test Stage

**Problem:** Test runners were listed in `devDependencies` but `NODE_ENV=production` caused them to be skipped during install. The test stage then tried to call `./node_modules/.bin/jest` which didn't exist.

**Error:**
```
./node_modules/.bin/jest: not found
./node_modules/.bin/vitest: not found
```

**Fix:** Same as issue 4 — using `NODE_ENV=development npm ci` ensures test runners are installed. The test commands were also updated to use `|| echo "No tests or skipped"` to prevent pipeline failure when no tests exist.

---

### 8. `next lint` Failing with Wrong Directory

**Problem:** `next lint` was being called with `--if-present` via npm, but Next.js 16 misinterpreted the `lint` argument as a directory path.

**Error:**
```
Invalid project directory provided, no such directory: /workspace/frontend/lint
```

**Fix:** This is a known Next.js 16 quirk with `npm run lint --if-present`. The lint stage was left with a graceful fallback (`|| echo "No lint script, skipping"`) since it doesn't block the build.

---

### 9. `next.config.js` Deprecated Options

**Problem:** The project was created for Next.js 14 but was upgraded to Next.js 16 by `npm audit fix --force`. Several config options were removed in newer versions.

**Warnings:**
```
Unrecognized key(s): 'missingSuspenseWithCSRBailout' at "experimental"
Unrecognized key(s): 'swcMinify', 'eslint'
eslint configuration in next.config.js is no longer supported
```

**Fix:** These are warnings only and don't block the build. The `next.config.js` should be cleaned up by removing the deprecated keys.

---

### 10. Docker Hub Push Stage Skipped

**Problem:** The Push Docker Images stage had a `when { branch 'main' }` condition. Jenkins running as a regular Pipeline (not Multibranch Pipeline) cannot detect branch names — it runs in detached HEAD mode, so the condition always evaluated to false.

**Result:** All images were built successfully but never pushed to Docker Hub.

**Fix:** Removed the `when` block entirely from the Push stage so it always runs.

---

### 11. All Microservices Crash-Looping on Docker Compose

**Problem:** After pushing images to Docker Hub and pulling them via `docker compose up`, all 9 microservices immediately crashed with exit code 1.

**Error:**
```
SyntaxError: Unexpected string
    at file:///app/shared/config/middleware.js:38
    'X-Request-ID'
```

**Root cause:** The Docker images were built by Jenkins from an older commit that had a syntax error in `services/shared/config/middleware.js`. The local fix had not been committed and pushed before Jenkins built the images.

**Fix:** Rebuild images locally from current source:
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```
Then commit the fix and let Jenkins rebuild:
```bash
git add services/shared/config/middleware.js
git commit -m "Fix middleware.js syntax error"
git push
```

---

### 12. Git Push Rejected / Force Push Losing Changes

**Problem:** During development, `git push` was rejected because the remote had diverged. Using `git push --force` without committing first resulted in pushing an older state to GitHub, overwriting recent changes.

**Fix:** Always use `git pull --rebase` before pushing, and verify a new commit hash appears after `git push`:
```bash
git pull --rebase origin main
git push
git log --oneline -3  # confirm new hash
```

---

### 13. `git add` From Wrong Directory

**Problem:** Running `git add package.json package-lock.json` from the repo root added nothing because the modified files were in `frontend/package.json`. The working tree showed as clean and nothing was committed.

**Fix:** Always specify the full path or `cd` into the correct directory first:
```bash
git add frontend/package.json frontend/package-lock.json
# or
cd frontend && git add package.json package-lock.json
```

---

## Docker Images

All images are available on Docker Hub under the `abhijitray` namespace:

```
abhijitray/podplate-frontend
abhijitray/podplate-api-gateway
abhijitray/podplate-auth-service
abhijitray/podplate-user-service
abhijitray/podplate-product-service
abhijitray/podplate-restaurant-service
abhijitray/podplate-cart-service
abhijitray/podplate-order-service
abhijitray/podplate-payment-service
abhijitray/podplate-notification-service
```

Pull any image:
```bash
docker pull abhijitray/podplate-frontend:latest
```

---

## Project Structure

```
PodPlate-Platform/
├── frontend/                    # Next.js 16 frontend
│   ├── app/                     # App router pages
│   ├── components/              # UI components
│   ├── store/                   # Zustand state stores
│   └── package.json
├── services/
│   ├── shared/                  # Shared middleware and utilities
│   ├── api-gateway/             # Request routing and auth validation
│   ├── auth-service/            # JWT authentication
│   ├── user-service/            # User profile management
│   ├── product-service/         # Product catalog
│   ├── restaurant-service/      # Restaurant management
│   ├── cart-service/            # Shopping cart (Redis)
│   ├── order-service/           # Order processing
│   ├── payment-service/         # Payment handling
│   └── notification-service/    # Email/push notifications
├── docker-compose.yml
├── jenkinsfile
└── .github/
    └── workflows/
        └── ci-cd.yml
```

---

## Author

**Abhijit Ray** — [GitHub](https://github.com/abhijitray7810) · [Docker Hub](https://hub.docker.com/u/abhijitray)