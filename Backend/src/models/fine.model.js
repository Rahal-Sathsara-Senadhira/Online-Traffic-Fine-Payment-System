module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Fine', {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    reference_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    category_id: { type: DataTypes.STRING(36), allowNull: false },
    officer_id: { type: DataTypes.STRING(36), allowNull: false },
    driver_nic: { type: DataTypes.STRING, allowNull: false },
    driver_name: { type: DataTypes.STRING },
    vehicle_number: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'PENDING' },
    issued_at: { type: DataTypes.DATE },
  }, { tableName: 'fines', timestamps: false });
};
