# Backend API - Setup & Run Instructions

## Prerequisites
- Node.js (v14+)
- MySQL Server running locally or remote

## Installation

1. **Install dependencies:**
```bash
cd Backend
npm install
```

2. **Configure environment variables** (`.env`):
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=traffic_fines
DB_USER=root
DB_PASSWORD=your_mysql_password
PORT=5000
JWT_SECRET=your_jwt_secret_change_in_production
SMS_GATEWAY_URL=https://api.sms-gateway.com/send
SMS_API_KEY=your_sms_api_key
ADMIN_PORTAL_URL=http://localhost:3000
DRIVER_PORTAL_URL=http://localhost:3001
NODE_ENV=development
```

Update `DB_USER` and `DB_PASSWORD` with your MySQL credentials.

## Database Setup

3. **Seed the database** (creates tables + test data):
```bash
npm run seed
```

Expected output:
```
✓ Connected to MySQL via Sequelize.
✓ Database tables synced.
✓ Seeded 8 fine categories.
✓ Seeded 8 officers.
✓ Seeded 10 fines.
✓ Seeded 4 payments.
✓ Seeded admin user (email: admin@traffic-fines.com, password: admin123)
✓ Seed completed successfully!
```

## Running the Server

4. **Development mode** (with auto-reload):
```bash
npm run dev
```

5. **Production mode**:
```bash
npm start
```

Expected output:
```
✓ Database connection established.
✓ Database models synced.
✓ Traffic Fine API running on http://localhost:5000

Endpoints:
  GET    /api/fines/:referenceNumber
  POST   /api/fines/
  GET    /api/fines/
  POST   /api/payments/
  GET    /api/payments/:id
  GET    /api/reports/summary
  GET    /api/reports/districts
  GET    /api/reports/categories
```

## API Endpoints

### Fine Management
- **GET** `/api/fines/:referenceNumber` — Get fine by reference number
- **POST** `/api/fines/` — Create a new fine (ADMIN only)
- **GET** `/api/fines/` — List all fines (ADMIN only, with optional `?status=issued|paid`)

### Payment Processing
- **POST** `/api/payments/` — Process payment (validates fine, creates payment record)
  ```json
  {
    "referenceNumber": "TF-2026-100001",
    "categoryId": "...",
    "paymentMethod": "CARD|ONLINE_BANKING"
  }
  ```
- **GET** `/api/payments/:id` — Get payment receipt

### Analytics & Reports
- **GET** `/api/reports/summary` — District & category totals (optional: `?startDate=2026-01-01&endDate=2026-12-31`)
- **GET** `/api/reports/districts` — Breakdown by district
- **GET** `/api/reports/categories` — Breakdown by violation category

## Database Schema

### Tables
- `fine_categories` — Violation types (Speeding, No Helmet, etc.)
- `officers` — Traffic enforcement officers
- `fines` — Traffic violation records
- `payments` — Payment records linked to fines
- `users` — Admin users for authentication

## Troubleshooting

### Connection Error: `auth_gssapi_client`
Ensure MySQL is running and `.env` has correct credentials:
```bash
# Test connection:
mysql -h 127.0.0.1 -u root -p
```

### Models/Associations Error
Run sync without alter:
```bash
npm run seed  # This syncs automatically
```

### Port Already in Use
Change `PORT` in `.env` or kill existing process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

## Admin Credentials (After Seed)
- **Email:** `admin@traffic-fines.com`
- **Password:** `admin123` (change in production!)
