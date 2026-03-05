#!/usr/bin/env node
/**
 * Migration + seed script for super_admin role and admin users.
 *
 * Usage:
 *   node seed-admin-users.js               # auto-detects from .env
 *   node seed-admin-users.js --env local   # load .env.local  (Docker MySQL @ 127.0.0.1:3307)
 *   node seed-admin-users.js --env railway # load .env.railway (Railway public TCP proxy)
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const dotenv = require('dotenv');

// Determine which .env file to load based on --env flag
const envArg = process.argv.find((a, i) => process.argv[i - 1] === '--env');
if (envArg) {
  const envFile = path.resolve(__dirname, `.env.${envArg}`);
  const result = dotenv.config({ path: envFile, override: true });
  if (result.error) {
    console.error(`❌ Could not load ${envFile}: ${result.error.message}`);
    process.exit(1);
  }
  console.log(`📂 Loaded environment: .env.${envArg}\n`);
} else {
  dotenv.config({ override: true });
  console.log(`📂 Loaded environment: .env\n`);
}

const DATABASE_URL =
  process.env.MIGRATION_DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.DATABASE_URL ||
  'mysql://root:password@127.0.0.1:3307/medicdb';

// Mask password in logs
const safeUrl = DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
console.log(`🔗 Connecting to: ${safeUrl}`);

async function run() {
  console.log('🔌 Connecting to database…');
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log('✅ Connected\n');

  // ── 1. Extend ENUM to include super_admin ───────────────────────────────
  console.log('📋 Altering roles.name ENUM to include super_admin…');
  try {
    await conn.query(
      `ALTER TABLE roles MODIFY COLUMN name ENUM('patient','doctor','admin','super_admin') NOT NULL`
    );
    console.log("  ✓ ENUM updated (or already up to date)\n");
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('already')) {
      console.log("  ✓ ENUM already includes super_admin\n");
    } else {
      console.error('  ✗ ALTER failed:', err.message);
    }
  }

  // ── 2. Insert super_admin role ──────────────────────────────────────────
  console.log('🔑 Ensuring super_admin role exists…');
  await conn.query(
    `INSERT IGNORE INTO roles (uuid, name, description, created_at, updated_at)
     VALUES (?, 'super_admin', 'Super Administrator with full platform control', NOW(), NOW())`,
    [uuidv4()]
  );
  const [[superAdminRole]] = await conn.query(
    "SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1"
  );
  const [[adminRole]] = await conn.query(
    "SELECT id FROM roles WHERE name = 'admin' LIMIT 1"
  );
  console.log(`  ✓ super_admin role id = ${superAdminRole.id}`);
  console.log(`  ✓ admin role id       = ${adminRole.id}\n`);

  // ── 3. Define users to create ───────────────────────────────────────────
  const users = [
    {
      email: 'superadmin@medic.com',
      password: 'SuperAdmin@2026',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+919000000001',
      roleId: superAdminRole.id,
      label: 'super_admin',
    },
    {
      email: 'admin1@medic.com',
      password: 'Admin@2026',
      firstName: 'Admin',
      lastName: 'One',
      phone: '+919000000002',
      roleId: adminRole.id,
      label: 'admin',
    },
    {
      email: 'admin2@medic.com',
      password: 'Admin@2026',
      firstName: 'Admin',
      lastName: 'Two',
      phone: '+919000000003',
      roleId: adminRole.id,
      label: 'admin',
    },
  ];

  // ── 4. Insert users ─────────────────────────────────────────────────────
  console.log('👤 Creating admin users…');
  for (const u of users) {
    // Check existing
    const [[existing]] = await conn.query(
      'SELECT id, email FROM users WHERE email = ? LIMIT 1',
      [u.email]
    );
    if (existing) {
      console.log(`  ⚠  ${u.email} already exists — skipping`);
      continue;
    }

    const hash = await bcrypt.hash(u.password, 12);
    await conn.query(
      `INSERT INTO users
         (uuid, role_id, email, phone, password_hash, first_name, last_name,
          is_verified, is_active, is_suspended, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 0, NOW(), NOW())`,
      [uuidv4(), u.roleId, u.email, u.phone, hash, u.firstName, u.lastName]
    );
    console.log(`  ✓ Created [${u.label}]  ${u.email}  /  ${u.password}`);
  }

  console.log('\n🎉 Done! Summary:');
  console.log('  superadmin@medic.com   →  password: SuperAdmin@2026  (Super Admin)');
  console.log('  admin1@medic.com       →  password: Admin@2026        (Admin)');
  console.log('  admin2@medic.com       →  password: Admin@2026        (Admin)');

  await conn.end();
}

run().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
