const authService   = require('../services/auth.service');
const asyncHandler  = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  res.status(200).json(result);
});

const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.register(username, password);
  res.status(201).json(result);
});

module.exports = { login, register };
