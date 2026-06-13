require('dotenv').config();
require('./config/env');

const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✓ Database connection established.');

    // Sync models (non-destructive — does not alter existing columns)
    await sequelize.sync({ alter: false });
    console.log('✓ Database models synced.');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Traffic Fine API running on http://localhost:${PORT}`);
      console.log(`\nEndpoints:\n  GET    /api/fines/:referenceNumber\n  POST   /api/fines/\n  GET    /api/fines/\n  POST   /api/payments/\n  GET    /api/payments/:id\n  GET    /api/reports/summary\n  GET    /api/reports/districts\n  GET    /api/reports/categories\n`);
    });
  } catch (err) {
    console.error('✗ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
