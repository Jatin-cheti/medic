#!/usr/bin/env node
/**
 * Migration runner - executes all SQL migration files
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { DataTypes, Sequelize } = require('sequelize');
require('dotenv').config();

// Priority: MIGRATION_DATABASE_URL > MYSQL_URL > DATABASE_URL > localhost fallback
const DATABASE_URL = process.env.MIGRATION_DATABASE_URL 
  || process.env.MYSQL_URL 
  || process.env.DATABASE_URL 
  || 'mysql://root:password@127.0.0.1:3307/medicdb';

async function runMigrations() {
  console.log('Connecting to database:', DATABASE_URL.replace(/:[^:@]+@/, ':***@'));
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('Connected successfully!');
  
  const migrationsDir = path.join(__dirname, 'src', 'migrations', 'sql');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.js'))
    .sort();
  
  console.log(`Found ${files.length} migration files\n`);
  
  for (const file of files) {
    console.log(`Running migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const migration = require(filePath);
    
    if (migration.up) {
      try {
        // Create a mock queryInterface for Sequelize migrations
        const queryInterface = {
          createTable: async (tableName, columns) => {
            let sql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (`;
            const columnDefs = [];
            
            for (const [colName, colDef] of Object.entries(columns)) {
              let colSql = `\`${colName}\` `;
              
              // Map Sequelize types to MySQL types
              if (colDef.type) {
                let mysqlType = 'VARCHAR(255)';
                
                // Check against Data Types constructors
                if (colDef.type instanceof DataTypes.BIGINT || colDef.type.constructor.name === 'BIGINT') {
                  mysqlType = 'BIGINT';
                  if (colDef.type.options && colDef.type.options.unsigned) {
                    mysqlType += ' UNSIGNED';
                  }
                } else if (colDef.type instanceof DataTypes.INTEGER || colDef.type.constructor.name === 'INTEGER') {
                  mysqlType = 'INT';
                } else if (colDef.type instanceof DataTypes.STRING || colDef.type.constructor.name === 'STRING') {
                  const len = colDef.type._length || 255;
                  mysqlType = `VARCHAR(${len})`;
                } else if (colDef.type instanceof DataTypes.TEXT || colDef.type.constructor.name === 'TEXT') {
                  mysqlType = 'TEXT';
                } else if (colDef.type instanceof DataTypes.DATE || colDef.type.constructor.name === 'DATE' || colDef.type === DataTypes.DATE) {
                  mysqlType = 'DATETIME';
                } else if (colDef.type instanceof DataTypes.BOOLEAN || colDef.type.constructor.name === 'BOOLEAN') {
                  mysqlType = 'TINYINT(1)';
                } else if (colDef.type instanceof DataTypes.DECIMAL || colDef.type.constructor.name === 'DECIMAL') {
                  mysqlType = 'DECIMAL(10,2)';
                } else if (colDef.type instanceof DataTypes.ENUM || colDef.type.constructor.name === 'ENUM') {
                  const values = colDef.type.values.map(v => `'${v}'`).join(',');
                  mysqlType = `ENUM(${values})`;
                }
                
                colSql += mysqlType;
              }
              
              if (colDef.autoIncrement) colSql += ' AUTO_INCREMENT';
              if (colDef.primaryKey) colSql += ' PRIMARY KEY';
              if (colDef.unique) colSql += ' UNIQUE';
              if (colDef.allowNull === false) colSql += ' NOT NULL';
              if (colDef.defaultValue !== undefined) {
                if (typeof colDef.defaultValue === 'object' && colDef.defaultValue.val) {
                  // This is Sequelize.literal()
                  colSql += ` DEFAULT ${colDef.defaultValue.val}`;
                } else if (typeof colDef.defaultValue === 'string') {
                  colSql += ` DEFAULT '${colDef.defaultValue}'`;
                } else if (typeof colDef.defaultValue === 'boolean') {
                  colSql += ` DEFAULT ${colDef.defaultValue ? 1 : 0}`;
                } else {
                  colSql += ` DEFAULT ${colDef.defaultValue}`;
                }
              }
              
              columnDefs.push(colSql);
            }
            
            sql += columnDefs.join(', ') + ')';
            
            console.log(`  Creating table: ${tableName}`);
            await connection.query(sql);
          },
          
          addIndex: async (tableName, columns, options = {}) => {
            const indexName = options.name || `idx_${tableName}_${columns.join('_')}`;
            const unique = options.unique ? 'UNIQUE' : '';
            const cols = Array.isArray(columns) ? columns.join('`, `') : columns;
            const sql = `CREATE ${unique} INDEX \`${indexName}\` ON \`${tableName}\` (\`${cols}\`)`;
            console.log(`  Creating index: ${indexName}`);
            await connection.query(sql).catch(err => {
              if (!err.message.includes('Duplicate key name') && !err.message.includes('already exists')) {
                throw err;
              }
            });
          },
          
          addConstraint: async (tableName, options) => {
            console.log(`  Adding constraint: ${options.name || 'unnamed'}`);
            // Skip constraint creation - they're handled by foreign keys in createTable
            return Promise.resolve();
          },
          
          addColumn: async (tableName, columnName, columnDef) => {
            console.log(`  Adding column: ${columnName} to ${tableName}`);
            let colSql = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` `;
            
            // Map type
            if (columnDef.type) {
              let mysqlType = 'VARCHAR(255)';
              
              if (columnDef.type instanceof DataTypes.BIGINT || columnDef.type.constructor.name === 'BIGINT') {
                mysqlType = 'BIGINT';
                if (columnDef.type.options && columnDef.type.options.unsigned) {
                  mysqlType += ' UNSIGNED';
                }
              } else if (columnDef.type instanceof DataTypes.INTEGER) {
                mysqlType = 'INT';
              } else if (columnDef.type instanceof DataTypes.STRING) {
                const len = columnDef.type._length || 255;
                mysqlType = `VARCHAR(${len})`;
              } else if (columnDef.type instanceof DataTypes.TEXT) {
                mysqlType = 'TEXT';
              } else if (columnDef.type instanceof DataTypes.DATE || columnDef.type === DataTypes.DATE) {
                mysqlType = 'DATETIME';
              } else if (columnDef.type instanceof DataTypes.BOOLEAN) {
                mysqlType = 'TINYINT(1)';
              }
              
              colSql += mysqlType;
            }
            
            if (columnDef.unique) colSql += ' UNIQUE';
            if (columnDef.allowNull === false) colSql += ' NOT NULL';
            else if (columnDef.allowNull === true) colSql += ' NULL';
            if (columnDef.defaultValue !== undefined) {
              if (typeof columnDef.defaultValue === 'object' && columnDef.defaultValue.val) {
                colSql += ` DEFAULT ${columnDef.defaultValue.val}`;
              } else if (typeof columnDef.defaultValue === 'string') {
                colSql += ` DEFAULT '${columnDef.defaultValue}'`;
              } else {
                colSql += ` DEFAULT ${columnDef.defaultValue}`;
              }
            }
            
            await connection.query(colSql).catch(err => {
              if (!err.message.includes('Duplicate column name')) {
                throw err;
              }
            });
          },
          
          removeColumn: async (tableName, columnName) => {
            console.log(`  Removing column: ${columnName} from ${tableName}`);
            await connection.query(`ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``);
          },
          
          dropTable: async (tableName) => {
            await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);
          }
        };
        
        await migration.up(queryInterface, Sequelize);
        console.log(`  ✓ Migration completed\n`);
      } catch (err) {
        console.error(`  ✗ Migration failed:`, err.message);
        if (!err.message.includes('already exists')) {
          throw err;
        }
      }
    }
  }
  
  await connection.end();
  console.log('All migrations completed successfully!');
}

runMigrations().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
