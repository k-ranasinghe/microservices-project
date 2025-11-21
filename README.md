# Microservices Project

This project is a microservices application consisting of three services: User Authorization, Product Catalog, and Order Processor. It uses a PostgreSQL database for data persistence and Redis for message queuing. The entire application is containerized using Docker and can be orchestrated with Docker Compose. It also includes Kubernetes configuration files for deployment.

## Architecture

The application is composed of the following services:

*   **User Auth (`user-auth`)**: A Node.js/Express service for user registration and JWT-based authentication.
*   **Product Catalog (`product-catalog`)**: A Go service that provides CRUD operations for products.
*   **Order Processor (`order-processor`)**: A Python/FastAPI service that processes orders from a Redis queue and stores them in the database.
*   **PostgreSQL (`postgres`)**: The main database for storing user, product, and order information.
*   **Redis (`redis`)**: A message broker used as a queue for processing orders asynchronously.

## Services

### User Auth

*   **Technology**: Node.js, Express
*   **Port**: 3000
*   **Endpoints**:
    *   `POST /register`: Registers a new user.
    *   `POST /login`: Logs in a user and returns a JWT token.
    *   `GET /verify`: Verifies a JWT token.
    *   `GET /health`: Health check.

### Product Catalog

*   **Technology**: Go, Mux
*   **Port**: 8080
*   **Endpoints**:
    *   `GET /products`: Retrieves all products.
    *   `GET /products/{id}`: Retrieves a single product by ID.
    *   `POST /products`: Creates a new product.
    *   `PUT /products/{id}`: Updates a product.
    *   `DELETE /products/{id}`: Deletes a product.
    *   `GET /healthz`: Health check.

### Order Processor

*   **Technology**: Python, FastAPI
*   **Port**: 5000
*   **Functionality**:
    *   Exposes an endpoint `POST /enqueue` to add an order to a Redis queue.
    *   A background worker continuously polls the Redis queue for new orders, processes them, and saves them to the PostgreSQL database.
*   **Endpoints**:
    *   `POST /enqueue`: Adds a new order to the queue.
    *   `GET /health`: Health check.

## Technologies Used

*   **Backend**: Node.js (Express), Go (Mux), Python (FastAPI)
*   **Database**: PostgreSQL
*   **Message Queue**: Redis
*   **Containerization**: Docker, Docker Compose
*   **Orchestration**: Kubernetes

## Prerequisites

*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)
*   [Kubernetes CLI (kubectl)](https://kubernetes.io/docs/tasks/tools/install-kubectl/) (for k8s deployment)

## Setup and Running the Project

1.  **Clone the repository**

2.  **Create an environment file**:
    Create a `.env` file in the root of the project and add the following environment variables.

    ```bash
    DB_USER=admin
    DB_PASSWORD=password
    DB_HOST=postgres
    DB_PORT=5432
    DB_NAME=microservices_db
    JWT_SECRET=your-jwt-secret
    REDIS_HOST=redis
    REDIS_PORT=6379
    ```

3.  **Build and run the services using Docker Compose**:

    ```bash
    docker-compose up --build
    ```

    This will start all the services, and the database will be initialized with the schema from `db/V1_init.sql`.

    You can access the services at:
    *   User Auth: `http://localhost:3000`
    *   Product Catalog: `http://localhost:8080`
    *   Order Processor: `http://localhost:5000`

## Kubernetes Deployment

The project also contains Kubernetes manifest files in the `k8s/` directory for deploying the application to a Kubernetes cluster.

**Note**: You will need to have a Kubernetes cluster running and `kubectl` configured to connect to it. You will also need an Ingress controller (like NGINX) and a certificate manager (like cert-manager) if you want to use the provided Ingress and certificate resources.

1.  **Create the namespace**:
    ```bash
    kubectl apply -f k8s/namespace.yaml
    ```

2.  **Create secrets**:
    You'll need to create a `secrets.yaml` file with base64 encoded values for your secrets, or create them directly in the cluster.
    ```bash
    # Example to create a secret
    kubectl create secret generic app-secrets --from-literal=JWT_SECRET='your-jwt-secret' --from-literal=DB_PASSWORD='password' -n microservices
    ```
    Then apply the other manifests:

3.  **Apply the configurations**:
    ```bash
    kubectl apply -f k8s/
    ```

This will deploy all the services, statefulsets, and other resources to your Kubernetes cluster.
