module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING, defaultValue: 'driver' },
    nic: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    officer_id: { type: DataTypes.STRING(36), allowNull: true },
  }, { tableName: 'app_users', timestamps: false });
};
