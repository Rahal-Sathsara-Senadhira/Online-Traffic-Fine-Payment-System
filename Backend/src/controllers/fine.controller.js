const fineRepo = require('../repositories/fine.repository');
const ApiError = require('../utils/ApiError');

async function getByReference(req, res, next) {
  try {
    const { referenceNumber } = req.params;
    const fine = await fineRepo.findByReferenceNumber(referenceNumber);
    if (!fine) return next(new ApiError(404, 'NOT_FOUND', 'Fine not found'));
    res.json(fine);
  } catch (err) {
    next(err);
  }
}

async function createFine(req, res, next) {
  try {
    const { categoryId, officerId, driverNic, driverName, vehicleNumber, location, amount } = req.body;
    if (!categoryId || !officerId || !driverNic || !amount) {
      return next(new ApiError(400, 'VALIDATION_ERROR', 'Missing required fields'));
    }
    const created = await fineRepo.create({ categoryId, officerId, driverNic, driverName, vehicleNumber, location, amount });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function listFines(req, res, next) {
  try {
    const { status } = req.query;
    const fines = await fineRepo.findAll({ status });
    res.json(fines);
  } catch (err) {
    next(err);
  }
}

module.exports = { getByReference, createFine, listFines };
