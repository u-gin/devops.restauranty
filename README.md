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
11. [Security](#security)

---

## Project Overview
| Microservice | Port | Description |
|--------------|------|-------------|
| Auth         | 3001 | Handles authentication, JWT, user management |
| Items        | 3003 | Manages items in the restaurant |
| Discounts    | 3002 | Handles discounts and promotions |
| Client       | 80   | React frontend |

Monitoring is provided by Prometheus, and dashboards are available via Grafana.

---

## Local Development
Run each microservice and the client locally:

```bash
# In separate terminals
cd auth && npm install && npm start
cd items && npm install && npm start
cd discounts && npm install && npm start
cd client && npm install && npm start
```

---

### HAProxy Local Routing
`haproxy.cfg` routes requests to each microservice:

```txt
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
```

Visit `http://localhost:8080/api/auth` to access the Auth service locally.

---

## Containerization
Dockerfiles exist for each microservice and the client:

```bash
# Build Docker image for Auth
docker build -t auth:latest ./auth

# Run container with environment variables
docker run -p 3001:3001 --env-file ./auth/.env auth:latest
```

Optional: Use `docker-compose.yaml` to run all services together.

---

## Kubernetes Deployment
Apply the Kubernetes manifests:

```bash
kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/items-deployment.yaml
kubectl apply -f k8s/discounts-deployment.yaml
kubectl apply -f k8s/client-deployment.yaml
```

- Services are exposed internally via ClusterIP.
- Prometheus scraping enabled through service annotations.

---

## Ingress
A single Ingress merges all services under one domain:

| Path             | Service                  |
|-----------------|--------------------------|
| `/api/auth`      | eugene-service-auth      |
| `/api/items`     | eugene-service-items     |
| `/api/discounts` | eugene-service-discounts |
| `/`              | eugene-service-client    |

---

## CI/CD Pipeline
GitHub Actions pipeline (`.github/workflows/ci-cd.yaml`) automates:

1. Install dependencies & run tests  
2. Build Docker images  
3. Push images to AWS ECR or another container registry  
4. Apply Kubernetes manifests or Helm charts  

---

## Monitoring & Logging
- Prometheus scrapes `/metrics` endpoints from each microservice.  
- Grafana dashboards visualize HTTP requests, login attempts, and user count.  
- Logs are aggregated by Kubernetes (stdout).

Access Grafana locally via port-forward:

```bash
kubectl -n prometheus port-forward svc/stable-grafana 3000:80
```

---

## Environment Variables & Secrets
Kubernetes Secrets store sensitive information:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: eugene-secrets
  namespace: eugene
type: Opaque
stringData:
  CLOUD_NAME: "..."
  CLOUD_API_KEY: "..."
  CLOUD_API_SECRET: "..."
  SECRET: "..."
```

Injected into deployments using `env` or `envFrom`:

```yaml
env:
- name: CLOUD_NAME
  valueFrom:
    secretKeyRef:
      name: eugene-secrets
      key: CLOUD_NAME
```

---

## Testing
Run unit and integration tests per microservice:

```bash
cd auth && npm test
cd items && npm test
cd discounts && npm test
```

---

## Notes
- `/metrics` exposes Prometheus metrics.  
- Use `kubectl create secret` instead of committing secrets.  
- Ensure environment variables are set for local and production environments.

---

## Security
See [`SECURITY.md`](SECURITY.md) for detailed security practices:

- K8s Secrets for sensitive info, never commit secrets.  
- Rotate secrets regularly.  
- HTTPS in production.  
- JWT tokens securely stored and validated.  
- Logs do not contain sensiti