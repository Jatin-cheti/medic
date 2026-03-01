const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  mongodb: {
    // Read connection string from .env
    url: process.env.MONGO_URL || 'mongodb://localhost:27017/medicdb',

    // Leave databaseName undefined to use the DB in the URL
    databaseName: undefined,

    // Use an empty options object (modern driver doesn't need useNewUrlParser/useUnifiedTopology)
    options: {}
  },

  migrationsDir: "src/migrations/mongo",
  changelogCollectionName: "migrations_changelog",
  migrationFileExtension: ".js",
};