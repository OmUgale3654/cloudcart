# CloudCart – Kubernetes Deployment Guide

This directory contains production-ready Kubernetes manifests for deploying the entire CloudCart microservices platform to a local or cloud Kubernetes cluster.

## Architecture in Kubernetes

```
                  [ Ingress Controller (Nginx / ALB) ]
                       /                        \
           /api/v1/*  /                          \  /*
                     v                            v
          [ API Gateway:8080 ]            [ Frontend:80 ]
          (ClusterIP Service)             (ClusterIP Service)
           /    |    \    \
          /     |     \    \
         v      v      v    v
      [User] [Prod] [Cart] [Order] ... [Services]
         \      |      /    /
          v     v     v    v
       [ Postgres StatefulSet:5432 ]
         (7 Isolated Microservice DBs)
```

## Manifest Organization

| File | Resource | Description |
|---|---|---|
| `00-namespace.yaml` | `Namespace` | `cloudcart` isolated namespace |
| `01-configmap.yaml` | `ConfigMap` | Non-sensitive environment variables and internal service discovery URLs |
| `02-secrets.yaml` | `Secret` | Database credentials and JWT signing secret (Opaque) |
| `03-postgres.yaml` | `StatefulSet`, `Service`, `PVC` | PostgreSQL 16 instance with automated multi-database provisioner |
| `04-api-gateway.yaml` | `Deployment`, `Service`, `HPA` | Spring Cloud Gateway (2-5 replicas with CPU-based HPA) |
| `05-user-service.yaml` | `Deployment`, `Service`, `HPA` | User & Authentication microservice |
| `06-product-service.yaml` | `Deployment`, `Service`, `HPA` | Product catalog microservice |
| `07-inventory-service.yaml` | `Deployment`, `Service`, `HPA` | Inventory reservation microservice |
| `08-cart-service.yaml` | `Deployment`, `Service`, `HPA` | Shopping cart microservice |
| `09-order-service.yaml` | `Deployment`, `Service`, `HPA` | Order Saga Orchestrator microservice |
| `10-payment-service.yaml` | `Deployment`, `Service`, `HPA` | Simulated Payment Gateway microservice |
| `11-notification-service.yaml` | `Deployment`, `Service`, `HPA` | Simulated Notification dispatcher microservice |
| `12-frontend.yaml` | `Deployment`, `Service`, `HPA` | Angular 18 Nginx frontend container |
| `13-ingress.yaml` | `Ingress` | Path-based routing for API and Frontend UI |
| `kustomization.yaml` | `Kustomization` | Unified deployment bundle |

---

## Local Deployment with Minikube

### 1. Prerequisites
- Docker installed and running
- Minikube installed (`brew install minikube`)
- Kubectl installed (`brew install kubectl`)

### 2. Start Minikube
```bash
minikube start --cpus=4 --memory=8192 --driver=docker
minikube addons enable ingress
minikube addons enable metrics-server
```

### 3. Build Docker Images Directly into Minikube Docker Daemon
```bash
# Point your local docker CLI to Minikube's Docker daemon
eval $(minikube docker-env)

# Build backend and frontend images
docker compose build
```

### 4. Deploy All Resources with Kustomize
```bash
kubectl apply -k infrastructure/kubernetes/
```

### 5. Verify Pod Rollouts
```bash
kubectl get pods -n cloudcart -w
```
Wait until all pods show `Running` and `Ready` (1/1 or 2/2).

### 6. Verify Services and Ingress
```bash
kubectl get svc -n cloudcart
kubectl get ingress -n cloudcart
```

### 7. Accessing the Application

**Option A: Minikube Tunnel (Recommended for Ingress)**
```bash
minikube tunnel
```
Add to `/etc/hosts`:
```text
127.0.0.1 cloudcart.local
```
Open your browser at: `http://cloudcart.local`

**Option B: Port Forwarding (Direct Access)**
```bash
# Frontend
kubectl port-forward svc/frontend -n cloudcart 4200:80

# API Gateway
kubectl port-forward svc/api-gateway -n cloudcart 8080:8080
```
Open: `http://localhost:4200`

---

## Testing Horizontal Pod Autoscaling (HPA)

Each microservice deployment is accompanied by an HPA resource targeting 70-75% CPU utilization.

```bash
# Watch HPA status
kubectl get hpa -n cloudcart -w

# Generate synthetic load against API Gateway
kubectl run -i --tty load-generator --rm --image=busybox --restart=Never -n cloudcart -- /bin/sh -c "while true; do wget -q -O- http://api-gateway:8080/actuator/health; done"
```
When CPU exceeds 75%, Kubernetes automatically scales pods up to the defined `maxReplicas`.

---

## Teardown
```bash
kubectl delete -k infrastructure/kubernetes/
```
