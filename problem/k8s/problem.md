# 🚨 Kubernetes (Minikube on WSL) Setup Issues

## ❗ Problem Summary

While attempting to deploy the application on Kubernetes using Minikube inside WSL (Windows Subsystem for Linux), multiple critical issues were encountered that prevented the cluster from starting successfully.

---

## 🔴 Issues Faced

### 1. Minikube Driver Not Supported

* Error:

  ```
  DRV_UNSUPPORTED_OS: The driver 'docker' is not supported on linux/amd64
  ```
* Cause:

  * Docker driver is not supported in WSL environment without proper integration.

---

### 2. Kubernetes Cluster Not Reachable

* Error:

  ```
  Unable to connect to the server: dial tcp: lookup <EKS endpoint>: no such host
  ```
* Cause:

  * kubeconfig was pointing to an invalid or unreachable cluster (EKS endpoint).

---

### 3. Docker Misconfiguration Inside WSL

* Error:

  ```
  /usr/bin/docker: No such file or directory
  ```
* Cause:

  * Conflict between Docker Desktop (Windows) and Docker installed inside WSL.

---

### 4. systemd Not Available in WSL

* Error:

  ```
  System has not been booted with systemd as init system (PID 1)
  ```
* Cause:

  * WSL does not run systemd by default.
  * Required for managing services like containerd and kubelet.

---

### 5. Minikube `none` Driver Failures

* Errors:

  * Missing dependencies:

    * `conntrack`
    * `crictl`
    * `CNI plugins`
  * Permission issues:

    ```
    permission denied (juju lock file)
    ```
* Cause:

  * `none` driver requires a fully configured Linux system with root-level services.

---

### 6. Container Runtime Issues (containerd)

* Error:

  ```
  Failed to enable container runtime: systemctl daemon-reload failed
  ```
* Cause:

  * containerd could not be managed due to absence of systemd.

---

### 7. Networking (CNI) Missing

* Error:

  ```
  NOT_FOUND_CNI_PLUGINS
  ```
* Cause:

  * Required Kubernetes networking plugins were not installed initially.

---

## ⚠️ Root Cause

The main issue is:

> ❌ WSL environment lacks full Linux system capabilities (especially systemd), which are required by Minikube’s `none` driver.

---

## 💡 Resolution / Workarounds

### ✅ Option 1: Enable systemd in WSL

* Modify `/etc/wsl.conf`:

  ```ini
  [boot]
  systemd=true
  ```
* Restart WSL:

  ```bash
  wsl --shutdown
  ```

---

### ✅ Option 2 (Recommended): Use Docker Desktop Kubernetes

* Use built-in Kubernetes cluster instead of Minikube.
* Verified working:

  ```
  kubectl get nodes
  → desktop-control-plane Ready
  ```

---

### ✅ Option 3: Run Minikube Outside WSL

* Use:

  * Windows PowerShell
  * VirtualBox / Hyper-V driver

---

## 🧠 Key Learning

* Minikube is not fully compatible with WSL unless systemd is enabled.
* Docker Desktop Kubernetes is more stable for local development on Windows.
* Manual setup of Kubernetes components (containerd, CNI, etc.) is complex and error-prone in WSL.

---

## 🚀 Current Status

* Docker containers: ✅ Running
* Kubernetes (Docker Desktop): ✅ Working
* Minikube on WSL: ❌ Not stable / blocked by systemd

---
