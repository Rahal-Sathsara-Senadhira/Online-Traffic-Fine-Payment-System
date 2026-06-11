# System Architecture — Online Traffic Fine Payment System

> University of Ruhuna · Software Architecture · Group Project 2026

---

## Table of Contents

1. [Architectural Style](#1-architectural-style)
2. [High-Level System Overview](#2-high-level-system-overview)
3. [Backend Architecture](#3-backend-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Mobile Architecture](#5-mobile-architecture)
6. [Authentication & Authorization Architecture](#6-authentication--authorization-architecture)
7. [Key Flows](#7-key-flows)
8. [Database Architecture](#8-database-architecture)
9. [Design Patterns Applied](#9-design-patterns-applied)
10. [Cross-Cutting Concerns](#10-cross-cutting-concerns)
11. [Technology Decisions](#11-technology-decisions)

---

## 1. Architectural Style

The system follows a **Client-Server architecture** combined with an **N-Tier Layered Architecture** on the backend, and a **component-based architecture** on the frontends.

At the macro level the system is organized into four independent client applications that all communicate with a single centralized **REST API backend**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Admin Web   │  │  Driver Web  │  │   Android Mobile     │  │
│  │   Portal     │  │   Portal     │  │       App            │  │
│  │  (Next.js)   │  │  (Next.js)   │  │     (Android)        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼────────────────────-┼──────────────┘
          │                 │                      │
          │       HTTPS / REST API (JSON)          │
          │                 │                      │
┌─────────┼─────────────────┼─────────────────────┼──────────────┐
│         └─────────────────┴─────────────────────┘              │
│                    BACKEND LAYER (Spring Boot)                  │
│                                                                 │
│          ┌──────────────────────────────────────┐              │
│          │         REST API Application         │              │
│          │  Controller → Service → Repository   │              │
│          └──────────────────┬───────────────────┘              │
└─────────────────────────────┼────────────────────-─────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          │           INFRASTRUCTURE               │
          │  ┌──────────────┐  ┌───────────────┐  │
          │  │   Database   │  │  SMS Gateway  │  │
          │  │  (MySQL/PG)  │  │  (e.g. Twilio)│  │
          │  └──────────────┘  └───────────────┘  │
          └───────────────────────────────────────┘
```

**Rationale:** A shared backend API enforces a single source of truth for business logic and data, while allowing each client (web, mobile) to evolve independently. This separation is a key Software Architecture principle — **Separation of Concerns**.

---

## 2. High-Level System Overview

### Actors

| Actor | Description |
|---|---|
| Driver | Pays traffic fines via mobile app or web portal |
| Traffic Police Officer | Issues fines, receives SMS confirmation on payment |
| Admin / Senior Official | Monitors nationwide fine collections via admin portal |

### System Components

| Component | Technology | Responsibility |
|---|---|---|
| `Backend/` | Java, Spring Boot | REST API, business logic, JWT auth, DB access, SMS trigger |
| `admin-web-portal/` | Next.js (TypeScript) | Dashboard for officials — analytics and reporting |
| `driver-web-portal/` | Next.js (TypeScript) | Online fine payment SPA for drivers |
| `mobile-app/` | Android | On-the-spot fine payment for drivers |
| Database | MySQL / PostgreSQL | Persistent storage via JPA/Hibernate |
| SMS Gateway | Twilio / Dialog | SMS notifications to traffic officers |

---

## 3. Backend Architecture

The backend is built as a **Spring Boot monolith** following a strict **N-Tier Layered Architecture**.

```
┌─────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER                  │
│                  (REST Controllers)                 │
│   /api/fines   /api/payments   /api/auth   /api/reports │
└─────────────────────────┬───────────────────────────┘
                          │  DTOs (Request / Response)
┌─────────────────────────┴───────────────────────────┐
│                  SERVICE LAYER                      │
│           (Business Logic / Use Cases)              │
│  FineService  PaymentService  AuthService  ReportService │
└─────────────────────────┬───────────────────────────┘
                          │  Domain Entities
┌─────────────────────────┴───────────────────────────┐
│               REPOSITORY LAYER                      │
│           (Data Access via Spring JPA)              │
│  FineRepository  PaymentRepository  UserRepository  │
└─────────────────────────┬───────────────────────────┘
                          │  SQL / JPQL
┌─────────────────────────┴───────────────────────────┐
│                   DATABASE                          │
│              MySQL / PostgreSQL                     │
└─────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Presentation Layer — Controllers**
- Receive HTTP requests and return HTTP responses
- Validate incoming request data (`@Valid`)
- Delegate all logic to the service layer — no business logic here
- Map between DTOs and domain entities

**Service Layer**
- Contains all business logic
- Coordinates between multiple repositories when needed
- Triggers cross-cutting actions (e.g., SMS notification after payment)
- Wrapped in transactions (`@Transactional`)

**Repository Layer**
- Extends `JpaRepository` for standard CRUD
- Custom queries using JPQL or Spring Data query methods
- No business logic — pure data access

**Domain Model (Entities)**

```
Fine
├── id (UUID)
├── referenceNumber (unique)
├── categoryId (FK → FineCategory)
├── driverNic
├── officerId (FK → Officer)
├── issuedAt (timestamp)
├── amount (BigDecimal)
└── status (PENDING | PAID | DISPUTED)

Payment
├── id (UUID)
├── fineId (FK → Fine)
├── paidAt (timestamp)
├── paymentMethod
└── transactionReference

FineCategory
├── id
├── name
└── defaultAmount

Officer
├── id
├── badgeNumber
├── phone
└── district

AppUser (Admin)
├── id
├── username
└── passwordHash (BCrypt)
```

### Package Structure

```
backend/
└── src/main/java/com/trafficfine/
    ├── controller/        # REST endpoints
    ├── service/           # Business logic interfaces + implementations
    ├── repository/        # JPA repositories
    ├── entity/            # JPA entities
    ├── dto/               # Request/Response DTOs
    ├── config/            # Security config, JWT config, CORS config
    ├── exception/         # Global exception handler
    └── notification/      # SMS notification service
```

---

## 4. Frontend Architecture

Both `admin-web-portal` and `driver-web-portal` are **Next.js (React)** applications following a **component-based architecture** with a clear separation between UI components, pages, and data-fetching logic.

```
┌──────────────────────────────────────────────────┐
│                   PAGES LAYER                    │
│          (Next.js App Router — /app)             │
│   Route handlers, page-level data fetching       │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────┴───────────────────────────┐
│               COMPONENT LAYER                    │
│     Reusable UI components (pure, presentational)│
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────┴───────────────────────────┐
│               SERVICE / API LAYER                │
│   API client functions (fetch wrappers)          │
│   JWT token attachment via interceptors          │
└──────────────────────┬───────────────────────────┘
                       │  HTTPS REST
┌──────────────────────┴───────────────────────────┐
│              BACKEND REST API                    │
└──────────────────────────────────────────────────┘
```

### Admin Web Portal — Key Pages

| Route | Purpose |
|---|---|
| `/login` | Admin authentication |
| `/dashboard` | Nationwide collection overview |
| `/districts` | District-wise fine collection breakdown |
| `/categories` | Collection breakdown by fine category |

### Driver Web Portal — Key Pages

| Route | Purpose |
|---|---|
| `/` | Enter fine reference number and category |
| `/pay` | Payment form |
| `/confirmation` | Payment success screen |

---

## 5. Mobile Architecture

The Android mobile app follows the **MVVM (Model-View-ViewModel)** pattern, which is the recommended architecture for modern Android development.

```
┌─────────────────────────────────────────────────────┐
│                    VIEW LAYER                       │
│           Activities / Fragments (XML UI)           │
│   Observes LiveData. No business logic.             │
└───────────────────────────┬─────────────────────────┘
                            │ observe / call
┌───────────────────────────┴─────────────────────────┐
│                  VIEWMODEL LAYER                    │
│   Holds UI state, handles user actions              │
│   Calls Repository, exposes LiveData to View        │
└───────────────────────────┬─────────────────────────┘
                            │ suspend functions
┌───────────────────────────┴─────────────────────────┐
│                 REPOSITORY LAYER                    │
│   Single source of truth for data                   │
│   Coordinates between RemoteDataSource (API)        │
└───────────────────────────┬─────────────────────────┘
                            │ Retrofit HTTP calls
┌───────────────────────────┴─────────────────────────┐
│               REMOTE DATA SOURCE                    │
│           Retrofit + REST API Backend               │
└─────────────────────────────────────────────────────┘
```

### Key Screens

| Screen | Purpose |
|---|---|
| `FineEntryActivity` | Enter reference number and category ID |
| `FineDetailsActivity` | Display fine amount and details |
| `PaymentActivity` | Enter card / payment details |
| `ConfirmationActivity` | Show payment success |

---

## 6. Authentication & Authorization Architecture

Authentication is handled via **JWT (JSON Web Tokens)** using **Spring Security** on the backend.

```
Client                         Backend
  │                               │
  │── POST /api/auth/login ───────►│
  │   { username, password }       │ Validate credentials
  │                               │ Generate JWT (signed, 24h expiry)
  │◄── 200 OK { token } ──────────│
  │                               │
  │── GET /api/reports  ──────────►│
  │   Authorization: Bearer <JWT>  │ Filter chain: validate JWT
  │                               │ Extract roles from claims
  │◄── 200 OK { data } ───────────│
```

### JWT Payload (Claims)

```json
{
  "sub": "admin_user_id",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700086400
}
```

### Security Filter Chain (Spring Security)

```
Request
  └─► JwtAuthenticationFilter
        └─► Validate signature + expiry
              └─► Set SecurityContext
                    └─► Controller (authenticated)
```

### Role-Based Access Control

| Role | Permitted Endpoints |
|---|---|
| `ADMIN` | `/api/reports/**`, `/api/fines/**` (read) |
| `DRIVER` / Public | `/api/fines/{ref}` (lookup), `/api/payments` (create) |

Driver payment endpoints are intentionally **public** (no login required) — a driver only needs the reference number and category ID issued on the fine sheet to make a payment.

---

## 7. Key Flows

### 7.1 On-the-Spot Payment (Mobile App)

```
Driver              Mobile App           Backend              SMS Gateway
  │                     │                   │                      │
  │── Enter ref + cat ──►│                   │                      │
  │                     │── GET /fines/{ref}─►│                      │
  │                     │◄── Fine details ───│                      │
  │── Confirm payment ──►│                   │                      │
  │                     │── POST /payments ──►│                      │
  │                     │                   │── Mark fine PAID      │
  │                     │                   │── POST SMS ──────────►│
  │                     │                   │                      │── SMS to officer
  │                     │◄── 200 OK ─────────│                      │
  │◄── Success screen ──│                   │                      │
```

### 7.2 Online Payment (Driver Web Portal)

```
Driver           Web Portal           Backend
  │                  │                   │
  │── Enter ref ────►│                   │
  │                  │── GET /fines/{ref}─►│
  │◄── Fine details ─│◄── Fine data ──────│
  │── Enter card ───►│                   │
  │                  │── POST /payments ──►│
  │                  │◄── 200 + receipt ──│
  │◄── Confirmation ─│                   │
```

### 7.3 Admin Monitoring

```
Admin           Admin Portal         Backend
  │                  │                   │
  │── Login ────────►│── POST /auth/login─►│
  │◄── JWT ──────────│◄── JWT token ──────│
  │                  │                   │
  │── View dashboard─►│── GET /reports ───►│ (JWT in header)
  │◄── Charts/data ──│◄── Aggregated data─│
```

---

## 8. Database Architecture

### Entity Relationship (Simplified)

```
FineCategory ──< Fine >── Officer
                  │
                  │ 1
                  ▼
               Payment
```

### Schema Highlights

- **Fine** is the central entity linking category, officer, and payment
- `referenceNumber` is unique and indexed — primary lookup key for drivers
- `Payment` has a 1:1 relationship with `Fine` (a fine can only be paid once)
- `Officer.phone` stores the number used for SMS notification

### JPA Strategy

- Entity relationships managed via `@OneToOne`, `@ManyToOne` annotations
- `@GeneratedValue(strategy = GenerationType.UUID)` for primary keys
- Database schema auto-created via `spring.jpa.hibernate.ddl-auto=update` in development, migration scripts (Flyway/Liquibase) in production

---

## 9. Design Patterns Applied

| Pattern | Where Applied | Purpose |
|---|---|---|
| **Repository Pattern** | `FineRepository`, `PaymentRepository` | Decouple data access from business logic |
| **DTO Pattern** | `FineRequest`, `PaymentResponse`, etc. | Prevent leaking domain entities to API consumers |
| **Service Layer Pattern** | `FineService`, `PaymentService` | Centralize business logic, keep controllers thin |
| **Observer / Event Pattern** | SMS notification on payment | Decouple payment logic from notification logic (`ApplicationEventPublisher`) |
| **Strategy Pattern** | Payment method handling | Swap payment providers without changing core logic |
| **MVC** | Spring Boot Controllers + Next.js pages | Separate concerns in both backend and frontend |
| **MVVM** | Android mobile app | Separate UI state from business logic on mobile |
| **Singleton** | Spring Beans (`@Service`, `@Repository`) | Single instances managed by Spring IoC container |

---

## 10. Cross-Cutting Concerns

### Security
- All endpoints secured via Spring Security filter chain
- Passwords hashed with **BCrypt**
- JWT signed with **HS256** and a secret key stored in environment variables
- CORS configured to allow only known frontend origins
- HTTPS enforced in production

### Error Handling
- `@RestControllerAdvice` — global exception handler returns consistent JSON error responses
- Custom exceptions: `FineNotFoundException`, `FineAlreadyPaidException`, `InvalidPaymentException`

### Logging
- **SLF4J + Logback** for structured logging in the backend
- Log levels: `ERROR` for payment failures, `INFO` for successful transactions, `DEBUG` for development

### Validation
- Request DTOs validated with **Jakarta Bean Validation** (`@NotNull`, `@Pattern`, `@Positive`)
- Validation errors return `400 Bad Request` with field-level messages

### Environment Configuration
- Secrets (DB credentials, JWT secret, SMS API key) stored in `.env` / environment variables — never committed to git
- Spring `@Value` / `@ConfigurationProperties` for config injection

---

## 11. Technology Decisions

| Decision | Choice | Reason |
|---|---|---|
| Backend framework | Spring Boot | Rapid development, strong ecosystem, built-in security, JPA support |
| ORM | Spring Data JPA / Hibernate | Reduces boilerplate SQL, portable across DB vendors |
| Authentication | JWT + Spring Security | Stateless — scales well across multiple clients (web + mobile) |
| Web frontend | Next.js (React) | SPA capability with SSR option, TypeScript support, fast development |
| Mobile | Android (Java/Kotlin) | Required by project spec |
| SMS | Twilio / Dialog Axiata | REST API integration, reliable delivery, Sri Lanka coverage |
| Database | MySQL / PostgreSQL | Mature, JPA-compatible relational database |
| API style | REST (JSON) | Simple, stateless, widely understood, easy to consume from any client |
