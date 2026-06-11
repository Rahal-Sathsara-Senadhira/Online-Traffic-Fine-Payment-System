# Backend Architecture — Online Traffic Fine Payment System

> Spring Boot REST API · Java 17 · Spring Security · JPA / Hibernate

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Project Structure](#2-project-structure)
3. [Layer Breakdown](#3-layer-breakdown)
4. [Domain Model & Entity Design](#4-domain-model--entity-design)
5. [REST API Design](#5-rest-api-design)
6. [Service Layer Design](#6-service-layer-design)
7. [Repository Layer Design](#7-repository-layer-design)
8. [Security Architecture](#8-security-architecture)
9. [SMS Notification Architecture](#9-sms-notification-architecture)
10. [Exception Handling Architecture](#10-exception-handling-architecture)
11. [Database Schema](#11-database-schema)
12. [Configuration & Environment](#12-configuration--environment)
13. [Class Diagram](#13-class-diagram)

---

## 1. Architectural Overview

The backend is a **Spring Boot monolith** structured as a strict **N-Tier Layered Architecture**. Each layer has a single, well-defined responsibility and communicates only with the layer directly beneath it. No layer skips another.

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                    (REST Controllers)                        │
│   Handles HTTP, validates input, maps DTOs, returns JSON     │
│                                                              │
│  AuthController  FineController  PaymentController           │
│  OfficerController  CategoryController  ReportController     │
└───────────────────────────┬──────────────────────────────────┘
                            │  uses DTOs (never entities)
┌───────────────────────────┴──────────────────────────────────┐
│                     SERVICE LAYER                            │
│                   (Business Logic)                           │
│   Enforces rules, coordinates repos, fires events           │
│                                                              │
│  AuthService  FineService  PaymentService                    │
│  OfficerService  CategoryService  ReportService              │
│  NotificationService                                         │
└───────────────────────────┬──────────────────────────────────┘
                            │  uses JPA Entities
┌───────────────────────────┴──────────────────────────────────┐
│                   REPOSITORY LAYER                           │
│                 (Data Access via JPA)                        │
│   Spring Data JPA repositories — pure data access only      │
│                                                              │
│  FineRepository  PaymentRepository  OfficerRepository        │
│  FineCategoryRepository  AppUserRepository                   │
└───────────────────────────┬──────────────────────────────────┘
                            │  SQL via Hibernate
┌───────────────────────────┴──────────────────────────────────┐
│                      DATABASE                                │
│                  MySQL / PostgreSQL                          │
└──────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

| Principle | How It Is Applied |
|---|---|
| Separation of Concerns | Each layer has exactly one responsibility |
| Single Responsibility | Each class handles one domain concept |
| Dependency Inversion | Controllers depend on service interfaces, not implementations |
| Open/Closed | New fine categories or payment methods extend, not modify, existing code |
| DRY | Shared logic lives in services, not duplicated across controllers |

---

## 2. Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/trafficfine/
│   │   │   │
│   │   │   ├── TrafficFineApplication.java        # Spring Boot entry point
│   │   │   │
│   │   │   ├── controller/                        # PRESENTATION LAYER
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── FineController.java
│   │   │   │   ├── PaymentController.java
│   │   │   │   ├── OfficerController.java
│   │   │   │   ├── FineCategoryController.java
│   │   │   │   └── ReportController.java
│   │   │   │
│   │   │   ├── service/                           # SERVICE LAYER
│   │   │   │   ├── AuthService.java               # interface
│   │   │   │   ├── FineService.java               # interface
│   │   │   │   ├── PaymentService.java            # interface
│   │   │   │   ├── OfficerService.java            # interface
│   │   │   │   ├── FineCategoryService.java       # interface
│   │   │   │   ├── ReportService.java             # interface
│   │   │   │   ├── NotificationService.java       # interface
│   │   │   │   └── impl/
│   │   │   │       ├── AuthServiceImpl.java
│   │   │   │       ├── FineServiceImpl.java
│   │   │   │       ├── PaymentServiceImpl.java
│   │   │   │       ├── OfficerServiceImpl.java
│   │   │   │       ├── FineCategoryServiceImpl.java
│   │   │   │       ├── ReportServiceImpl.java
│   │   │   │       └── SmsNotificationServiceImpl.java
│   │   │   │
│   │   │   ├── repository/                        # REPOSITORY LAYER
│   │   │   │   ├── FineRepository.java
│   │   │   │   ├── PaymentRepository.java
│   │   │   │   ├── OfficerRepository.java
│   │   │   │   ├── FineCategoryRepository.java
│   │   │   │   └── AppUserRepository.java
│   │   │   │
│   │   │   ├── entity/                            # JPA ENTITIES (Domain Model)
│   │   │   │   ├── Fine.java
│   │   │   │   ├── Payment.java
│   │   │   │   ├── Officer.java
│   │   │   │   ├── FineCategory.java
│   │   │   │   └── AppUser.java
│   │   │   │
│   │   │   ├── dto/                               # DATA TRANSFER OBJECTS
│   │   │   │   ├── request/
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── CreateFineRequest.java
│   │   │   │   │   ├── PaymentRequest.java
│   │   │   │   │   ├── CreateOfficerRequest.java
│   │   │   │   │   └── CreateCategoryRequest.java
│   │   │   │   └── response/
│   │   │   │       ├── AuthResponse.java
│   │   │   │       ├── FineResponse.java
│   │   │   │       ├── PaymentResponse.java
│   │   │   │       ├── OfficerResponse.java
│   │   │   │       ├── FineCategoryResponse.java
│   │   │   │       ├── ReportSummaryResponse.java
│   │   │   │       ├── DistrictReportResponse.java
│   │   │   │       └── ApiErrorResponse.java
│   │   │   │
│   │   │   ├── security/                          # SECURITY
│   │   │   │   ├── SecurityConfig.java            # Spring Security filter chain
│   │   │   │   ├── JwtUtil.java                   # JWT generation & validation
│   │   │   │   ├── JwtAuthenticationFilter.java   # Per-request JWT filter
│   │   │   │   └── UserDetailsServiceImpl.java    # Load user from DB
│   │   │   │
│   │   │   ├── event/                             # APPLICATION EVENTS
│   │   │   │   └── PaymentSuccessEvent.java
│   │   │   │
│   │   │   ├── exception/                         # EXCEPTION HIERARCHY
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── FineNotFoundException.java
│   │   │   │   ├── FineAlreadyPaidException.java
│   │   │   │   ├── InvalidPaymentException.java
│   │   │   │   └── UnauthorizedException.java
│   │   │   │
│   │   │   └── config/
│   │   │       └── AppConfig.java                 # ModelMapper, RestTemplate beans
│   │   │
│   │   └── resources/
│   │       ├── application.properties             # Base config (non-secret)
│   │       ├── application-dev.properties         # Dev overrides
│   │       └── application-prod.properties        # Prod overrides
│   │
│   └── test/
│       └── java/com/trafficfine/
│           ├── service/                           # Unit tests for services
│           └── controller/                        # Integration tests for controllers
│
├── pom.xml
└── .env                                           # Secrets (never committed)
```

---

## 3. Layer Breakdown

### 3.1 Presentation Layer — Controllers

Controllers are **thin**. They only:
- Map HTTP request bodies to DTOs
- Call one service method
- Return an HTTP response

```java
// Example: FineController.java
@RestController
@RequestMapping("/api/fines")
public class FineController {

    private final FineService fineService;

    // GET /api/fines/{referenceNumber} — public, no auth required
    @GetMapping("/{referenceNumber}")
    public ResponseEntity<FineResponse> getFineByReference(@PathVariable String referenceNumber) {
        return ResponseEntity.ok(fineService.getByReferenceNumber(referenceNumber));
    }

    // POST /api/fines — ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FineResponse> createFine(@Valid @RequestBody CreateFineRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(fineService.createFine(request));
    }
}
```

### 3.2 Service Layer

Services contain **all business rules**. They are defined as interfaces to support the Dependency Inversion Principle and make unit testing easy.

```java
// Example: FineService.java (interface)
public interface FineService {
    FineResponse getByReferenceNumber(String referenceNumber);
    FineResponse createFine(CreateFineRequest request);
    List<FineResponse> getAllFines();
}

// Example: FineServiceImpl.java
@Service
@Transactional
public class FineServiceImpl implements FineService {

    private final FineRepository fineRepository;
    private final FineCategoryRepository categoryRepository;

    @Override
    public FineResponse getByReferenceNumber(String referenceNumber) {
        Fine fine = fineRepository.findByReferenceNumber(referenceNumber)
            .orElseThrow(() -> new FineNotFoundException(referenceNumber));
        return mapToResponse(fine);
    }
}
```

### 3.3 Repository Layer

Repositories extend `JpaRepository` and add custom query methods using Spring Data naming conventions or `@Query`.

```java
// Example: FineRepository.java
public interface FineRepository extends JpaRepository<Fine, UUID> {
    Optional<Fine> findByReferenceNumber(String referenceNumber);
    List<Fine> findByOfficer_District(String district);
    List<Fine> findByStatus(FineStatus status);

    @Query("SELECT SUM(p.amount) FROM Payment p JOIN p.fine f WHERE f.officer.district = :district")
    BigDecimal sumPaymentsByDistrict(@Param("district") String district);
}
```

---

## 4. Domain Model & Entity Design

### Entity Relationship Diagram

```
┌─────────────────┐          ┌──────────────────┐
│   FineCategory  │          │     Officer       │
├─────────────────┤          ├──────────────────┤
│ id (UUID) PK    │          │ id (UUID) PK      │
│ name            │          │ badgeNumber       │
│ description     │          │ fullName          │
│ defaultAmount   │          │ phone             │
└────────┬────────┘          │ district          │
         │  1                └────────┬──────────┘
         │                            │  1
         │  *                         │  *
┌────────┴────────────────────────────┴──────────┐
│                    Fine                         │
├─────────────────────────────────────────────────┤
│ id (UUID) PK                                    │
│ referenceNumber (UNIQUE, INDEXED)               │
│ categoryId FK → FineCategory                    │
│ officerId   FK → Officer                        │
│ driverNic                                       │
│ driverName                                      │
│ vehicleNumber                                   │
│ location                                        │
│ issuedAt (timestamp)                            │
│ amount (BigDecimal)                             │
│ status  ENUM(PENDING, PAID)                     │
└─────────────────────┬───────────────────────────┘
                      │ 1
                      │
                      │ 0..1
┌─────────────────────┴───────────────────────────┐
│                   Payment                        │
├─────────────────────────────────────────────────┤
│ id (UUID) PK                                    │
│ fineId FK → Fine (UNIQUE — one payment per fine)│
│ amount (BigDecimal)                             │
│ paymentMethod  ENUM(CARD, ONLINE_BANKING)       │
│ transactionReference                            │
│ paidAt (timestamp)                              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                   AppUser                        │
├─────────────────────────────────────────────────┤
│ id (UUID) PK                                    │
│ username (UNIQUE)                               │
│ passwordHash (BCrypt)                           │
│ role  ENUM(ADMIN)                               │
└─────────────────────────────────────────────────┘
```

### Fine Entity

```java
@Entity
@Table(name = "fines")
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 20)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private FineCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id", nullable = false)
    private Officer officer;

    @Column(nullable = false, length = 12)
    private String driverNic;

    private String driverName;
    private String vehicleNumber;
    private String location;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FineStatus status = FineStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private LocalDateTime issuedAt;

    @OneToOne(mappedBy = "fine", cascade = CascadeType.ALL)
    private Payment payment;
}
```

---

## 5. REST API Design

Base URL: `/api`

All responses follow a consistent JSON envelope. Errors return `ApiErrorResponse`.

### 5.1 Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Admin login, returns JWT |

**POST /auth/login**
```json
// Request
{ "username": "admin01", "password": "secret" }

// Response 200
{ "token": "eyJhbGci...", "expiresIn": 86400 }

// Response 401
{ "error": "INVALID_CREDENTIALS", "message": "Username or password is incorrect" }
```

---

### 5.2 Fine Management

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/fines/{referenceNumber}` | Public | Look up a fine by reference number |
| `POST` | `/fines` | ADMIN | Issue a new traffic fine |
| `GET` | `/fines` | ADMIN | List all fines (paginated) |
| `GET` | `/fines?status=PENDING` | ADMIN | Filter fines by status |

**GET /fines/{referenceNumber}**
```json
// Response 200
{
  "id": "uuid",
  "referenceNumber": "TF-2024-001234",
  "category": { "id": "uuid", "name": "Speeding", "defaultAmount": 2500.00 },
  "officer": { "badgeNumber": "PC-1234", "district": "Colombo" },
  "driverNic": "199012345678",
  "vehicleNumber": "CAB-1234",
  "amount": 2500.00,
  "status": "PENDING",
  "issuedAt": "2024-06-10T14:30:00"
}

// Response 404
{ "error": "FINE_NOT_FOUND", "message": "Fine TF-2024-001234 not found" }
```

**POST /fines** *(ADMIN)*
```json
// Request
{
  "categoryId": "uuid",
  "officerId": "uuid",
  "driverNic": "199012345678",
  "driverName": "Kamal Perera",
  "vehicleNumber": "CAB-1234",
  "location": "Galle Road, Colombo 3"
}

// Response 201
{ "id": "uuid", "referenceNumber": "TF-2024-001235", "status": "PENDING", ... }
```

---

### 5.3 Payments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/payments` | Public | Process payment for a fine |
| `GET` | `/payments/{id}` | Public | Get payment receipt by ID |

**POST /payments**
```json
// Request
{
  "referenceNumber": "TF-2024-001234",
  "categoryId": "uuid",
  "paymentMethod": "CARD",
  "cardNumber": "4111111111111111",
  "cardHolder": "Kamal Perera",
  "expiryMonth": 12,
  "expiryYear": 2027,
  "cvv": "123"
}

// Response 200
{
  "paymentId": "uuid",
  "referenceNumber": "TF-2024-001234",
  "amount": 2500.00,
  "transactionReference": "TXN-20240610-9987",
  "paidAt": "2024-06-10T14:45:00",
  "message": "Payment successful. SMS notification sent to officer."
}

// Response 409
{ "error": "FINE_ALREADY_PAID", "message": "This fine has already been paid." }

// Response 422
{ "error": "INVALID_PAYMENT", "message": "Card details are invalid." }
```

---

### 5.4 Fine Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/categories` | Public | List all fine categories |
| `POST` | `/categories` | ADMIN | Create a new category |

**GET /categories**
```json
// Response 200
[
  { "id": "uuid", "name": "Speeding", "description": "...", "defaultAmount": 2500.00 },
  { "id": "uuid", "name": "No Helmet", "description": "...", "defaultAmount": 1500.00 }
]
```

---

### 5.5 Officers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/officers` | ADMIN | List all officers |
| `POST` | `/officers` | ADMIN | Register a new officer |
| `GET` | `/officers/{id}` | ADMIN | Get officer details |

---

### 5.6 Reports (Admin)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/reports/summary` | ADMIN | Total collections, total fines, paid vs pending |
| `GET` | `/reports/districts` | ADMIN | Collection totals grouped by district |
| `GET` | `/reports/categories` | ADMIN | Collection totals grouped by fine category |
| `GET` | `/reports/summary?from=2024-01-01&to=2024-06-30` | ADMIN | Date-range filtered summary |

**GET /reports/districts**
```json
// Response 200
[
  { "district": "Colombo",    "totalFines": 412, "paidFines": 380, "totalAmount": 950000.00 },
  { "district": "Gampaha",   "totalFines": 298, "paidFines": 250, "totalAmount": 620000.00 },
  { "district": "Kandy",     "totalFines": 175, "paidFines": 160, "totalAmount": 410000.00 }
]
```

---

## 6. Service Layer Design

### PaymentService — Core Business Logic

The payment flow is the most critical path. `PaymentServiceImpl` orchestrates:
1. Validate reference number exists
2. Validate category matches the fine's category
3. Confirm fine is still `PENDING`
4. Process payment (delegate to payment gateway adapter)
5. Persist `Payment` entity
6. Update `Fine.status` to `PAID`
7. Publish `PaymentSuccessEvent` (triggers SMS asynchronously)

```
PaymentService.processPayment(PaymentRequest)
       │
       ├─ 1. fineRepo.findByReferenceNumber()  → throws FineNotFoundException
       ├─ 2. fine.getCategoryId() == request.getCategoryId() → throws InvalidPaymentException
       ├─ 3. fine.getStatus() == PENDING        → throws FineAlreadyPaidException
       ├─ 4. paymentGateway.charge(cardDetails) → throws InvalidPaymentException
       ├─ 5. paymentRepo.save(payment)
       ├─ 6. fine.setStatus(PAID); fineRepo.save(fine)
       └─ 7. eventPublisher.publishEvent(new PaymentSuccessEvent(fine, payment))
```

### ReportService — Aggregation Logic

```java
public interface ReportService {
    ReportSummaryResponse getSummary(LocalDate from, LocalDate to);
    List<DistrictReportResponse> getDistrictBreakdown();
    List<CategoryReportResponse> getCategoryBreakdown();
}
```

`ReportServiceImpl` delegates aggregation queries to `FineRepository` and `PaymentRepository` using JPQL aggregate queries — no in-memory computation.

---

## 7. Repository Layer Design

### Custom Queries

```java
// FineRepository.java
public interface FineRepository extends JpaRepository<Fine, UUID> {

    Optional<Fine> findByReferenceNumber(String referenceNumber);

    @Query("""
        SELECT f.officer.district AS district,
               COUNT(f) AS totalFines,
               SUM(CASE WHEN f.status = 'PAID' THEN 1 ELSE 0 END) AS paidFines,
               COALESCE(SUM(p.amount), 0) AS totalAmount
        FROM Fine f
        LEFT JOIN f.payment p
        GROUP BY f.officer.district
        """)
    List<DistrictReportProjection> getDistrictReport();

    @Query("""
        SELECT fc.name AS categoryName,
               COUNT(f) AS totalFines,
               COALESCE(SUM(p.amount), 0) AS totalAmount
        FROM Fine f
        JOIN f.category fc
        LEFT JOIN f.payment p
        GROUP BY fc.name
        """)
    List<CategoryReportProjection> getCategoryReport();
}

// PaymentRepository.java
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByFine_ReferenceNumber(String referenceNumber);
    List<Payment> findByPaidAtBetween(LocalDateTime from, LocalDateTime to);
}
```

### Projection Interfaces (for aggregate queries)

```java
public interface DistrictReportProjection {
    String getDistrict();
    Long getTotalFines();
    Long getPaidFines();
    BigDecimal getTotalAmount();
}
```

---

## 8. Security Architecture

### Spring Security Filter Chain

Every HTTP request passes through the filter chain in order:

```
HTTP Request
     │
     ▼
┌─────────────────────────────┐
│   CorsFilter                │  Allow configured origins
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│  JwtAuthenticationFilter    │  Extract + validate JWT
│  (OncePerRequestFilter)     │  Set SecurityContextHolder
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│  SecurityConfig rules       │
│  .permitAll()               │  Public endpoints: /auth/**, /fines/{ref} (GET), /payments (POST), /categories (GET)
│  .hasRole("ADMIN")          │  Protected: /reports/**, /fines (POST), /officers/**, /categories (POST)
└──────────────┬──────────────┘
               ▼
          Controller
```

### JWT Implementation

```
Token Generation (on login):
┌──────────────────────────────────────────────────────────┐
│  Header:  { "alg": "HS256", "typ": "JWT" }               │
│  Payload: {                                              │
│    "sub":  "user-uuid",                                  │
│    "role": "ADMIN",                                      │
│    "iat":  1717000000,                                   │
│    "exp":  1717086400   (24 hours)                       │
│  }                                                       │
│  Signature: HMACSHA256(base64(header).base64(payload),   │
│             JWT_SECRET_KEY)                              │
└──────────────────────────────────────────────────────────┘

Token Validation (JwtAuthenticationFilter):
  1. Extract "Authorization: Bearer <token>" header
  2. Parse token with JJWT library
  3. Verify signature using JWT_SECRET_KEY
  4. Check exp claim — reject if expired
  5. Load UserDetails from DB by subject (user id)
  6. Set UsernamePasswordAuthenticationToken into SecurityContext
```

### JwtUtil Key Methods

```java
public class JwtUtil {
    String generateToken(UserDetails userDetails);        // on login
    String extractUsername(String token);                 // from filter
    boolean isTokenValid(String token, UserDetails user); // in filter
    boolean isTokenExpired(String token);                 // in filter
}
```

### Endpoint Security Matrix

| Endpoint | HTTP | Role Required |
|---|---|---|
| `/api/auth/login` | POST | Public |
| `/api/fines/{ref}` | GET | Public |
| `/api/payments` | POST | Public |
| `/api/categories` | GET | Public |
| `/api/fines` | POST | ADMIN |
| `/api/fines` | GET | ADMIN |
| `/api/officers/**` | ALL | ADMIN |
| `/api/categories` | POST | ADMIN |
| `/api/reports/**` | GET | ADMIN |

---

## 9. SMS Notification Architecture

SMS notifications are sent **asynchronously** using Spring's `ApplicationEventPublisher` — the payment response is returned to the client immediately, and the SMS is sent in a separate thread.

```
PaymentService
     │
     └── eventPublisher.publishEvent(new PaymentSuccessEvent(fine, payment))
                                             │
                                    (async thread pool)
                                             │
                                             ▼
                               SmsNotificationServiceImpl
                                     @EventListener
                                     @Async
                                             │
                                             ▼
                               HTTP POST → SMS Gateway API
                               (Twilio / Dialog Axiata)
                               To: officer.getPhone()
                               Body: "Fine TF-2024-001234 has been paid.
                                      Driver may retrieve their license."
```

### PaymentSuccessEvent

```java
public class PaymentSuccessEvent {
    private final Fine fine;
    private final Payment payment;
    // constructor, getters
}
```

### SmsNotificationServiceImpl

```java
@Service
public class SmsNotificationServiceImpl implements NotificationService {

    @Async
    @EventListener
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        Fine fine = event.getFine();
        String to = fine.getOfficer().getPhone();
        String body = String.format(
            "Payment received for fine %s. Driver %s may retrieve their license.",
            fine.getReferenceNumber(), fine.getDriverName()
        );
        smsGateway.send(to, body);
    }
}
```

---

## 10. Exception Handling Architecture

A single `@RestControllerAdvice` class catches all exceptions and maps them to consistent JSON error responses.

### Exception Hierarchy

```
RuntimeException
  └── TrafficFineException  (base — all custom exceptions extend this)
        ├── FineNotFoundException       → HTTP 404
        ├── FineAlreadyPaidException    → HTTP 409
        ├── InvalidPaymentException     → HTTP 422
        └── UnauthorizedException       → HTTP 401
```

### GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FineNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(FineNotFoundException ex) {
        return ResponseEntity.status(404).body(new ApiErrorResponse("FINE_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(FineAlreadyPaidException.class)
    public ResponseEntity<ApiErrorResponse> handleAlreadyPaid(FineAlreadyPaidException ex) {
        return ResponseEntity.status(409).body(new ApiErrorResponse("FINE_ALREADY_PAID", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.status(400).body(new ApiErrorResponse("VALIDATION_ERROR", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(500).body(new ApiErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
```

### ApiErrorResponse

```json
{
  "error": "FINE_NOT_FOUND",
  "message": "Fine TF-2024-001234 not found",
  "timestamp": "2024-06-10T14:30:00"
}
```

---

## 11. Database Schema

```sql
CREATE TABLE fine_categories (
    id              CHAR(36)        PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    description     TEXT,
    default_amount  DECIMAL(10,2)   NOT NULL
);

CREATE TABLE officers (
    id              CHAR(36)        PRIMARY KEY,
    badge_number    VARCHAR(20)     NOT NULL UNIQUE,
    full_name       VARCHAR(150)    NOT NULL,
    phone           VARCHAR(15)     NOT NULL,
    district        VARCHAR(100)    NOT NULL
);

CREATE TABLE fines (
    id               CHAR(36)       PRIMARY KEY,
    reference_number VARCHAR(20)    NOT NULL UNIQUE,
    category_id      CHAR(36)       NOT NULL REFERENCES fine_categories(id),
    officer_id       CHAR(36)       NOT NULL REFERENCES officers(id),
    driver_nic       VARCHAR(12)    NOT NULL,
    driver_name      VARCHAR(150),
    vehicle_number   VARCHAR(20),
    location         VARCHAR(255),
    amount           DECIMAL(10,2)  NOT NULL,
    status           VARCHAR(10)    NOT NULL DEFAULT 'PENDING',
    issued_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reference_number (reference_number),
    INDEX idx_status (status),
    INDEX idx_officer (officer_id)
);

CREATE TABLE payments (
    id                    CHAR(36)     PRIMARY KEY,
    fine_id               CHAR(36)     NOT NULL UNIQUE REFERENCES fines(id),
    amount                DECIMAL(10,2) NOT NULL,
    payment_method        VARCHAR(20)  NOT NULL,
    transaction_reference VARCHAR(100),
    paid_at               TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_users (
    id              CHAR(36)        PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'ADMIN'
);
```

---

## 12. Configuration & Environment

### application.properties (committed — no secrets)

```properties
spring.application.name=traffic-fine-api
server.port=8080

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

jwt.expiration-ms=86400000

spring.async.core-pool-size=2
spring.async.max-pool-size=5
```

### .env (NOT committed — loaded at runtime)

```
DB_URL=jdbc:mysql://localhost:3306/trafficfine
DB_USERNAME=root
DB_PASSWORD=yourpassword

JWT_SECRET=a-long-random-secret-key-at-least-256-bits

SMS_API_KEY=your_twilio_or_dialog_api_key
SMS_API_URL=https://api.twilio.com/...
SMS_FROM_NUMBER=+94XXXXXXXXX
```

### application.properties references .env values

```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
sms.api-key=${SMS_API_KEY}
```

---

## 13. Class Diagram

```
┌──────────────────┐     uses     ┌──────────────────┐     uses    ┌───────────────────┐
│  FineController  │─────────────►│   FineService    │────────────►│  FineRepository   │
└──────────────────┘              │   <<interface>>  │             │  <<interface>>    │
                                  └────────┬─────────┘             └───────────────────┘
                                           │ implements
                                  ┌────────┴─────────┐
                                  │ FineServiceImpl   │
                                  └──────────────────┘

┌────────────────────┐   uses   ┌──────────────────────┐   uses  ┌──────────────────────┐
│ PaymentController  │─────────►│   PaymentService     │────────►│ PaymentRepository    │
└────────────────────┘          │   <<interface>>      │         └──────────────────────┘
                                └──────────┬───────────┘
                                           │ implements        publishes
                                ┌──────────┴───────────┐ ─────────────────────────────►
                                │  PaymentServiceImpl   │                     PaymentSuccessEvent
                                └──────────────────────┘                              │
                                                                                      ▼
                                                                     ┌────────────────────────────┐
                                                                     │ SmsNotificationServiceImpl │
                                                                     │    @EventListener @Async   │
                                                                     └────────────────────────────┘

┌──────────────────┐   uses  ┌──────────────────┐  uses  ┌───────────────────────┐
│ ReportController │────────►│  ReportService   │───────►│   FineRepository      │
└──────────────────┘         │  <<interface>>   │        │   (aggregate queries) │
                             └──────────────────┘        └───────────────────────┘

┌──────────────────┐   uses  ┌──────────────────┐  loads  ┌─────────────────────────┐
│  AuthController  │────────►│   AuthService    │────────►│ UserDetailsServiceImpl  │
└──────────────────┘         └──────────────────┘         └─────────────────────────┘
                                                                        │ uses
                                                                        ▼
                                                            ┌─────────────────────────┐
                                                            │    AppUserRepository    │
                                                            └─────────────────────────┘
```

---

### Maven Dependencies (pom.xml)

| Dependency | Purpose |
|---|---|
| `spring-boot-starter-web` | REST API, Jackson JSON |
| `spring-boot-starter-security` | Security filter chain, BCrypt |
| `spring-boot-starter-data-jpa` | JPA / Hibernate ORM |
| `spring-boot-starter-validation` | `@Valid`, Bean Validation |
| `mysql-connector-j` | MySQL JDBC driver |
| `jjwt-api` + `jjwt-impl` + `jjwt-jackson` | JWT generation & validation |
| `spring-boot-starter-test` | JUnit 5, Mockito |
| `lombok` | Reduce boilerplate (`@Getter`, `@Builder`, etc.) |
