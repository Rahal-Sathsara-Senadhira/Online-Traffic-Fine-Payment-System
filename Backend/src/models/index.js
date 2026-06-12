const { sequelize, Sequelize } = require('../config/sequelize');

const FineCategoryModel = require('./fineCategory.model');
const OfficerModel = require('./officer.model');
const FineModel = require('./fine.model');
const PaymentModel = require('./payment.model');
const UserModel = require('./user.model');

const FineCategory = FineCategoryModel(sequelize, Sequelize.DataTypes);
const Officer = OfficerModel(sequelize, Sequelize.DataTypes);
const Fine = FineModel(sequelize, Sequelize.DataTypes);
const Payment = PaymentModel(sequelize, Sequelize.DataTypes);
const User = UserModel(sequelize, Sequelize.DataTypes);

// Associations - keep names matching existing foreign keys
Fine.belongsTo(FineCategory, { foreignKey: 'category_id', as: 'category' });
Fine.belongsTo(Officer, { foreignKey: 'officer_id', as: 'officer' });
Payment.belongsTo(Fine, { foreignKey: 'fine_id', as: 'fine' });
Fine.hasOne(Payment, { foreignKey: 'fine_id', as: 'payment' });

module.exports = { sequelize, FineCategory, Officer, Fine, Payment, User };
