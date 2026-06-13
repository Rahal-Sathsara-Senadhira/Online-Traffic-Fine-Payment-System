const fineRepo = require('../repositories/fine.repository');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const getByReference = asyncHandler(async (req, res, next) => {
  const { referenceNumber } = req.params;
  const fine = await fineRepo.findByReferenceNumber(referenceNumber);
  if (!fine) throw new ApiError(404, 'NOT_FOUND', 'Fine not found');
  res.json(fine);
});

const createFine = asyncHandler(async (req, res, next) => {
  const { categoryId, officerId, driverNic, driverName, vehicleNumber, location, amount } = req.body;
  const created = await fineRepo.create({ categoryId, officerId, driverNic, driverName, vehicleNumber, location, amount });
  res.status(201).json(created);
});

const listFines = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const fines = await fineRepo.findAll({ status });
  res.json(fines);
});

module.exports = { getByReference, createFine, listFines };
