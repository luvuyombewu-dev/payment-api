# Payment API

A full‑stack payment and order management system built with **Spring Boot**, **React**, **PostgreSQL**, and **Stripe**.  
Users can register, log in, manage products, place orders, and pay securely using Stripe.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- User registration and login with **JWT authentication**
- Role‑based access control (ready for extension)
- Full product management:
  - Create, read, update, delete products
  - Stock tracking and validation
  - Active/inactive product status
- Shopping cart:
  - Add/remove products
  - Adjust quantities
  - Real‑time total calculation
- Order management:
  - Create orders from cart
  - Automatic stock deduction
  - Order status tracking (`PENDING`, `CONFIRMED`, `PAID`, `CANCELLED`, `REFUNDED`)
  - Stock restoration when orders are deleted
- Stripe payment integration:
  - PaymentIntent creation
  - Stripe Payment Element UI
  - Webhook handling for `payment_intent.succeeded` and `payment_intent.payment_failed`
  - Automatic order status update to `PAID`
- Docker support for containerized development and deployment
- Externalized configuration for secrets (environment variables)

---

## Tech Stack

**Backend**
- Java 21
- Spring Boot 3.4.5
- Spring Security
- Spring Data JPA / Hibernate
- PostgreSQL
- JSON Web Tokens (JWT) via `jjwt`
- Stripe Java SDK
- Lombok

**Frontend**
- React 18
- Vite
- Stripe React components (`@stripe/react-stripe-js`, `@stripe/stripe-js`)
- Custom CSS

**DevOps**
- Docker
- Docker Compose

---

## Architecture
React frontend
|
| REST API (JSON)
v
Spring Boot backend
|
| JPA / Hibernate
v
PostgreSQL database

Spring Boot backend
|
| Stripe SDK
v
Stripe API (PaymentIntent, webhooks)

text

The frontend is served as a static React app. In development, Vite proxies API requests to the backend. In Docker, Nginx serves the frontend and proxies `/api` requests to the backend service.

---

## Prerequisites

Before running the project, ensure you have:

- **Java 21** or higher
- **Maven 3.9+** (or use the included Maven wrapper `./mvnw`)
- **Node.js 20+** and npm
- **PostgreSQL 16+**
- **Docker** and **Docker Compose** (optional, for Docker setup)
- **Stripe account** with test keys

---

## Getting Started (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/luvuyombewu-dev/payment-api.git
cd payment-api
2. Set environment variables
Create a .env file in the project root or set environment variables in your terminal. Example:

bash
export DB_PASSWORD=Postgres123!
export JWT_SECRET=9a8f7e6d5c4b3a2918273645546372819293a4b5c6d7e8f9a0b1c2d3e4f50617
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
export VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
3. Start PostgreSQL
Make sure PostgreSQL is running and create a database:

sql
CREATE DATABASE payment_db;
4. Run the backend
From the project root:

bash
./mvnw spring-boot:run
The backend will start on http://localhost:8080.

5. Run the frontend
Open a new terminal, navigate to the frontend folder, and run:

bash
cd frontend
npm install
npm run dev
The frontend will be available at http://localhost:5173.

Running with Docker
1. Create a docker.env file
Copy the sample environment variables into a file named docker.env in the project root.
Do not commit this file.

env
DB_PASSWORD=Postgres123!
JWT_SECRET=9a8f7e6d5c4b3a2918273645546372819293a4b5c6d7e8f9a0b1c2d3e4f50617
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
2. Build and start the containers
bash
docker-compose --env-file docker.env up --build
3. Access the application
Frontend: http://localhost:3000

Backend: http://localhost:8081

PostgreSQL: localhost:5433

To stop:

bash
docker-compose --env-file docker.env down
Environment Variables
Variable	Description	Required
DB_PASSWORD	PostgreSQL password	Yes
JWT_SECRET	Secret key for signing JWT tokens (at least 32 characters)	Yes
STRIPE_SECRET_KEY	Stripe secret key (sk_test_...)	Yes
STRIPE_WEBHOOK_SECRET	Stripe webhook signing secret (whsec_...)	Yes
VITE_STRIPE_PUBLISHABLE_KEY / STRIPE_PUBLISHABLE_KEY	Stripe publishable key (pk_test_...)	Yes
Running Tests
Backend tests use JUnit 5 and MockMvc.

bash
./mvnw test
Make sure the test database is available (or use an H2 in‑memory database for tests).

API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Log in and receive JWT
Products
Method	Endpoint	Description
GET	/api/products	Get all products
GET	/api/products/{id}	Get product by ID
POST	/api/products	Create a product
PUT	/api/products/{id}	Update a product
DELETE	/api/products/{id}	Delete a product
Orders
Method	Endpoint	Description
GET	/api/orders	Get all orders
GET	/api/orders/{id}	Get order by ID
GET	/api/orders/number/{orderNumber}	Get order by order number
POST	/api/orders	Create a new order
PUT	/api/orders/{id}/status?status=PAID	Update order status
DELETE	/api/orders/{id}	Delete an order and restore stock
Payments
Method	Endpoint	Description
POST	/api/payments	Create a Stripe PaymentIntent
POST	/api/payments/webhook	Stripe webhook endpoint
Project Structure
text
payment-api/
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── ...
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── src/
│   ├── main/
│   │   ├── java/com/example/payment_api/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── exception/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   └── service/
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── Dockerfile                 # Backend Dockerfile
├── docker-compose.yml
├── docker.env                 # Not committed
├── pom.xml
└── README.md
Security
JWT authentication for all protected endpoints.

BCrypt password hashing.

CORS restricted to allowed origins.

Secrets externalized via environment variables.

No sensitive data committed to version control.

Stripe webhook signature verification.

Note: The current implementation does not yet include rate limiting, account lockout, or password reset. These can be added for production hardening.

Deployment
Backend
Deploy the Spring Boot app to platforms like:

Render

Railway

AWS

Set the required environment variables and update the database URL.

Frontend
Deploy the React app to:

Vercel

Netlify

Set VITE_STRIPE_PUBLISHABLE_KEY in the platform's environment variables.

Database
Use a managed PostgreSQL service:

Supabase

Neon

AWS RDS

Stripe Webhooks
Update the Stripe webhook endpoint to point to your production backend URL, e.g., https://your-backend.com/api/payments/webhook.

Contributing
Contributions are welcome! If you find a bug or want to suggest an improvement, please open an issue or submit a pull request.

License
This project is open source and available under the MIT License.
