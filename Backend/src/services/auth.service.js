const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt.util');
const userRepo = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 12;

async function login(username, password) {
  const user = await userRepo.findByUsername(username);
  if (!user) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid username or password');

  const token = generateToken({ id: user.id, role: user.role });
  return { token, expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '86400') };
}

async function register(username, password) {
  const existing = await userRepo.findByUsername(username);
  if (existing) throw new ApiError(409, 'USER_EXISTS', `Username '${username}' is already taken`);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepo.create({ username, passwordHash });
  return { id: user.id, username: user.username, role: user.role };
}

module.exports = { login, register };
