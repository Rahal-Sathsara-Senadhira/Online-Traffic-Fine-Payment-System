const db   = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function findByEmail(email) {
  const [rows] = await db.query('SELECT * FROM app_users WHERE email = ?', [email]);
  return rows[0] ?? null;
}

async function create({ email, passwordHash }) {
  const id = uuidv4();
  await db.query(
    'INSERT INTO app_users (id, email, password_hash) VALUES (?, ?, ?)',
    [id, email, passwordHash]
  );
  return { id, email, role: 'ADMIN' };
}

module.exports = { findByEmail, create };
