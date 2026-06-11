const required = [
  'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
  'JWT_SECRET', 'SMS_GATEWAY_URL', 'SMS_API_KEY',
];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
