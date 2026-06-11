const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function findByReferenceNumber(referenceNumber) {
  const [rows] = await db.query(
    `SELECT f.*, fc.id AS category_id, fc.name AS category_name,
            o.id AS officer_id, o.phone AS officer_phone,
            o.badge_number, o.district
     FROM fines f
     JOIN fine_categories fc ON f.category_id = fc.id
     JOIN officers o ON f.officer_id = o.id
     WHERE f.reference_number = ?`,
    [referenceNumber]
  );
  return rows[0] ?? null;
}

async function findAll({ status } = {}) {
  const where  = status ? 'WHERE f.status = ?' : '';
  const params = status ? [status] : [];
  const [rows] = await db.query(
    `SELECT f.*, fc.name AS category_name, o.badge_number, o.district
     FROM fines f
     JOIN fine_categories fc ON f.category_id = fc.id
     JOIN officers o ON f.officer_id = o.id
     ${where}
     ORDER BY f.issued_at DESC`,
    params
  );
  return rows;
}

async function create({ categoryId, officerId, driverNic, driverName, vehicleNumber, location, amount }) {
  const id = uuidv4();
  const referenceNumber = `TF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  await db.query(
    `INSERT INTO fines (id, reference_number, category_id, officer_id, driver_nic, driver_name, vehicle_number, location, amount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, referenceNumber, categoryId, officerId, driverNic, driverName, vehicleNumber, location, amount]
  );
  return { id, referenceNumber };
}

async function updateStatus(id, status) {
  await db.query('UPDATE fines SET status = ? WHERE id = ?', [status, id]);
}

module.exports = { findByReferenceNumber, findAll, create, updateStatus };
