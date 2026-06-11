const db   = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function findByUsername(username) {
  const [rows] = await db.query('SELECT * FROM app_users WHERE username = ?', [username]);
  return rows[0] ?? null;
}

async function create({ username, passwordHash }) {
  const id = uuidv4();
  await db.query(
    'INSERT INTO app_users (id, username, password_hash) VALUES (?, ?, ?)',
    [id, username, passwordHash]
  );
  return { id, username, role: 'ADMIN' };
}

module.exports = { findByUsername, create };
