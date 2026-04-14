# PodPlate Platform – Debug Notes & Setup Guide

## 🚨 Issues Faced

### 1. Docker Build Failure

* Error: `npm run build` failed in frontend container
* Cause: Missing `build` script in `package.json`
* Fix: Added proper scripts (`build`, `start`, `dev`)

---

### 2. Module Resolution Errors (`@/...`)

* Error: `Module not found: Can't resolve '@/components/...`
* Cause: Path alias not configured correctly
* Fix: Updated `tsconfig.json`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./*"]
}
```

---

### 3. Missing Frontend Modules

* Errors for:

  * `components/common/Header`
  * `components/features/ProductCard`
  * `store/authStore`
  * `lib/api`
* Cause: Incomplete frontend codebase
* Fix: Ensure all required files exist or scaffold missing components

---

### 4. Next.js Build Crash (SIGBUS)

* Error:

```
Next.js build worker exited with signal: SIGBUS
```

* Root Cause:

  * Running project inside WSL on Windows-mounted path (`/mnt/c/...`)
  * Memory / filesystem incompatibility

---

## ✅ Final Fix (Important)

### Move project to WSL native filesystem:

```bash
mv /mnt/c/Downloads/OneDrive/Desktop/food-ecommerce-platform ~/food-ecommerce
cd ~/food-ecommerce/PodPlate-Platform/frontend
```

---

### Clean install:

```bash
rm -rf node_modules .next
npm install
npm run build
```

---

### Optional fixes:

#### Limit memory:

```bash
export NODE_OPTIONS="--max-old-space-size=2048"
```

#### Disable turbopack:

```bash
NEXT_DISABLE_TURBOPACK=1 npm run build
```

---

## 🚀 Development

Run frontend locally:

```bash
npm run dev
```

---

## ⚠️ Notes

* Always run Next.js inside WSL native directories (`~/`)
* Avoid `/mnt/c/...` for Node/Next.js projects
* Ensure all required components and stores exist before building

---

## 📌 Status

| Component         | Status                                    |
| ----------------- | ----------------------------------------- |
| Docker Setup      | ✅ Working                                 |
| Backend Services  | ✅ Working                                 |
| Frontend Config   | ✅ Fixed                                   |
| Frontend Build    | ⚠️ Depends on missing files + environment |
| WSL Compatibility | ❌ Needs fix (move project)                |

---
