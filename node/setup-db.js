#!/usr/bin/env node
/**
 * Combined migration and seed script for Railway
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runAll() {
  console.log('🚀 Starting migrations and seeding...\n');
  
  try {
    // Run migrations
    console.log('📋 Running migrations...');
    const { stdout: migStdout, stderr: migStderr } = await execPromise('node run-migrations.js');
    console.log(migStdout);
    if (migStderr) console.error(migStderr);
    
    // Run seed data
    console.log('\n📊 Running seed data...');
    const { stdout: seedStdout, stderr: seedStderr } = await execPromise('node seed-data.js');
    console.log(seedStdout);
    if (seedStderr) console.error(seedStderr);
    
    console.log('\n✅ All done! Tables created and seeded.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

runAll();
