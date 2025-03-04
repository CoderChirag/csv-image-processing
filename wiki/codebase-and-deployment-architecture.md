# Codebase & Deployment Architecture, Decisions, Cost Solutioning, & Process Document: Image Processing System

The Image Processing System is deployed on a Single Node (4vCPUs, 8GiB RAM, 100GB Storage) Google Kubernetes Engine (GKE) to leverage its managed Kubernetes capabilities for scalability, reliability, and ease of maintenance. This document details the deployment architecture, justifies key decisions, estimates operational costs, and provides a step-by-step deployment process. The system integrates Kafka for event streaming (deployed on cluster), MongoDB (Atlas free tier) for persistence and ELK Stack (elastic cloud free trial) for observability, with all components orchestrated as containerized workloads.

## Constraints

Cost is the major constraint as this is a demo project, so the system is optimized to work with minimal resources.

The GKE is funded by $200 free credits, and is optimized in a way that complete system would be able to work for 1 month.

## Architecture Overview

The system is deployed as a Kubernetes cluster on GKE, utilizing a single node pool with multiple pods for each microservice. Components are containerized using Docker images and orchestrated via Kubernetes resources (StatefulSets, Deployments, Services, ConfigMaps, Secrets).

## Codebase Overview

- The repository is designed as a monorepo powered by `yarn workspaces`, `lerna` and `nx`. The same codebase (hence the same image) serves for both API app, as well as Consumer App depending on the environment variables.
- In the monorepo `packages/*` are the custom written libraries for standardizing interactions to Database, Queues, Caches etc, the their corresponding NestJs Custom Module Wrappers.
- `app/*` is the core source code for the API and consumer application and is powered by NestJS following **Robert C. Martin's Clean Coding Principles** and adhering to **SOLID guidelines**.
- All the deployment configurations are present in the `./k8s` folder in form of **Helm Charts** for templating, packaging & releasing Kubernetes Manifests in an efficient, maintainable & reusable way
- `Dockerfile` is present in the root of the repository, which is a multi-staged dockerfile written in a very optimized manner.

## Components & Deployment Types

### GKE Cluster:
- **Type:** Standard cluster (not Autopilot, for cost control).
- **Node Pool:** Single pool, `c2d-highcpu-4` (4 vCPUs, 8 GiB memory).
- **Nodes:** 1 (scalable to 2+).
- **Estimated Cost for the setup**: \$197-\$200 for 1 month

### Kafka Stack

The Kafka Stack is combined into a single helm chart present at `./k8s/kafka-stack`. This chart can be deployed as follows:
```bash
kubectl create ns kafka
helm upgrade --install kafka k8s/kafka-stack -n kafka
```
This chart consists of the following components:

#### 1. Kafka Cluster
- **Type:** StatefulSet (for having stable pod identities for every broker).
- **Replicas:** 1 (scalable to 3+).
- **Storage:** PersistentVolumeClaim (PVC) with GKE standard StorageClass (1 GiB).
- **Service:** Headless (ports: 29092, 9092, 9997, 29093). Resultant Broker URL - `kafka-0.kafka.kafka.svc.cluster.local:29092`
- **Resources**
  ```yaml
  requests:
    memory: 768Mi
    cpu: 250m
  limits:
    memory: 1536Mi
    cpu: 500m
  ```
#### 2. Kafka Schema Registry:
- **Type:** StatefulSet (for leader election for multi-pod).
- **Replicas:** 1.
- **Service:** Headless (port: 8085). Resultant Registry URL - `http://kafka-schema-registry-0.kafka-schema-registry.kafka.svc.cluster.local:8085`
- **Resources**
  ```yaml
  resources:
    requests:
      memory: 256Mi
      cpu: 50m
    limits:
      memory: 512Mi
      cpu: 150m
  ```
#### 3. Kafka UI
- **Type:** Deployment (stateless).
- **Replicas:** 1.
- **Service:** NodePort (port: 8080). NodePort is chosen to save cost for having a LoadBalancer provisioned by GKE.
- **Resources**
  ```yaml
  resources:
    requests:
      memory: 256Mi
      cpu: 50m
    limits:
      memory: 512Mi
      cpu: 150m
  ```

### Application Deployment

- Application Deployment chart is present in `./k8s/csv-image-processing`. Api App is deployed in `api` namespace & consumer app is deployed in `consumer` namespace.
- Following are the commands for deploying application & consumer:
  ```bash
  # API app deployment
  kubectl create ns api
  kubectl create secret generic mongo-uri --from-literal MONGO_URI=<uri> -n api
  kubectl create secret generic apm-uri --from-literal APM_URI=<uri> -n api
  kubectl create secret generic apm-api-key --from-literal APM_API_KEY=<key> -n api
  kubectl create secret generic gh-pat-token --from-literal GH_PAT_TOKEN=<token> -n api
  helm upgrade --install csv-image-processing k8s/csv-image-processing -f k8s/csv-image-processing/api-app.yaml -n api

  # Consumer App Deployment
  kubectl create ns consumer
  kubectl create secret generic mongo-uri --from-literal MONGO_URI=<uri> -n consumer
  kubectl create secret generic apm-uri --from-literal APM_URI=<uri> -n consumer
  kubectl create secret generic apm-api-key --from-literal APM_API_KEY=<key> -n consumer
  kubectl create secret generic gh-pat-token --from-literal GH_PAT_TOKEN=<token> -n consumer
  helm upgrade --install csv-image-processing k8s/csv-image-processing -f k8s/csv-image-processing/consumer-app.yaml -n consumer
  ```
#### 1. Api Service
- **Type:** Deployment (stateless).
- **Replicas:** 2.
- **Service:** NodePort (port: 80). NodePort is chosen to save cost for having a LoadBalancer provisioned by GKE.
- **Resources**
  ```yaml
  resources:
    requests:
      memory: 256Mi
      cpu: 50m
    limits:
      memory: 512Mi
      cpu: 150m
  ```
#### 2. Consumer Service
- **Type:** Deployment (stateless).
- **Replicas:** 2.
- **Resources**
  ```yaml
  resources:
    requests:
      memory: 512Mi
      cpu: 250m
    limits:
      memory: 1536Mi
      cpu: 500m
  ```

### Total Resource Consumption
```yaml
resources:
  requests:
    memory: 2816Mi # 768 + 256 + 256 + 256*2 + 512*2
    cpu: 950m # 250 + 50 + 50 + 50*2 + 250*2
  limits:
    memory: 6656Mi # 1536 + 512 + 512 + 512*2 + 1536*2
    cpu: 2100m # 500 + 150 + 150 + 150*2 + 500*2
```