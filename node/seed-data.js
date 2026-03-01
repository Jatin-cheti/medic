#!/usr/bin/env node
/**
 * Seed initial data - roles, specialties, languages, etc.
 */

const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Priority: MIGRATION_DATABASE_URL > MYSQL_URL > DATABASE_URL > localhost fallback
const DATABASE_URL = process.env.MIGRATION_DATABASE_URL 
  || process.env.MYSQL_URL 
  || process.env.DATABASE_URL 
  || 'mysql://root:password@127.0.0.1:3307/medicdb';

async function seedData() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('Connected successfully!\n');
  
  // Seed Roles
  console.log('Seeding roles...');
  const roles = [
    { uuid: uuidv4(), name: 'patient', description: 'Patient role for booking appointments' },
    { uuid: uuidv4(), name: 'doctor', description: 'Doctor role for providing consultations' },
    { uuid: uuidv4(), name: 'admin', description: 'Administrator role for system management' }
  ];
  
  for (const role of roles) {
    await connection.query(
      'INSERT IGNORE INTO roles (uuid, name, description) VALUES (?, ?, ?)',
      [role.uuid, role.name, role.description]
    );
    console.log(`  ✓ Created role: ${role.name}`);
  }
  
  // Seed Languages
  console.log('\nSeeding languages...');
  const languages = [
    { uuid: uuidv4(), code: 'en', name: 'English', is_active: true },
    { uuid: uuidv4(), code: 'hi', name: 'Hindi', is_active: true },
    { uuid: uuidv4(), code: 'es', name: 'Spanish', is_active: true },
    { uuid: uuidv4(), code: 'fr', name: 'French', is_active: true },
    { uuid: uuidv4(), code: 'de', name: 'German', is_active: true }
  ];
  
  for (const lang of languages) {
    await connection.query(
      'INSERT IGNORE INTO languages (uuid, code, name, is_active) VALUES (?, ?, ?, ?)',
      [lang.uuid, lang.code, lang.name, lang.is_active]
    );
    console.log(`  ✓ Created language: ${lang.name}`);
  }
  
  // Seed Specialties
  console.log('\nSeeding specialties...');
  const specialties = [
    { uuid: uuidv4(), code: 'cardiology', name: 'Cardiology', is_active: true },
    { uuid: uuidv4(), code: 'dermatology', name: 'Dermatology', is_active: true },
    { uuid: uuidv4(), code: 'neurology', name: 'Neurology', is_active: true },
    { uuid: uuidv4(), code: 'pediatrics', name: 'Pediatrics', is_active: true },
    { uuid: uuidv4(), code: 'orthopedics', name: 'Orthopedics', is_active: true },
    { uuid: uuidv4(), code: 'psychiatry', name: 'Psychiatry', is_active: true },
    { uuid: uuidv4(), code: 'general', name: 'General Medicine', is_active: true }
  ];
  
  for (const specialty of specialties) {
    await connection.query(
      'INSERT IGNORE INTO specialties (uuid, code, name, is_active) VALUES (?, ?, ?, ?)',
      [specialty.uuid, specialty.code, specialty.name, specialty.is_active]
    );
    console.log(`  ✓ Created specialty: ${specialty.name}`);
  }
  
  // Seed Document Types
  console.log('\nSeeding document types...');
  const documentTypes = [
    { uuid: uuidv4(), code: 'medical_license', name: 'Medical License', is_required: true },
    { uuid: uuidv4(), code: 'id_proof', name: 'ID Proof', is_required: true },
    { uuid: uuidv4(), code: 'degree_certificate', name: 'Degree Certificate', is_required: true },
    { uuid: uuidv4(), code: 'experience_certificate', name: 'Experience Certificate', is_required: false }
  ];
  
  for (const docType of documentTypes) {
    await connection.query(
      'INSERT IGNORE INTO document_types (uuid, code, name, is_required) VALUES (?, ?, ?, ?)',
      [docType.uuid, docType.code, docType.name, docType.is_required]
    );
    console.log(`  ✓ Created document type: ${docType.name}`);
  }
  
  // Seed Payment Methods
  console.log('\nSeeding payment methods...');
  const paymentMethods = [
    { uuid: uuidv4(), code: 'credit_card', name: 'Credit Card', is_active: true },
    { uuid: uuidv4(), code: 'debit_card', name: 'Debit Card', is_active: true },
    { uuid: uuidv4(), code: 'upi', name: 'UPI', is_active: true },
    { uuid: uuidv4(), code: 'wallet', name: 'Wallet', is_active: true },
    { uuid: uuidv4(), code: 'cash', name: 'Cash', is_active: true }
  ];
  
  for (const method of paymentMethods) {
    await connection.query(
      'INSERT IGNORE INTO payment_methods (uuid, code, name, is_active) VALUES (?, ?, ?, ?)',
      [method.uuid, method.code, method.name, method.is_active]
    );
    console.log(`  ✓ Created payment method: ${method.name}`);
  }
  
  await connection.end();
  console.log('\n✅ All seed data inserted successfully!');
}

seedData().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
