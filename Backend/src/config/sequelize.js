const { Sequelize } = require('sequelize');
const path = require('path');

const dialect = process.env.DB_DIALECT || 'mysql';

const sequelize = dialect === 'sqlite'
  ? new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE ? path.resolve(process.env.DB_STORAGE) : path.join(__dirname, '../../database.sqlite'),
      logging: false,
      define: { timestamps: true, underscored: true },
    })
  : new Sequelize(
      process.env.DB_NAME || 'traffic_fines',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        logging: false,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        define: { timestamps: true, underscored: true },
      }
    );

module.exports = { sequelize, Sequelize };
