'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Explicit model list to ensure deterministic load order and association setup
const modelFiles = [
  'user',
  'conversation',
  'conversationParticipant',
  'contact',
  'device',
  'callSession',
  'callParticipant'
];

modelFiles.forEach(filename => {
  const filePath = path.join(__dirname, `${filename}.js`);
  if (fs.existsSync(filePath)) {
    const model = require(filePath)(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  } else {
    console.warn(`Model file not found: ${filePath} — skipping`);
  }
});

// If there are any other model files (not in the explicit list), load them too
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1 &&
      !modelFiles.includes(file.slice(0, -3))
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Run associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;