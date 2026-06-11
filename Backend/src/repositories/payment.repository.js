const db = require('../config/db');

async function create({ id, fineId, amount, paymentMethod, transactionReference }) {
  await db.query(
    `INSERT INTO payments (id, fine_id, amount, payment_method, transaction_reference)
     VALUES (?, ?, ?, ?, ?)`,
    [id, fineId, amount, paymentMethod, transactionReference]
  );
  const [rows] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
  return rows[0];
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT p.*, f.reference_number, f.driver_name, f.vehicle_number
     FROM payments p
     JOIN fines f ON p.fine_id = f.id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

module.exports = { create, findById };
