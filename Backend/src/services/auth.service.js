const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt.util');
const userRepo = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 12;

async function login(email, password) {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  const token = generateToken({ id: user.id, role: user.role });
  return { token, expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '86400') };
}

async function register(email, password) {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ApiError(409, 'USER_EXISTS', `Email '${email}' is already registered`);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepo.create({ email, passwordHash });
  return { id: user.id, email: user.email, role: user.role };
}

module.exports = { login, register };
