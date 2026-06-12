require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  console.log('Connected to MySQL.');

  // ── Create & select database ──────────────────────────────────────────────
  await db.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
  await db.query(`USE \`${process.env.DB_NAME}\`;`);
  console.log(`Using database: ${process.env.DB_NAME}`);

  // ── Schema ────────────────────────────────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS fine_categories (
      id               CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
      name             VARCHAR(100) NOT NULL UNIQUE,
      description      TEXT,
      default_amount   DECIMAL(10,2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS officers (
      id               CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
      badge_number     VARCHAR(20)  NOT NULL UNIQUE,
      full_name        VARCHAR(150) NOT NULL,
      phone            VARCHAR(15)  NOT NULL,
      district         VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fines (
      id               CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
      reference_number VARCHAR(20)  NOT NULL UNIQUE,
      category_id      CHAR(36)     NOT NULL,
      officer_id       CHAR(36)     NOT NULL,
      driver_nic       VARCHAR(12)  NOT NULL,
      driver_name      VARCHAR(150),
      vehicle_number   VARCHAR(20),
      location         VARCHAR(255),
      amount           DECIMAL(10,2) NOT NULL,
      status           ENUM('PENDING','PAID') NOT NULL DEFAULT 'PENDING',
      issued_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id                    CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
      fine_id               CHAR(36)     NOT NULL UNIQUE,
      amount                DECIMAL(10,2) NOT NULL,
      payment_method        ENUM('CARD','ONLINE_BANKING') NOT NULL,
      transaction_reference VARCHAR(100),
      paid_at               TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS app_users (
      id               CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
      username         VARCHAR(50)  NOT NULL UNIQUE,
      password_hash    VARCHAR(255) NOT NULL,
      role             ENUM('ADMIN') NOT NULL DEFAULT 'ADMIN',
      created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Schema ready.');

  // ── Fine Categories ───────────────────────────────────────────────────────
  const categories = [
    { id: uuidv4(), name: 'Speeding',              description: 'Exceeding the speed limit',              default_amount: 2500.00 },
    { id: uuidv4(), name: 'No Helmet',             description: 'Riding without a helmet',                default_amount: 1000.00 },
    { id: uuidv4(), name: 'Drunk Driving',         description: 'Driving under the influence of alcohol', default_amount: 7500.00 },
    { id: uuidv4(), name: 'Running Red Light',     description: 'Failing to stop at a red light',         default_amount: 3000.00 },
    { id: uuidv4(), name: 'No Seat Belt',          description: 'Not wearing a seat belt',                default_amount: 1500.00 },
    { id: uuidv4(), name: 'Using Mobile Phone',    description: 'Using a mobile phone while driving',     default_amount: 2000.00 },
    { id: uuidv4(), name: 'Wrong Parking',         description: 'Parking in a prohibited area',           default_amount: 1000.00 },
    { id: uuidv4(), name: 'No Valid License',      description: 'Driving without a valid license',        default_amount: 5000.00 },
  ];

  for (const c of categories) {
    await db.query(
      `INSERT IGNORE INTO fine_categories (id, name, description, default_amount) VALUES (?, ?, ?, ?)`,
      [c.id, c.name, c.description, c.default_amount]
    );
  }
  console.log(`Seeded ${categories.length} fine categories.`);

  // ── Officers ──────────────────────────────────────────────────────────────
  const officers = [
    { id: uuidv4(), badge_number: 'PC-1001', full_name: 'Sunil Perera',     phone: '0771234567', district: 'Colombo'   },
    { id: uuidv4(), badge_number: 'PC-1002', full_name: 'Nimal Silva',      phone: '0772345678', district: 'Gampaha'   },
    { id: uuidv4(), badge_number: 'PC-1003', full_name: 'Kamal Fernando',   phone: '0773456789', district: 'Kandy'     },
    { id: uuidv4(), badge_number: 'PC-1004', full_name: 'Ruwan Rajapaksa',  phone: '0774567890', district: 'Galle'     },
    { id: uuidv4(), badge_number: 'PC-1005', full_name: 'Asanka Bandara',   phone: '0775678901', district: 'Matara'    },
    { id: uuidv4(), badge_number: 'PC-1006', full_name: 'Chaminda Herath',  phone: '0776789012', district: 'Kurunegala'},
    { id: uuidv4(), badge_number: 'PC-1007', full_name: 'Lasith Jayasuriya',phone: '0777890123', district: 'Ratnapura' },
    { id: uuidv4(), badge_number: 'PC-1008', full_name: 'Dinesh Wickrama',  phone: '0778901234', district: 'Colombo'   },
  ];

  for (const o of officers) {
    await db.query(
      `INSERT IGNORE INTO officers (id, badge_number, full_name, phone, district) VALUES (?, ?, ?, ?, ?)`,
      [o.id, o.badge_number, o.full_name, o.phone, o.district]
    );
  }
  console.log(`Seeded ${officers.length} officers.`);

  // ── Fines ─────────────────────────────────────────────────────────────────
  const finesData = [
    { ref: 'TF-2026-100001', catIdx: 0, offIdx: 0, nic: '199012345678', name: 'Kamal Perera',    vehicle: 'CAB-1234', location: 'Galle Road, Colombo 3',       amount: 2500.00, status: 'PENDING' },
    { ref: 'TF-2026-100002', catIdx: 1, offIdx: 1, nic: '199512367890', name: 'Saman Kumara',    vehicle: 'WP-AB-1111', location: 'Kandy Road, Gampaha',        amount: 1000.00, status: 'PAID'    },
    { ref: 'TF-2026-100003', catIdx: 2, offIdx: 2, nic: '198709876543', name: 'Mahesh De Silva',  vehicle: 'KY-2222',  location: 'Peradeniya Road, Kandy',       amount: 7500.00, status: 'PENDING' },
    { ref: 'TF-2026-100004', catIdx: 3, offIdx: 3, nic: '200001234567', name: 'Tharaka Nissanka', vehicle: 'SG-3333',  location: 'Galle Fort Entrance',          amount: 3000.00, status: 'PAID'    },
    { ref: 'TF-2026-100005', catIdx: 4, offIdx: 0, nic: '199811223344', name: 'Pradeep Liyanage', vehicle: 'CAB-5678', location: 'Baseline Road, Colombo 9',     amount: 1500.00, status: 'PENDING' },
    { ref: 'TF-2026-100006', catIdx: 5, offIdx: 4, nic: '199305544332', name: 'Isuru Madusanka',  vehicle: 'MT-4444',  location: 'Matara Town Center',           amount: 2000.00, status: 'PAID'    },
    { ref: 'TF-2026-100007', catIdx: 6, offIdx: 5, nic: '199710293847', name: 'Dinesh Pathirana', vehicle: 'KU-5555',  location: 'Kurunegala Main Street',       amount: 1000.00, status: 'PENDING' },
    { ref: 'TF-2026-100008', catIdx: 7, offIdx: 6, nic: '198899887766', name: 'Roshan Wickrama',  vehicle: 'RP-6666',  location: 'Ratnapura Junction',           amount: 5000.00, status: 'PAID'    },
    { ref: 'TF-2026-100009', catIdx: 0, offIdx: 7, nic: '200112233445', name: 'Namal Rajapaksa',  vehicle: 'CAB-9999', location: 'High Level Road, Colombo 6',   amount: 2500.00, status: 'PENDING' },
    { ref: 'TF-2026-100010', catIdx: 3, offIdx: 2, nic: '199654321098', name: 'Aruna Bandara',    vehicle: 'KY-7777',  location: 'Katugastota, Kandy',           amount: 3000.00, status: 'PENDING' },
  ];

  const fineIds = [];
  for (const f of finesData) {
    const id = uuidv4();
    fineIds.push({ id, ref: f.ref, amount: f.amount, status: f.status });
    await db.query(
      `INSERT IGNORE INTO fines (id, reference_number, category_id, officer_id, driver_nic, driver_name, vehicle_number, location, amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, f.ref, categories[f.catIdx].id, officers[f.offIdx].id, f.nic, f.name, f.vehicle, f.location, f.amount, f.status]
    );
  }
  console.log(`Seeded ${finesData.length} fines.`);

  // ── Payments (for PAID fines) ─────────────────────────────────────────────
  const paidFines = fineIds.filter((f) => f.status === 'PAID');
  const methods   = ['CARD', 'ONLINE_BANKING'];

  for (let i = 0; i < paidFines.length; i++) {
    const f = paidFines[i];
    await db.query(
      `INSERT IGNORE INTO payments (id, fine_id, amount, payment_method, transaction_reference)
       VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), f.id, f.amount, methods[i % 2], `TXN-2026-${100001 + i}`]
    );
  }
  console.log(`Seeded ${paidFines.length} payments.`);

  // ── Admin User ────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 12);
  await db.query(
    `INSERT IGNORE INTO app_users (id, username, password_hash) VALUES (?, ?, ?)`,
    [uuidv4(), 'admin', passwordHash]
  );
  console.log('Seeded admin user  →  username: admin  |  password: admin123');

  await db.end();
  console.log('\nSeeding complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
