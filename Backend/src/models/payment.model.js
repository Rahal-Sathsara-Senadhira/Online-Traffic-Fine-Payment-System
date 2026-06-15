module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Payment', {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    fine_id: { type: DataTypes.STRING(36), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    payment_method: { type: DataTypes.STRING, allowNull: false, field: 'payment_method' },
    transaction_reference: { type: DataTypes.STRING, field: 'transaction_reference' },
    paid_at: { type: DataTypes.DATE, field: 'paid_at' },
  }, { tableName: 'payments', timestamps: false });
};
