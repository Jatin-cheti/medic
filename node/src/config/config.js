require('dotenv').config();

const firstNonEmpty = (...values) => values.find(v => v && String(v).trim() !== '');

const dbUser = firstNonEmpty(process.env.DB_USER, process.env.DB_USERNAME, process.env.MYSQLUSER) || 'root';
const dbPass = firstNonEmpty(process.env.DB_PASS, process.env.DB_PASSWORD, process.env.MYSQLPASSWORD) || 'password';
const dbName = firstNonEmpty(process.env.DB_NAME, process.env.DB_DATABASE, process.env.MYSQLDATABASE) || 'chatdb';
const dbHost = firstNonEmpty(process.env.DB_HOST, process.env.MYSQLHOST) || '127.0.0.1';
const dbPort = Number(firstNonEmpty(process.env.DB_PORT, process.env.MYSQLPORT) || 3306);

module.exports = {
  development: {
    username: dbUser,
    password: dbPass,
    database: dbName,
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: dbUser,
    password: dbPass,
    database: process.env.DB_NAME || process.env.DB_DATABASE || process.env.MYSQLDATABASE || 'chatdb_test',
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: firstNonEmpty(process.env.DB_USER, process.env.DB_USERNAME, process.env.MYSQLUSER),
    password: firstNonEmpty(process.env.DB_PASS, process.env.DB_PASSWORD, process.env.MYSQLPASSWORD),
    database: firstNonEmpty(process.env.DB_NAME, process.env.DB_DATABASE, process.env.MYSQLDATABASE),
    host: firstNonEmpty(process.env.DB_HOST, process.env.MYSQLHOST),
    port: Number(firstNonEmpty(process.env.DB_PORT, process.env.MYSQLPORT) || 3306),
    dialect: 'mysql',
    logging: false
  }
};