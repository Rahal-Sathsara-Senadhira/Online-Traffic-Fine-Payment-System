module.exports = (sequelize, DataTypes) => {
  return sequelize.define('FineCategory', {
    id: { type: DataTypes.STRING(36), primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    default_amount: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  }, { tableName: 'fine_categories' });
};
