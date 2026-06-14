require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize, FineCategory, Officer, Fine, Payment, User } = require('../src/models');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✓ Connected to MySQL via Sequelize.');

    // Sync models (drop and recreate for clean seed)
    await sequelize.sync({ force: true });
    console.log('✓ Database tables synced.');

    // ── Fine Categories ───────────────────────────────────────────────────────
    const categories = await FineCategory.bulkCreate([
      { id: uuidv4(), name: 'Speeding', description: 'Exceeding the speed limit', default_amount: 2500.00 },
      { id: uuidv4(), name: 'No Helmet', description: 'Riding without a helmet', default_amount: 1000.00 },
      { id: uuidv4(), name: 'Drunk Driving', description: 'Driving under the influence of alcohol', default_amount: 7500.00 },
      { id: uuidv4(), name: 'Running Red Light', description: 'Failing to stop at a red light', default_amount: 3000.00 },
      { id: uuidv4(), name: 'No Seat Belt', description: 'Not wearing a seat belt', default_amount: 1500.00 },
      { id: uuidv4(), name: 'Using Mobile Phone', description: 'Using a mobile phone while driving', default_amount: 2000.00 },
      { id: uuidv4(), name: 'Wrong Parking', description: 'Parking in a prohibited area', default_amount: 1000.00 },
      { id: uuidv4(), name: 'No Valid License', description: 'Driving without a valid license', default_amount: 5000.00 },
    ], { ignoreDuplicates: true });
    console.log(`✓ Seeded ${categories.length} fine categories.`);

    // ── Officers ──────────────────────────────────────────────────────────────
    const officers = await Officer.bulkCreate([
      { id: uuidv4(), full_name: 'Sunil Perera', badge_number: 'PC-1001', phone: '0771234567', district: 'Colombo' },
      { id: uuidv4(), full_name: 'Nimal Silva', badge_number: 'PC-1002', phone: '0772345678', district: 'Gampaha' },
      { id: uuidv4(), full_name: 'Kamal Fernando', badge_number: 'PC-1003', phone: '0773456789', district: 'Kandy' },
      { id: uuidv4(), full_name: 'Ruwan Rajapaksa', badge_number: 'PC-1004', phone: '0774567890', district: 'Galle' },
      { id: uuidv4(), full_name: 'Asanka Bandara', badge_number: 'PC-1005', phone: '0775678901', district: 'Matara' },
      { id: uuidv4(), full_name: 'Chaminda Herath', badge_number: 'PC-1006', phone: '0776789012', district: 'Kurunegala' },
      { id: uuidv4(), full_name: 'Lasith Jayasuriya', badge_number: 'PC-1007', phone: '0777890123', district: 'Ratnapura' },
      { id: uuidv4(), full_name: 'Dinesh Wickrama', badge_number: 'PC-1008', phone: '0778901234', district: 'Colombo' },
    ], { ignoreDuplicates: true });
    console.log(`✓ Seeded ${officers.length} officers.`);

    // ── Fines ─────────────────────────────────────────────────────────────────
    const finesData = [
      { ref: 'TF-2026-100001', catIdx: 0, offIdx: 0, nic: '199012345678', name: 'Kamal Perera', vehicle: 'CAB-1234', location: 'Galle Road, Colombo 3', amount: 2500.00, status: 'PENDING' },
      { ref: 'TF-2026-100002', catIdx: 1, offIdx: 1, nic: '199512367890', name: 'Saman Kumara', vehicle: 'WP-AB-1111', location: 'Kandy Road, Gampaha', amount: 1000.00, status: 'PAID' },
      { ref: 'TF-2026-100003', catIdx: 2, offIdx: 2, nic: '198709876543', name: 'Mahesh De Silva', vehicle: 'KY-2222', location: 'Peradeniya Road, Kandy', amount: 7500.00, status: 'PENDING' },
      { ref: 'TF-2026-100004', catIdx: 3, offIdx: 3, nic: '200001234567', name: 'Tharaka Nissanka', vehicle: 'SG-3333', location: 'Galle Fort Entrance', amount: 3000.00, status: 'PAID' },
      { ref: 'TF-2026-100005', catIdx: 4, offIdx: 0, nic: '199811223344', name: 'Pradeep Liyanage', vehicle: 'CAB-5678', location: 'Baseline Road, Colombo 9', amount: 1500.00, status: 'PENDING' },
      { ref: 'TF-2026-100006', catIdx: 5, offIdx: 4, nic: '199305544332', name: 'Isuru Madusanka', vehicle: 'MT-4444', location: 'Matara Town Center', amount: 2000.00, status: 'PAID' },
      { ref: 'TF-2026-100007', catIdx: 6, offIdx: 5, nic: '199710293847', name: 'Dinesh Pathirana', vehicle: 'KU-5555', location: 'Kurunegala Main Street', amount: 1000.00, status: 'PENDING' },
      { ref: 'TF-2026-100008', catIdx: 7, offIdx: 6, nic: '198899887766', name: 'Roshan Wickrama', vehicle: 'RP-6666', location: 'Ratnapura Junction', amount: 5000.00, status: 'PAID' },
      { ref: 'TF-2026-100009', catIdx: 0, offIdx: 7, nic: '200112233445', name: 'Namal Rajapaksa', vehicle: 'CAB-9999', location: 'High Level Road, Colombo 6', amount: 2500.00, status: 'PENDING' },
      { ref: 'TF-2026-100010', catIdx: 3, offIdx: 2, nic: '199654321098', name: 'Aruna Bandara', vehicle: 'KY-7777', location: 'Katugastota, Kandy', amount: 3000.00, status: 'PENDING' },
    ];

    const finesCreated = [];
    for (const f of finesData) {
      const id = uuidv4();
      const fine = await Fine.create({
        id,
        reference_number: f.ref,
        category_id: categories[f.catIdx].id,
        officer_id: officers[f.offIdx].id,
        driver_nic: f.nic,
        driver_name: f.name,
        vehicle_number: f.vehicle,
        location: f.location,
        amount: f.amount,
        status: f.status,
        issued_at: new Date(),
      });
      finesCreated.push({ id: fine.id, ref: f.ref, amount: f.amount, status: f.status });
    }
    console.log(`✓ Seeded ${finesCreated.length} fines.`);

    // ── Payments (for PAID fines) ─────────────────────────────────────────────
    const paidFines = finesCreated.filter((f) => f.status === 'PAID');
    const methods = ['CARD', 'ONLINE_BANKING'];

    for (let i = 0; i < paidFines.length; i++) {
      const f = paidFines[i];
      await Payment.create({
        id: uuidv4(),
        fine_id: f.id,
        amount: f.amount,
        payment_method: methods[i % 2],
        transaction_reference: `TXN-2026-${100001 + i}`,
        paid_at: new Date(),
      });
    }
    console.log(`✓ Seeded ${paidFines.length} payments.`);

    // ── Admin User ────────────────────────────────────────────────────────────
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create(
      {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@traffic-fines.com',
        password_hash: adminPassword,
        role: 'admin',
        phone: '0701234567',
      },
      { ignoreDuplicates: true }
    );
    console.log('✓ Seeded admin user (email: admin@traffic-fines.com, password: admin123)');

    console.log('\n✓ Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Seed failed:', err);
    process.exit(1);
  }
}

seed();
