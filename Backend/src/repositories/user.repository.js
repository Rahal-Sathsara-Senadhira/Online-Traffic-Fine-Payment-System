const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function findByEmail(email) {
  const user = await User.findOne({ where: { email } });
  return user ? user.get({ plain: true }) : null;
}

async function create({ email, passwordHash, role }) {
  const user = await User.create({
    id: uuidv4(),
    email,
    password_hash: passwordHash,
    role,
  });
  return user.get({ plain: true });
}

module.exports = { findByEmail, create };
