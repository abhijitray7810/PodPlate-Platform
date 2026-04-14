# 🧠 Debugging Story: Running Kubernetes (Minikube) on WSL

## 🚀 Situation

I was working on deploying a microservices-based platform (PodPlate) to Kubernetes using Minikube. My goal was to run everything locally inside WSL (Ubuntu on Windows) to simulate a production-like environment.

---

## ⚠️ Problem

Minikube kept failing to start, throwing multiple errors related to:

* unsupported drivers (`docker`, `virtualbox`)
* missing dependencies (`conntrack`, `crictl`, CNI plugins)
* container runtime issues (`containerd`)
* and most critically:

  ```
  System has not been booted with systemd as init system
  ```

Additionally, `kubectl` could not connect to any cluster, and Docker behavior was inconsistent due to overlap between Docker Desktop and WSL.

---

## 🔍 Approach

Instead of jumping to conclusions, I debugged this systematically:

### 1. Verified Cluster Context

* Checked `kubectl config`
* Found it was pointing to an invalid EKS endpoint initially
* Switched context to local cluster

---

### 2. Investigated Minikube Drivers

* Tried multiple drivers:

  * `docker` → unsupported in WSL
  * `virtualbox` → not installed
  * `none` → most promising but complex

👉 This helped isolate that the issue was environment-specific, not configuration-specific.

---

### 3. Fixed Missing Dependencies Iteratively

Installed required components one by one:

* `conntrack`
* `containerd`
* CNI plugins (manually downloaded and configured)

Each time I resolved one error, Minikube progressed further — revealing the next issue.

---

### 4. Debugged Container Runtime

* Configured `containerd` manually
* Generated default config
* Started it using `nohup` (since systemd wasn’t available)

👉 This confirmed runtime setup was possible even without systemd.

---

### 5. Identified the Root Cause

Despite all fixes, Minikube failed with:

```
systemctl daemon-reload → failed
```

At this point, I realized:

> WSL does not run systemd by default, and Minikube’s `none` driver depends heavily on systemd to manage services like kubelet and container runtimes.

---

## 💡 Solution

I explored two paths:

### Option 1: Enable systemd in WSL

* Updated `/etc/wsl.conf`
* Restarted WSL using `wsl --shutdown`

### Option 2 (Practical Fix):

* Switched to Docker Desktop’s built-in Kubernetes cluster
* Verified cluster availability:

  ```
  kubectl get nodes → Ready
  ```

---

## 🎯 Result

* Successfully ran all services using Docker
* Successfully connected to a working Kubernetes cluster
* Understood full Kubernetes bootstrapping process at a low level

---

## 🧠 Key Learnings

* Environment limitations can be more critical than configuration errors
* WSL is not a full Linux system — systemd absence impacts many tools
* Debugging complex systems requires:

  * isolating layers (driver → runtime → networking → orchestration)
  * fixing issues incrementally
* Gained deep understanding of:

  * container runtimes (containerd)
  * Kubernetes dependencies (CNI, kubelet)
  * Minikube internals

---

## 💬 How I Explain It in One Line

> “I debugged a failing Kubernetes setup by tracing issues across drivers, container runtime, and OS-level constraints, and identified WSL’s lack of systemd as the root cause — then pivoted to a stable Kubernetes setup.”

---

