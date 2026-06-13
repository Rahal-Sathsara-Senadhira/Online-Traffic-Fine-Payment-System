module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Officer', {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    full_name: { type: DataTypes.STRING, allowNull: false },
    badge_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING },
    district: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
  }, { tableName: 'officers', timestamps: false });
};
