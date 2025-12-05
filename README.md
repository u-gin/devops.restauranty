# Restauranty Microservices Project

A multi-microservice application including Auth, Items, Discounts, and a React client. Deployed on Kubernetes with Docker, monitored via Prometheus/Grafana.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Local Development](#local-development)
3. [Containerization](#containerization)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Ingress](#ingress)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Logging](#monitoring--logging)
8. [Environment Variables & Secrets](#environment-variables--secrets)
9. [Testing](#testing)
10. [Notes](#notes)

---

## Project Overview
This project contains:

| Microservice | Port | Description |
|--------------|------|-------------|
| Auth         | 3001 | Handles authentication, JWT, user management |
| Items        | 3003 | Manages items in the restaurant |
| Discounts    | 3002 | Handles discounts and promotions |
| Client       | 80   | React frontend |

Monitoring is provided by Prometheus, and dashboards are available via Grafana.

---

## Local Development

Each microservice and client can be run locally on separate ports:

```bash
# In separate terminals
cd auth && npm install && npm start
cd items && npm install && npm start
cd discounts && npm install && npm start
cd client && npm install && npm start



HAProxy Local Routing

The haproxy.cfg routes requests to each microservice:

frontend http_front
    bind *:8080
    acl is_auth path_beg /api/auth
    acl is_items path_beg /api/items
    acl is_discounts path_beg /api/discounts

    use_backend auth_backend if is_auth
    use_backend items_backend if is_items
    use_backend discounts_backend if is_discounts

backend auth_backend
    server auth 127.0.0.1:3001

backend items_backend
    server items 127.0.0.1:3003

backend discounts_backend
    server discounts 127.0.0.1:3002


Visit http://localhost:8080/api/auth to access the Auth service locally.


Containerization

Dockerfiles exist for each microservice and client:

# Build Docker image for Auth
docker build -t auth:latest ./auth

# Run container with environment variables
docker run -p 3001:3001 --env-file ./auth/.env auth:latest

Kubernetes Deployment

Deployment YAMLs and Services are provided for EKS/Minikube:

kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/items-deployment.yaml
kubectl apply -f k8s/discounts-deployment.yaml
kubectl apply -f k8s/client-deployment.yaml


CI/CD Pipeline

GitHub Actions pipeline builds, tests, containerizes, and deploys services to Kubernetes.

.github/workflows/ci-cd.yaml

Pipeline steps:

Install dependencies & run tests
Build Docker images
Push images to AWS ECR (or container registry)
Apply Kubernetes manifests or Helm charts