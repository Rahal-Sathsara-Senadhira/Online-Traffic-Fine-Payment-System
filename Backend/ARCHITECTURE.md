# Backend Architecture — Online Traffic Fine Payment System

> Node.js · Express · JWT (jsonwebtoken) · bcrypt · Axios · MySQL / PostgreSQL

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Project Structure](#2-project-structure)
3. [Layer Breakdown](#3-layer-breakdown)
4. [Domain Model & Database Schema](#4-domain-model--database-schema)
5. [REST API Design](#5-rest-api-design)
6. [Authentication & Security Architecture](#6-authentication--security-architecture)
7. [SMS Notification Architecture](#7-sms-notification-architecture)
8. [Exception Handling Architecture](#8-exception-handling-architecture)
9. [Middleware Pipeline](#9-middleware-pipeline)
10. [Configuration & Environment](#10-configuration--environment)
11. [Dependencies](#11-dependencies)

---

## 1. Architectural Overview

The backend is a **Node.js / Express** REST API structured as a strict **N-Tier Layered Architecture**. Each layer has one responsibility and communicates only with the layer directly beneath it.

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                   (Routes + Controllers)                     │
│  Parse HTTP, validate input, call service, return JSON       │
│                                                              │
│  auth.routes    fine.routes    payment.routes                │
│  officer.routes category.routes  report.routes               │
└───────────────────────────┬──────────────────────────────────┘
                            │  plain JS objects (DTOs)
┌───────────────────────────┴──────────────────────────────────┐
│                     SERVICE LAYER                            │
│                   (Business Logic)                           │
│  Enforces rules, hashes passwords, signs JWTs,              │
│  triggers SMS, coordinates DB calls                         │
│                                                              │
│  auth.service   fine.service   payment.service               │
│  officer.service  category.service  report.service           │
│  sms.service                                                 │
└───────────────────────────┬──────────────────────────────────┘
                            │  SQL via db pool
┌───────────────────────────┴──────────────────────────────────┐
│                   REPOSITORY LAYER                           │
│                  (Database Queries)                          │
│  Raw SQL or ORM queries — no business logic                  │
│                                                              │
│  fine.repository   payment.repository  officer.repository    │
│  category.repository  user.repository                        │
└───────────────────────────┬──────────────────────────────────┘
                            │  mysql2 / pg driver
┌───────────────────────────┴──────────────────────────────────┐
│                       DATABASE                               │
│                   MySQL / PostgreSQL                         │
└──────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles Applied

| Principle | Application |
|---|---|
| Separation of Concerns | Routes handle HTTP; services handle logic; repositories handle data |
| Dependency Inversion | Controllers import services by module — swappable without touching controllers |
| Single Responsibility | Each service file owns exactly one domain concept |
| DRY | Shared JWT and error logic live in `utils/` — never duplicated |
| Fail Fast | Auth middleware rejects invalid tokens before requests reach controllers |

---

## 2. Project Structure

```
Backend/
├── src/
│   ├── server.js                        # HTTP server entry point
│   ├── app.js                           # Express app, middleware, route registration
│   │
│   ├── config/
│   │   ├── db.js                        # Database connection pool
│   │   └── env.js                       # Validated environment variables
│   │
│   ├── routes/                          # ROUTE DEFINITIONS (URL → controller method)
│   │   ├── auth.routes.js
│   │   ├── fine.routes.js
│   │   ├── payment.routes.js
│   │   ├── officer.routes.js
│   │   ├── category.routes.js
│   │   └── report.routes.js
│   │
│   ├── controllers/                     # PRESENTATION LAYER
│   │   ├── auth.controller.js
│   │   ├── fine.controller.js
│   │   ├── payment.controller.js
│   │   ├── officer.controller.js
│   │   ├── category.controller.js
│   │   └── report.controller.js
│   │
│   ├── services/                        # SERVICE LAYER (business logic)
│   │   ├── auth.service.js              # login, register, bcrypt, JWT sign
│   │   ├── fine.service.js
│   │   ├── payment.service.js           # payment processing + fires SMS event
│   │   ├── officer.service.js
│   │   ├── category.service.js
│   │   ├── report.service.js
│   │   └── sms.service.js               # Axios call to SMS gateway
│   │
│   ├── repositories/                    # REPOSITORY LAYER (DB queries)
│   │   ├── fine.repository.js
│   │   ├── payment.repository.js
│   │   ├── officer.repository.js
│   │   ├── category.repository.js
│   │   └── user.repository.js
│   │
│   ├── middleware/                      # EXPRESS MIDDLEWARE
│   │   ├── auth.middleware.js           # JWT verification — your core deliverable
│   │   ├── role.middleware.js           # Role-based access control
│   │   └── validate.middleware.js       # Request body validation
│   │
│   └── utils/
│       ├── jwt.util.js                  # generateToken, verifyToken helpers
│       ├── ApiError.js                  # Custom error class with HTTP status
│       └── asyncHandler.js             # Wraps async controllers — no try/catch boilerplate
│
├── .env                                 # Secrets — NOT committed
├── .env.example                         # Template — committed
├── package.json
└── README.md
```

---

## 3. Layer Breakdown

### 3.1 Routes — URL to Controller Mapping

Routes attach middleware and delegate to controllers. No logic here.

```js
// auth.routes.js
router.post('/login',    authController.login);
router.post('/register', protect, requireRole('ADMIN'), authController.register);

// fine.routes.js
router.get('/:referenceNumber',   fineController.getByReference);       // public
router.post('/',  protect, requireRole('ADMIN'), fineController.create); // admin only
router.get('/',   protect, requireRole('ADMIN'), fineController.getAll); // admin only

// payment.routes.js
router.post('/',     paymentController.processPayment);  // public
router.get('/:id',   paymentController.getReceipt);      // public

// report.routes.js — all protected + ADMIN
router.get('/summary',    protect, requireRole('ADMIN'), reportController.getSummary);
router.get('/districts',  protect, requireRole('ADMIN'), reportController.getDistricts);
router.get('/categories', protect, requireRole('ADMIN'), reportController.getCategories);
```

### 3.2 Controllers — Handle HTTP, Call Service

Controllers are thin. They extract data from `req`, call one service method, and send a response.

```js
// Example: fine.controller.js
const getByReference = asyncHandler(async (req, res) => {
  const fine = await fineService.getByReferenceNumber(req.params.referenceNumber);
  res.status(200).json(fine);
});
```

### 3.3 Services — Business Logic

Services contain all rules. They throw `ApiError` when rules are violated.

```js
// Example: payment.service.js (core orchestration)
async function processPayment(payload) {
  const fine = await fineRepo.findByReferenceNumber(payload.referenceNumber);
  if (!fine)                         throw new ApiError(404, 'FINE_NOT_FOUND', 'Fine not found');
  if (fine.category_id !== payload.categoryId) throw new ApiError(422, 'CATEGORY_MISMATCH', '...');
  if (fine.status === 'PAID')        throw new ApiError(409, 'FINE_ALREADY_PAID', '...');

  const payment = await paymentRepo.create({ fineId: fine.id, ...payload });
  await fineRepo.updateStatus(fine.id, 'PAID');

  // Fire-and-forget SMS — don't await, payment response is immediate
  smsService.sendPaymentConfirmation(fine).catch(console.error);

  return payment;
}
```

### 3.4 Repositories — SQL Queries

```js
// Example: fine.repository.js
async function findByReferenceNumber(referenceNumber) {
  const [rows] = await db.query(
    'SELECT f.*, fc.name AS category_name, o.phone AS officer_phone, o.district ' +
    'FROM fines f ' +
    'JOIN fine_categories fc ON f.category_id = fc.id ' +
    'JOIN officers o ON f.officer_id = o.id ' +
    'WHERE f.reference_number = ?',
    [referenceNumber]
  );
  return rows[0] ?? null;
}
```

---

## 4. Domain Model & Database Schema

### Entity Relationship Diagram

```
FineCategory ──< Fine >── Officer
                  │
                  │ 1 : 0..1
                  ▼
               Payment

AppUser  (standalone — admin portal logins only)
```

### SQL Schema

```sql
CREATE TABLE fine_categories (
    id               CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    name             VARCHAR(100)    NOT NULL UNIQUE,
    description      TEXT,
    default_amount   DECIMAL(10,2)   NOT NULL
);

CREATE TABLE officers (
    id               CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    badge_number     VARCHAR(20)     NOT NULL UNIQUE,
    full_name        VARCHAR(150)    NOT NULL,
    phone            VARCHAR(15)     NOT NULL,
    district         VARCHAR(100)    NOT NULL
);

CREATE TABLE fines (
    id               CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    reference_number VARCHAR(20)     NOT NULL UNIQUE,
    category_id      CHAR(36)        NOT NULL REFERENCES fine_categories(id),
    officer_id       CHAR(36)        NOT NULL REFERENCES officers(id),
    driver_nic       VARCHAR(12)     NOT NULL,
    driver_name      VARCHAR(150),
    vehicle_number   VARCHAR(20),
    location         VARCHAR(255),
    amount           DECIMAL(10,2)   NOT NULL,
    status           ENUM('PENDING','PAID') NOT NULL DEFAULT 'PENDING',
    issued_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ref    (reference_number),
    INDEX idx_status (status)
);

CREATE TABLE payments (
    id                    CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    fine_id               CHAR(36)        NOT NULL UNIQUE REFERENCES fines(id),
    amount                DECIMAL(10,2)   NOT NULL,
    payment_method        ENUM('CARD','ONLINE_BANKING') NOT NULL,
    transaction_reference VARCHAR(100),
    paid_at               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_users (
    id               CHAR(36)        PRIMARY KEY DEFAULT (UUID()),
    username         VARCHAR(50)     NOT NULL UNIQUE,
    password_hash    VARCHAR(255)    NOT NULL,
    role             ENUM('ADMIN')   NOT NULL DEFAULT 'ADMIN',
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. REST API Design

Base URL: `/api`

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Returns JWT |
| POST | `/auth/register` | ADMIN | Create admin user |

### Fines

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/fines/:referenceNumber` | Public | Look up fine |
| POST | `/fines` | ADMIN | Issue new fine |
| GET | `/fines` | ADMIN | List all fines |

### Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/payments` | Public | Process payment |
| GET | `/payments/:id` | Public | Get receipt |

### Categories

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/categories` | Public | List categories |
| POST | `/categories` | ADMIN | Create category |

### Officers

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/officers` | ADMIN | List officers |
| POST | `/officers` | ADMIN | Register officer |

### Reports

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/reports/summary` | ADMIN | Overall totals |
| GET | `/reports/districts` | ADMIN | Per-district breakdown |
| GET | `/reports/categories` | ADMIN | Per-category breakdown |

---

## 6. Authentication & Security Architecture

### JWT Flow

```
POST /api/auth/login
  │
  ├─ userRepo.findByUsername(username)         → 401 if not found
  ├─ bcrypt.compare(password, hash)            → 401 if mismatch
  ├─ jwt.sign({ id, role }, JWT_SECRET, 24h)
  └─ res.json({ token, expiresIn: 86400 })


Protected Request: GET /api/reports/summary
  │
  ├─ auth.middleware:
  │     extract "Authorization: Bearer <token>"
  │     jwt.verify(token, JWT_SECRET)          → 401 if invalid/expired
  │     attach decoded payload to req.user
  │
  ├─ role.middleware:
  │     req.user.role === 'ADMIN'              → 403 if wrong role
  │
  └─ reportController.getSummary(req, res)
```

### JWT Token Structure

```
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "id": "uuid", "role": "ADMIN", "iat": ..., "exp": ...+86400 }
Signature: HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)
```

### Password Hashing

- Algorithm: **bcrypt**, salt rounds: **12**
- Hash stored in `app_users.password_hash` — plaintext password never persisted
- Comparison: `bcrypt.compare(plaintext, hash)` — constant-time, safe against timing attacks

### CORS Policy

```js
cors({
  origin: [process.env.ADMIN_PORTAL_URL, process.env.DRIVER_PORTAL_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

---

## 7. SMS Notification Architecture

SMS is sent **fire-and-forget** after a successful payment — the API response is returned to the client immediately and SMS is dispatched asynchronously.

```
PaymentService.processPayment()
  │
  ├─ [sync]  Save payment, mark fine PAID, return receipt to client
  │
  └─ [async, fire-and-forget]
       smsService.sendPaymentConfirmation(fine)
            │
            └─ axios.post(SMS_GATEWAY_URL, {
                  to:   officer.phone,
                  body: `Fine ${fine.reference_number} has been paid.
                         Driver may retrieve their license.`
               }, { headers: { Authorization: SMS_API_KEY } })
```

```js
// sms.service.js
async function sendPaymentConfirmation(fine) {
  await axios.post(process.env.SMS_GATEWAY_URL, {
    to:      fine.officer_phone,
    message: `Fine ${fine.reference_number} paid. Driver ${fine.driver_name} may collect their license.`,
  }, {
    headers: { 'Authorization': `Bearer ${process.env.SMS_API_KEY}` },
  });
}
```

---

## 8. Exception Handling Architecture

### ApiError Class

```js
// utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
```

### asyncHandler Wrapper

Eliminates repetitive try/catch in every controller.

```js
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

### Global Error Middleware (last middleware in app.js)

```js
app.use((err, req, res, next) => {
  const status  = err.statusCode ?? 500;
  const code    = err.code       ?? 'INTERNAL_ERROR';
  const message = err.message    ?? 'An unexpected error occurred';
  res.status(status).json({ error: code, message, timestamp: new Date().toISOString() });
});
```

### Error Code Reference

| ApiError Code | HTTP | Trigger |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Wrong username or password |
| `TOKEN_MISSING` | 401 | No Authorization header |
| `TOKEN_INVALID` | 401 | Bad/expired JWT |
| `FORBIDDEN` | 403 | Correct token, wrong role |
| `FINE_NOT_FOUND` | 404 | Reference number not in DB |
| `FINE_ALREADY_PAID` | 409 | Fine status is already PAID |
| `CATEGORY_MISMATCH` | 422 | Category ID doesn't match fine |
| `VALIDATION_ERROR` | 400 | Missing/invalid request fields |
| `INTERNAL_ERROR` | 500 | Uncaught error |

---

## 9. Middleware Pipeline

Every request passes through middleware in this order:

```
Request
  │
  ▼
helmet()              — Security headers (XSS, clickjacking protection)
  │
  ▼
cors()                — Allow configured frontend origins
  │
  ▼
express.json()        — Parse JSON body
  │
  ▼
morgan('dev')         — HTTP request logging
  │
  ▼
[route middleware]
  ├─ auth.middleware   — verify JWT, attach req.user      (protected routes only)
  ├─ role.middleware   — check req.user.role              (admin routes only)
  └─ validate.middleware — check required fields          (POST routes)
  │
  ▼
Controller
  │
  ▼
[error middleware]    — catch ApiError, format JSON response
```

---

## 10. Configuration & Environment

### .env.example (committed — template for team)

```
PORT=8080

DB_HOST=localhost
DB_PORT=3306
DB_NAME=trafficfine
DB_USER=root
DB_PASSWORD=

JWT_SECRET=replace-with-a-long-random-256-bit-string
JWT_EXPIRES_IN=86400

SMS_GATEWAY_URL=https://api.sms-provider.com/v1/messages
SMS_API_KEY=your_sms_api_key

ADMIN_PORTAL_URL=http://localhost:3000
DRIVER_PORTAL_URL=http://localhost:3001
```

### .env (NOT committed)

Copy from `.env.example` and fill in real values locally.

### config/env.js — Validated at Startup

```js
const required = ['DB_HOST','DB_NAME','DB_USER','DB_PASSWORD','JWT_SECRET','SMS_API_KEY'];
required.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
});
```

---

## 11. Dependencies

### Runtime

| Package | Purpose |
|---|---|
| `express` | HTTP server and routing |
| `jsonwebtoken` | JWT signing and verification |
| `bcryptjs` | Password hashing (bcrypt) |
| `axios` | HTTP client for SMS gateway API calls |
| `mysql2` | MySQL database driver (promise-based) |
| `dotenv` | Load `.env` into `process.env` |
| `cors` | CORS headers |
| `helmet` | Security headers |
| `morgan` | HTTP request logging |
| `uuid` | Generate UUIDs for IDs |
| `express-validator` | Request body validation |

### Dev

| Package | Purpose |
|---|---|
| `nodemon` | Auto-restart on file changes |
| `jest` | Unit testing |
| `supertest` | HTTP integration testing |
