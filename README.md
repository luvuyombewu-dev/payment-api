# Payment API

A full‑stack payment and order management system built with **React**, **Spring Boot**, **Spring Security**, **JWT authentication**, **PostgreSQL**, **Stripe**, and **Docker**.
<img width="400" height="400" alt="images (6)" src="https://github.com/user-attachments/assets/84a5a163-2be7-45c1-a96e-861f3d5844d4" />
<img width="522" height="343" alt="1_NJSv6DGoKTloI8d8im98zg" src="https://github.com/user-attachments/assets/2d768326-3444-45f4-80c8-fabc75fc08b9" /><img width="554" height="554" alt="images (7)" src="https://github.com/user-attachments/assets/b1aa01bb-ee83-44b7-88ee-390c034269ec" />
<img width="3840" height="2160" alt="Stripe-Emblem" src="https://github.com/user-attachments/assets/53e26a20-24a5-40e7-8aad-4b9201383dea" />


The application provides secure user authentication, product management, shopping cart functionality, order creation, stock management, and Stripe payment processing through a modern web interface.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Backend](#backend)
- [Frontend](#frontend)
- [Authentication and Security](#authentication-and-security)
- [Payment and Order Operations](#payment-and-order-operations)
- [Database](#database)
- [Docker](#docker)
- [Configuration](#configuration)
- [Clone / How to Run](#clone--how-to-run)
- [Running the Project Locally](#running-the-project-locally)
- [Running with Docker](#running-with-docker)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Git and Version Control](#git-and-version-control)
- [Development Workflow](#development-workflow)
- [Project Design Principles](#project-design-principles)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)
- [Future Improvements](#future-improvements)
- [Project Status](#project-status)
- [Author](#author)
- [Repository](#repository)
- [License](#license)
- [Screenshot](#screenshot)
  
---

## Project Overview

The Payment API is a full‑stack web application that simulates core e‑commerce payment and order processing functionality.

The system consists of two primary applications:

- A **Spring Boot REST API** responsible for authentication, authorization, product management, order processing, Stripe payment creation, webhook handling, and database communication.
- A **React frontend** responsible for the user interface, shopping cart, product administration, order creation, and payment form integration.

**PostgreSQL** is used as the relational database, while **Docker Compose** provides a containerized environment for the backend, frontend, and database.

The project was developed with an emphasis on:

- Secure authentication
- RESTful API design
- Separation of frontend and backend responsibilities
- Database persistence
- Stock and order management
- Stripe payment integration
- Environment‑based configuration
- Containerization
- Maintainable project structure

---

## Features

### Authentication

- User registration
- User login
- JWT‑based authentication
- Secure password hashing
- Authentication state management
- Protected application routes
- Logout functionality

### Product Management

- Create, read, update, and delete products
- Stock tracking and validation
- Active/inactive product status
- Product listing and details

### Shopping Cart

- Add products to cart
- Remove products from cart
- Adjust quantities
- Real‑time cart total calculation
- Stock‑aware cart controls

### Order Management

- Create orders from cart
- Automatic stock deduction
- Order status tracking (`PENDING`, `CONFIRMED`, `PAID`, `CANCELLED`, `REFUNDED`)
- Stock restoration when orders are deleted
- Order retrieval by ID and order number

### Stripe Payment Integration

- PaymentIntent creation
- Stripe Payment Element UI
- Secure card entry
- Webhook handling for `payment_intent.succeeded` and `payment_intent.payment_failed`
- Automatic order status update to `PAID`
- Direct backend order status synchronization

### Frontend Interface

- Clean, responsive dashboard
- Authentication screens (login/register)
- Product management panel
- Shopping cart
- Order details panel
- Stripe payment form
- Success/error states

### Developer Features

- REST API
- PostgreSQL integration
- Docker Compose configuration
- Environment‑based configuration
- Maven build system
- React/Vite development environment
- Git version control
- Automated backend tests

---

## Technology Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Java 21 | Backend programming language |
| Spring Boot 3.4.5 | Backend application framework |
| Spring Web | REST API |
| Spring Security | Authentication and authorization |
| JWT | Stateless authentication |
| Spring Data JPA | Database persistence |
| Hibernate | ORM |
| PostgreSQL | Relational database |
| Maven | Dependency management and build |
| Lombok | Boilerplate reduction |
| Stripe Java SDK | Payment processing |
| JJWT | JWT generation and parsing |

### Frontend

| Technology | Purpose |
|------------|---------|
| React | User interface |
| Vite | Frontend build tool |
| JavaScript | Frontend programming language |
| HTML | Application structure |
| CSS | Application styling |
| fetch / custom API service | HTTP communication |
| Stripe React components | Payment Element integration |

### DevOps

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi‑container orchestration |
| Git | Version control |
| GitHub | Source code hosting |

---

## System Architecture

The application follows a layered full‑stack architecture.

```
                    Payment API
                          |
              +-----------+-----------+
              |                       |
              v                       v
       React Frontend          Spring Boot API
              |                       |
              |                       |
              +---------- HTTP --------+
                                      |
                              Spring Security
                                      |
                                  JWT Filter
                                      |
                               Service Layer
                                      |
                              Repository Layer
                                      |
                                  Hibernate
                                      |
                                  PostgreSQL
```

### Request Flow

A typical authenticated request follows this process:

```
User
 |
 v
React Frontend
 |
 v
HTTP Request (with JWT)
 |
 v
Spring Boot REST Controller
 |
 v
JWT Authentication Filter
 |
 v
Spring Security
 |
 v
Service Layer
 |
 v
Repository
 |
 v
PostgreSQL
 |
 v
Response
 |
 v
React Frontend
```

---

## Project Structure

```
payment-api/
│
├── .gitignore
│
├── pom.xml
├── Dockerfile
├── docker-compose.yml
├── docker.env                 # Not committed
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/payment_api/
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── exception/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       ├── security/
│   │   │       └── service/
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       └── application-docker.properties
│   │
│   └── test/
│
└── frontend/
    │
    ├── package.json
    ├── vite.config.js
    │
    └── src/
        ├── components/
        ├── services/
        ├── App.jsx
        ├── App.css
        └── main.jsx
```

---

## Backend

The backend is implemented using Spring Boot and follows a layered architecture.

### Controller Layer

The controller layer exposes REST endpoints to the frontend.

Examples include:

- `AuthController`
- `ProductController`
- `OrderController`
- `PaymentController`
- `PaymentWebhookController`

Controllers receive HTTP requests, validate incoming data, and delegate business operations to the service layer.

### Service Layer

Business logic is implemented in service classes.

Examples include:

- `AuthService` / `AuthServiceImpl`
- `ProductService` / `ProductServiceImpl`
- `OrderService` / `OrderServiceImpl`
- `PaymentService` / `PaymentServiceImpl`

The service layer prevents business logic from being tightly coupled to controllers or database repositories.

### Repository Layer

Spring Data JPA repositories provide database access.

Examples include:

- `UserRepository`
- `ProductRepository`
- `OrderRepository`
- `OrderItemRepository`

### Model Layer

The backend contains domain entities representing the payment system.

Core entities include:

- `User`
- `Product`
- `Order`
- `OrderItem`
- `OrderStatus` (enum)

---

## Frontend

The frontend is implemented using React and Vite.

The frontend communicates with the backend through REST API requests.

### Main Application Areas

- **Authentication**
  - Login
  - Register
- **Product Management**
  - Product list
  - Create product
  - Update product
  - Delete product
- **Shopping Cart**
  - Add item
  - Remove item
  - Adjust quantity
  - Cart total
- **Order**
  - Create order
  - View order details
  - Order status
- **Payment**
  - Stripe Payment Element
  - Payment success/failure handling
  - Automatic order status update to `PAID`

---

## Authentication and Security

Security is an important part of the application architecture.

### JWT Authentication

The backend uses JSON Web Tokens for stateless authentication.

After successful login, the server generates a JWT.

The frontend stores the authentication information and sends the token with authenticated requests.

Requests use the following authorization format:

```
Authorization: Bearer <JWT_TOKEN>
```

The backend JWT authentication filter extracts the token from the request and validates the authenticated user.

### Spring Security

Spring Security protects authenticated endpoints while allowing public authentication endpoints.

The security architecture uses:

- Stateless sessions
- JWT authentication
- Authentication filters
- Protected API endpoints
- Password hashing
- Role‑based security infrastructure (ready for extension)

### Password Security

Passwords are not stored as plaintext. The application uses BCrypt password encoding to securely hash user passwords before persistence.

### Secret Management

Sensitive configuration is not committed to source control.

Configuration values such as:

- `DB_PASSWORD`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

are supplied through environment variables.

Local configuration files containing secrets are excluded from Git.

---

## Payment and Order Operations

### Order Creation

1. User adds products to cart.
2. User clicks **Create Order**.
3. Backend validates product availability and stock.
4. Backend calculates total amount.
5. Backend deducts stock.
6. Backend persists the order and order items.
7. Order status is set to `PENDING`.

### Payment

1. User clicks **Pay Now — Stripe**.
2. Backend creates a Stripe PaymentIntent.
3. Stripe Payment Element renders secure card fields.
4. User enters card details and confirms payment.
5. Upon success, the frontend updates the order status to `PAID`.
6. The backend also handles Stripe webhooks and updates the order in the database.

### Stripe Webhook

Stripe sends events to:

```
POST /api/payments/webhook
```

The backend verifies the webhook signature and processes:

- `payment_intent.succeeded` → mark order as `PAID`
- `payment_intent.payment_failed` → log failure

### Stock Handling

- Stock is deducted when an order is created.
- Stock is restored when an order is deleted.
- Products with zero stock cannot be added to the cart.
- Quantity validation prevents exceeding available stock.

---

## Database

PostgreSQL is used as the primary relational database.

The application uses:

```
Spring Data JPA
        |
        v
Hibernate
        |
        v
PostgreSQL
```

### Core Tables

- `users`
- `products`
- `orders`
- `order_items`

### Database Configuration

The application supports environment‑based database configuration.

Example:

```
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/payment_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD}
```

---

## Docker

Docker is used to provide a reproducible runtime environment for the application.

The Docker Compose configuration contains three services:

```
PostgreSQL
    |
    v
Spring Boot API
    |
    v
React Frontend (Nginx)
```

### PostgreSQL Container

The PostgreSQL service provides the payment database.

### Backend Container

The Spring Boot application runs in its own container and connects to PostgreSQL using the Docker service name `db`.

### Frontend Container

The React frontend is built and served by Nginx. Nginx proxies `/api` requests to the backend service.

### Container Dependency

The backend depends on PostgreSQL being healthy before starting.

The PostgreSQL health check uses `pg_isready`.

---

## Configuration

The main Spring Boot configuration uses environment variables for sensitive values.

Example:

```
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/payment_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD}

jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

stripe.secret.key=${STRIPE_SECRET_KEY:}
stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET:}
```

Required environment variables include:

- `DB_PASSWORD`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Optional variables include:

- `DB_URL`
- `DB_USERNAME`
- `JWT_EXPIRATION`
- `STRIPE_PUBLISHABLE_KEY`

For Docker Compose, environment variables are supplied via a separate `docker.env` file.

---

## Clone / How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/luvuyombewu-dev/payment-api.git
cd payment-api
```

### 2. Run the Backend Locally

Make sure PostgreSQL is running and create the `payment_db` database.

From Git Bash:

```bash
export DB_PASSWORD=Postgres123!
export JWT_SECRET=your_jwt_secret
export STRIPE_SECRET_KEY=sk_test_...
export STRIPE_WEBHOOK_SECRET=whsec_...
```

Build and run the backend:

```bash
./mvnw spring-boot:run
```

The backend runs at:

```
http://localhost:8080
```

### 3. Run the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```
http://localhost:5173
```

---

## Running the Project Locally

### Prerequisites

Install the following software:

- Java 21
- Maven
- Node.js
- npm
- PostgreSQL
- Git
- Docker (optional for containerized setup)

---

## Running with Docker

### 1. Create `docker.env`

Create a file named `docker.env` in the project root with:

```env
DB_PASSWORD=Postgres123!
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Start the containers

```bash
docker-compose --env-file docker.env up --build
```

### 3. Access the application

- Frontend: http://localhost:3000
- Backend: http://localhost:8081
- PostgreSQL: `localhost:5433`

To stop:

```bash
docker-compose --env-file docker.env down
```

---

## API Documentation

Swagger/OpenAPI documentation is **not** currently integrated. API endpoints are described below and can be tested via tools like Postman or the frontend.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate a user and receive JWT |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/products/{id}` | Get product by ID |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/{id}` | Update a product |
| `DELETE` | `/api/products/{id}` | Delete a product |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | Get all orders |
| `GET` | `/api/orders/{id}` | Get order by ID |
| `GET` | `/api/orders/number/{orderNumber}` | Get order by order number |
| `POST` | `/api/orders` | Create a new order |
| `PUT` | `/api/orders/{id}/status?status=PAID` | Update order status |
| `DELETE` | `/api/orders/{id}` | Delete an order and restore stock |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/payments` | Create a Stripe PaymentIntent |
| `POST` | `/api/payments/webhook` | Stripe webhook endpoint |

---

## Testing

Backend tests use JUnit 5 and MockMvc.

Run the test suite with:

```bash
./mvnw test
```

Current test coverage includes:

- Product CRUD
- Order creation with stock deduction
- Insufficient stock validation
- Order status updates
- Order deletion with stock restoration

---

## Git and Version Control

The project uses Git for source control and GitHub for remote repository hosting.

Repository:

```
https://github.com/luvuyombewu-dev/payment-api
```

The `.gitignore` excludes sensitive and generated files:

- `target/`
- `node_modules/`
- `dist/`
- `.env`
- `docker.env`
- IDE configuration files
- local application configuration

Sensitive configuration should never be committed.

---

## Development Workflow

A recommended workflow for future development is:

1. Create or switch to a feature branch.
2. Implement the change.
3. Run backend tests.
4. Build the frontend.
5. Test the affected feature.
6. Check Git changes.
7. Review sensitive files.
8. Commit the changes.
9. Push the branch.
10. Merge after verification.

Useful Git commands:

```bash
git status
git diff
git add -A
git commit -m "Description of change"
git push origin main
```

Before committing, check for sensitive data:

```bash
git grep -n "password"
git grep -n "STRIPE_SECRET_KEY"
```

Secrets should not appear in committed source files.

---

## Project Design Principles

The project follows several software engineering principles.

- **Separation of Concerns** – Frontend, backend, database, and security are separated.
- **Layered Architecture** – Controller → Service → Repository → Database.
- **Stateless Authentication** – JWT keeps the API stateless.
- **Environment‑Based Configuration** – Secrets come from environment variables.
- **Reusable Frontend Components** – React components are reused across the UI.
- **RESTful Communication** – The frontend communicates via HTTP JSON APIs.

---

## Error Handling

The backend contains centralized exception handling to provide consistent API error responses.

Errors include:

- Invalid credentials
- Insufficient stock
- Product not found
- Order not found
- Invalid order status
- Stripe payment failures
- Webhook signature verification failures

The frontend displays user‑friendly error messages for these situations.

---

## Security Considerations

The project implements several security mechanisms:

- JWT authentication
- Spring Security
- BCrypt password hashing
- Stateless sessions
- Protected API endpoints
- Environment‑based secrets
- Local configuration exclusion
- Stripe webhook signature verification
- CORS restrictions

For a production e‑commerce application, additional security controls would be required, including:

- HTTPS/TLS
- Key rotation
- Secret management infrastructure
- Rate limiting
- Account lockout policies
- Multi‑factor authentication
- Audit logging
- Fraud detection
- Input validation hardening
- Database encryption
- Security monitoring
- Dependency vulnerability scanning

This project should be considered an educational and portfolio payment application rather than a production financial platform.

---

## Future Improvements

Potential future development includes:

### Security

- Multi‑factor authentication
- Refresh tokens
- JWT key rotation
- Rate limiting
- Account lockout
- Security audit logging

### Payment Features

- Refunds
- Payment method storage
- Subscription billing
- Multiple currencies
- Transaction reports

### Product Management

- Product images
- Categories
- Search and filtering
- Pagination
- Product reviews

### Order Management

- Order history for users
- Order cancellation
- Return/refund workflow
- Email notifications
- Shipping integration

### Administration

- Administrative dashboard
- User management
- Product management
- Order monitoring
- Role‑based administrative permissions

### Testing

- Controller tests
- Integration tests
- Repository tests
- End‑to‑end frontend tests
- Testcontainers‑based PostgreSQL testing

### DevOps

- CI/CD pipeline
- Automated GitHub Actions builds
- Docker image publishing
- Production deployment
- Monitoring and logging

### Frontend

- React Router
- Improved accessibility
- Advanced filtering
- Pagination improvements
- Mobile‑first optimization

---

## Project Status

The core Payment API application has been implemented and pushed to GitHub.

Current implementation includes:

- Spring Boot backend
- Spring Security with JWT
- PostgreSQL database
- JPA/Hibernate
- REST API
- Product management
- Order management
- Stripe payment integration
- Docker configuration
- React frontend
- Authentication
- Shopping cart
- Payment form
- Order status updates

The repository represents the completed core implementation of the payment application, with additional production‑grade capabilities identified as future improvements.

---

## Author

**Luvuyo Mbewu**

Computer Engineering graduate and software developer focused on backend development, full‑stack application development, systems engineering, and secure software architecture.

---

## Repository

GitHub:

```
https://github.com/luvuyombewu-dev/payment-api
```

---

## License

This project is intended primarily for educational, portfolio, and demonstration purposes.

If a specific open‑source license is required for redistribution or commercial use, a license such as MIT should be added to the repository explicitly.

---

## Screenshot

<img width="1251" height="587" alt="Register" src="https://github.com/user-attachments/assets/cb2b6f19-c715-40d5-9cdf-853f4d4a5556" />


<img width="1136" height="553" alt="Login" src="https://github.com/user-attachments/assets/e8a33357-8597-4408-a1e5-d57edaa3ec99" />


<img width="1113" height="612" alt="dashboard" src="https://github.com/user-attachments/assets/0a5b21f0-0583-4087-b476-e33905a2b61a" />


<img width="1112" height="606" alt="Product" src="https://github.com/user-attachments/assets/8d1b1985-f579-4f38-9e46-d5ef4f8ac908" />


<img width="1109" height="588" alt="Order" src="https://github.com/user-attachments/assets/ee3f8d2f-94cd-45c5-be20-939e950a0027" />


<img width="1018" height="630" alt="Payment" src="https://github.com/user-attachments/assets/beef4ea8-61c4-4c78-9e79-be3211eaa495" />


<img width="1083" height="578" alt="Stripe" src="https://github.com/user-attachments/assets/14ab16e2-42ec-44c8-b52f-59cac97833ce" />


<img width="728" height="127" alt="backend stripe" src="https://github.com/user-attachments/assets/7d0fd22e-b96f-4084-945a-3e12856884de" />

