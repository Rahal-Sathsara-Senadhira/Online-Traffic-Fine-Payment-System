const fineRepo = require('../repositories/fine.repository');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const db = require('../config/db');

const getByReference = asyncHandler(async (req, res, next) => {
  const { referenceNumber } = req.params;
  const fine = await fineRepo.findByReferenceNumber(referenceNumber);
  if (!fine) throw new ApiError(404, 'NOT_FOUND', 'Fine not found');
  res.json(fine);
});

const createFine = asyncHandler(async (req, res, next) => {
  const { categoryId, driverNic, driverName, vehicleNumber, location, amount } = req.body;

  let officerId;
  if (req.user.role === 'OFFICER') {
    // Look up fresh from DB — don't depend on JWT having officer_id
    const [rows] = await db.query('SELECT officer_id FROM app_users WHERE id = ?', [req.user.id]);
    officerId = rows[0]?.officer_id ?? null;
  } else {
    officerId = req.body.officerId;
  }

  if (!officerId) throw new ApiError(400, 'MISSING_OFFICER', 'officerId is required');
  const created = await fineRepo.create({ categoryId, officerId, driverNic, driverName, vehicleNumber, location, amount });
  res.status(201).json(created);
});

const listFines = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const fines = await fineRepo.findAll({ status });
  res.json(fines);
});

module.exports = { getByReference, createFine, listFines };
