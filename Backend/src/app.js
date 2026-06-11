const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const authRoutes     = require('./routes/auth.routes');
const fineRoutes     = require('./routes/fine.routes');
const paymentRoutes  = require('./routes/payment.routes');
const officerRoutes  = require('./routes/officer.routes');
const categoryRoutes = require('./routes/category.routes');
const reportRoutes   = require('./routes/report.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: [process.env.ADMIN_PORTAL_URL, process.env.DRIVER_PORTAL_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',       authRoutes);
app.use('/api/fines',      fineRoutes);
app.use('/api/payments',   paymentRoutes);
app.use('/api/officers',   officerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports',    reportRoutes);

app.use((err, req, res, next) => {
  const status  = err.statusCode ?? 500;
  const code    = err.code       ?? 'INTERNAL_ERROR';
  const message = err.message    ?? 'An unexpected error occurred';
  res.status(status).json({ error: code, message, timestamp: new Date().toISOString() });
});

module.exports = app;
