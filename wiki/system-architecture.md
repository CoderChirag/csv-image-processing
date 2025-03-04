# Technical Design Document: Image Processing System

This document outlines the architecture, components, data flows, and implementation details of the system

## Project Overview

The Image Processing System is a microservices-based platform designed to handle image processing workflows triggered by structured data inputs (e.g., CSV files). It leverages event-driven architecture with Apache Kafka for scalability, ELK Stack for logging and observability, and MongoDB for persistent storage, ensuring efficiency, reliability, fault tolerance, and ease of maintenance.

## High Level Design (HLD)

### System Architecture & Data Flow
The system follows a microservices architecture with event-driven communication, integrating Kafka for streaming, MongoDB for persistence, and ELK for observability. Key components include:

- **API Service:** Entry point for data ingestion (e.g., CSV uploads).
- **Kafka Cluster:** Core event streaming and coordination backbone.
- **Schema Registry:** Manages data schemas for consistency. (AVRO schema)
- **Consumer Service:** Processes image events and stores results.
- **MongoDB:** Stores metadata and processing states.
- **ELK Stack:**
  - **Elasticsearch:** Indexes logs and metrics for search (via APM agent).
  - **Kibana:** Visualizes logs and system health.
- **Kafka UI:** Monitors Kafka cluster and topics.
- **GitHub Repository:** External storage for processed images.

### Architecture Diagram

![system_architecture_diagram](./system-architecture.png)


### Design Principles

- **Scalability:** Kafka partitions, service replicas, webhook fan-out.
- **Efficiency:** Asynchronous processing, optimized storage and notifications.
- **Reliability:** Kafka replication, MongoDB durability, webhook retries.
- **Fault Tolerance:** Dead-letter queues, retry mechanisms, service restarts.
- **Maintainability:** Modular design, centralized logging, UI monitoring.

## Low-Level Design (LLD)

### Components

#### 1. Database

**Database Justification**: The choice of MongoDB as the primary database for the Image Processing System is driven by the nature of the input data and the system’s current requirements. At present, the data is inherently non-relational—attributes such as product details or image URLs lack independent entity status and derive meaning only when associated with a unique requestId. This structure aligns seamlessly with MongoDB’s document-oriented model, where each processing request can be stored as a self-contained document.

Currently, the system treats requests as isolated units, with no need for complex relationships between entities like products or images. MongoDB’s document model naturally supports this by encapsulating all request-related data (e.g., metadata, image URLs, processing status) within a single, easily queryable document. This eliminates the overhead of relational database normalization and foreign key constraints, which would be unnecessary and inefficient given the non-relational nature of the data.

**Future Considerations**
Should requirements evolve to introduce relational data—such as registering products as standalone entities, associating requests with product IDs, or tracking relationships between images and categories—a relational database (e.g., PostgreSQL or MySQL) might become necessary.

This is the document schema:
```js
{
  requestId: { type: String, required: true, unique: true },
  status: { type: String, required: true, enum: ["Accepted", "Processing", "Failed", "Succeeded"] },
  message: { type: String, required: true },
  webhookUrl: { type: String, required: true },
  products: {
    type: Map,
    of: ProductSchema,
    required: true,
  }, // Record<productName, Product>
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}

// Product Schema
{
  name: { type: String, required: true },
  inputImageUrls: { type: [String], required: true, default: [] },
  outputImageUrls: { type: [String], default: [] },
}
```

#### 2. API Service

**Technology:** NestJS (Node.js).

**API Endpoints:**
- POST /api/image-processing/process/csv:
  - Accepts structured data (multipart csv file).
  - Accepts `webhookUrl` as query param
  - Parses and Validates CSV data (stream & chunks parsing, instead of buffer for memory optimization)
  - Update Status and CSV data to DB corresponding to a requestId
  - Publishes event to Kafka
  - Returns the requestId
- POST /api/image-processing/status/:reqId:
  - Fetches the status for the give requestId from db.

#### 3. Kafka Schema Design

The project uses AVRO encoding format for enforcing a strict schema to any message being pushed into Kafka Topic. Following is the AVRO schema for our topic:
```json
{
  "type": "record",
  "name": "ProductData",
  "fields": [
    {
      "name": "requestId",
      "type": "string",
      "logicalType": "uuid"
    },
    {
      "name": "webhookUrl",
      "type": "string"
    },
    {
      "name": "products",
      "type": {
        "type": "map",
        "values": {
          "type": "record",
          "name": "Product",
          "fields": [
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "inputImageUrls",
              "type": {
                "type": "array",
                "items": "string"
              }
            }
          ]
        }
      }
    }
  ]
}

```
- Currently 3 **partitions** are configured for our topic among which data is divided equally by keeping request id as key, so at most 3 consumers can work simultaneously.
<br/>
- **Replication factor** currently defaults to 1 due to limited deployment resources, so the system is not in a fault tolerance mode right now.

#### 4. Consumer Service
**Technology:** NestJs (Node.js, kafkajs, sharp, axios, mongodb).

**Input:** Kafka image-processing topic.

**Process:**
  - Images are downloaded from the specified inputImageUrls, and streamed to temp files (not stored in memory as buffer for memory optimization).
  - Then converted to 50% less quality using sharp
  - After conversion, processed images are uploaded to GitHub (for free storage), and outputImageUrls are stored to MongoDB
  - Finally a webhook is triggered with the output csv (content-type: text/csv) to notify the end user.