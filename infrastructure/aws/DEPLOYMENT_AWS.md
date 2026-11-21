# CloudCart – AWS Cloud Deployment Architecture & Runbook

This guide details the deployment of CloudCart to Amazon Web Services (AWS) using either **AWS ECS with AWS Fargate (Serverless Containers)** or **Amazon EKS (Elastic Kubernetes Service)**.

---

## Architecture Overview

```
                                [ Internet Users ]
                                        │
                                        ▼
                        [ Application Load Balancer (ALB) ]
                         /                             \
             /api/v1/*  /                               \  /*
                       ▼                                 ▼
             [ API Gateway (Fargate) ]           [ Frontend (Fargate) ]
               Port: 8080                          Port: 80
             /    |     \    \
            /     |      \    \
           ▼      ▼       ▼    ▼
        [User] [Prod]  [Cart] [Order] ... [Notification]
          │       │       │      │             │
          └───────┴───────┴──────┴─────────────┘
                            │ (Port 5432)
                            ▼
              [ Amazon RDS PostgreSQL 16 ]
           (7 Logical Multi-tenant Databases)
```

---

## 1. Cost Analysis & Free-Tier Optimization

CloudCart was engineered intentionally to minimize cloud expenditures during portfolio demonstrations and proof-of-concept testing.

### Estimated Monthly Cost Breakdown

| Resource | AWS Tier / Spec | Estimated Cost | Optimization Note |
|---|---|---|---|
| **AWS RDS PostgreSQL** | `db.t4g.micro` (Single-AZ, 20GB gp3) | **\$0.00** (Free Tier for 12 mos) or ~\$13.00/mo | All 7 microservices share 1 RDS instance partitioned into 7 isolated logical databases. |
| **AWS Application Load Balancer** | Standard ALB (1-2 LCU) | ~\$16.00 - \$22.00/mo | Routes both frontend traffic and `/api/v1/*` gateway APIs through a single ALB listener. |
| **AWS ECS Fargate Tasks** | 0.25 vCPU, 0.5 GB RAM per task (9 tasks) | ~\$35.00 - \$50.00/mo (when running 24/7) | Spin down tasks when not demonstrating (`aws ecs update-service --desired-count 0`). |
| **Amazon ECR** | 9 Repositories (~5GB storage) | ~\$0.50/mo | First 500MB is free; clean up old image tags with lifecycle policies. |
| **NAT Gateway (Avoid!)** | Managed NAT Gateway | **\$32.00/mo per AZ + bandwidth** | **Cost Pitfall Warning:** In dev/staging, place ECS tasks in public subnets with public IPs assigned, eliminating NAT Gateway costs completely! |

> [!WARNING]
> Never create expensive multi-AZ RDS clusters, m5.large instances, or idle NAT Gateways without explicit approval.

---

## 2. Option A: ECS Fargate Deployment (Recommended)

### Step 1: Initialize Terraform
```bash
cd infrastructure/aws/terraform
cp terraform.tfvars.example terraform.tfvars
# Update db_password and jwt_secret in terraform.tfvars
terraform init
terraform plan
terraform apply
```

### Step 2: Push Images to Amazon ECR
```bash
# Authenticate Docker to ECR
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build & push all services
docker compose build
docker tag cloudcart-api-gateway:latest ${ECR_REGISTRY}/cloudcart-api-gateway:latest
docker push ${ECR_REGISTRY}/cloudcart-api-gateway:latest
# Repeat for user, product, inventory, cart, order, payment, notification, frontend
```

### Step 3: Verify Post-Deployment Rollout
```bash
ALB_DNS=$(terraform output -raw alb_dns_name)
echo "CloudCart is live at: http://${ALB_DNS}"
curl -s http://${ALB_DNS}/actuator/health
```

---

## 3. Option B: Amazon EKS Deployment

If deploying to Amazon EKS instead of ECS Fargate:

1. **Create EKS Cluster using `eksctl`:**
   ```bash
   eksctl create cluster \
     --name cloudcart-cluster \
     --version 1.30 \
     --region us-east-1 \
     --nodegroup-name standard-workers \
     --node-type t3.medium \
     --nodes 3 \
     --nodes-min 2 \
     --nodes-max 4 \
     --managed
   ```

2. **Install AWS Load Balancer Controller:**
   ```bash
   helm repo add eks https://aws.github.io/eks-charts
   helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
     -n kube-system \
     --set clusterName=cloudcart-cluster
   ```

3. **Deploy CloudCart Manifests:**
   ```bash
   kubectl apply -k infrastructure/kubernetes/
   ```

---

## 4. Teardown / Resource Cleanup

To ensure zero ongoing charges after demonstrations:
```bash
cd infrastructure/aws/terraform
terraform destroy -auto-approve
```
