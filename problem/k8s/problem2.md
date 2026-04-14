Here’s a clean **README.md “Problem Faced” section format** based on your exact issue:

---

```md
## 🚨 Problem Faced (Cart Service Crash in Kubernetes)

### ❗ Issue Description
While running the PodPlate microservices on Kubernetes (Minikube), the `cart-service` pod was continuously restarting and failing readiness checks.

The pod status showed:
- `0/1 READY`
- High number of restarts (~50+)
- Service was not becoming stable

---

### 🔍 Error Observed (Logs)

The container logs showed the following error:

```

[ErrorReply: WRONGPASS invalid username-password pair or user is disabled.]

```

Even though Redis connection initially succeeded:
```

✅ Redis Connected

````

The application crashed immediately after authentication failure.

---

### 🎯 Root Cause

The issue was caused due to:
- Incorrect Redis authentication credentials in the `cart-service`
- Mismatch between Redis configuration and application environment variables

This led to Redis rejecting the connection with:
- Wrong password OR missing/invalid user configuration

---

### ⚙️ Impact

- Cart service kept crashing (CrashLoop behavior)
- Kubernetes restart loop increased pod restarts
- Cart API endpoints were unavailable
- Dependency failure affected microservice flow

---

### 🛠️ Resolution

- Verified Redis deployment configuration
- Checked environment variables in cart-service deployment
- Identified incorrect Redis password configuration
- Fixed Redis credentials alignment between:
  - Redis server configuration
  - Cart service environment variables
- Restarted deployment

Commands used:
```bash
kubectl logs <pod-name>
kubectl describe pod <pod-name>
kubectl rollout restart deployment cart-service -n podplate
````

---

### ✅ Result After Fix

* Cart service became stable (`1/1 READY`)
* No further restarts observed
* Redis connection successfully authenticated
* Microservice communication restored

---

### 📌 Key Learning

* Kubernetes pods can appear “Running” even when application inside is failing
* Always check logs for authentication and dependency issues
* Secrets should be used instead of hardcoding credentials in production systems

```

---

If you want, I can also:
✅ Convert this into **FAANG-level DevOps case study README**  
✅ Add **architecture diagram section**  
✅ Or make it **GitHub portfolio ready (very impressive version)**
```

