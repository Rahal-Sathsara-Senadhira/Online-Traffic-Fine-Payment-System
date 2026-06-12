module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Payment', {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    fine_id: { type: DataTypes.STRING(36), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    method: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    transaction_ref: { type: DataTypes.STRING },
    paid_at: { type: DataTypes.DATE },
  }, { tableName: 'payments' });
};
