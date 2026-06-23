const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function findByUsername(username) {
  const user = await User.findOne({ where: { email: username } });
  if (user) {
    return {
      id: user.id,
      name: user.name,
      username: user.email, // Map email to username for compatibility
      email: user.email,
      password_hash: user.password_hash,
      role: user.role,
      phone: user.phone
    };
  }
  return null;
}

async function create({ username, passwordHash }) {
  const id = uuidv4();
  const user = await User.create({
    id,
    name: username.split('@')[0],
    email: username,
    password_hash: passwordHash,
    role: 'ADMIN'
  });
  return { id: user.id, username: user.email, role: user.role };
}

module.exports = { findByUsername, create };
