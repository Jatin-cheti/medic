#!/usr/bin/env node
/**
 * E2E Test Suite for Medic Application
 * Tests complete flow: Signup → Login → Dashboard → Doctor Search
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

// Test results tracking
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

// Helper function to make HTTP requests
function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : BASE_URL + path);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            rawBody: body,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: body,
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Test assertion helper
function assert(condition, testName, details = '') {
  testsRun++;
  if (condition) {
    testsPassed++;
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    if (details) console.log(`  ${colors.blue}${details}${colors.reset}`);
  } else {
    testsFailed++;
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (details) console.log(`  ${colors.red}${details}${colors.reset}`);
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.blue}=== Medic Application E2E Tests ===${colors.reset}\n`);

  let patientToken = '';
  let refreshToken = '';
  let doctorToken = '';
  const testEmail = `test-${Date.now()}@medic.app`;
  const testPhone = `9999${String(Date.now()).slice(-7)}`;
  const testPassword = 'TestPassword123!';

  try {
    // Test 1: Patient Signup
    console.log(`${colors.yellow}Testing Patient Signup...${colors.reset}`);
    let res = await request('POST', `${API_URL}/auth/patient/signup`, {
      firstName: 'Test',
      lastName: 'Patient',
      email: testEmail,
      phone: testPhone,
      password: testPassword,
      gender: 'Male',
      preferredLanguage: 'en',
    });

    assert(res.status === 201, 'Patient signup returns 201', `Status: ${res.status}`);
    assert(res.body?.token, 'Patient signup returns token', res.body?.token ? 'Token received ✓' : 'No token');
    assert(res.body?.refreshToken, 'Patient signup returns refreshToken', res.body?.refreshToken ? 'Refresh token received ✓' : 'No refresh token');
    assert(res.body?.user?.id, 'Patient signup returns user', `User ID: ${res.body?.user?.id}`);

    if (res.body?.token) {
      patientToken = res.body.token;
      refreshToken = res.body.refreshToken;
    }

    // Test 2: Patient Login
    console.log(`\n${colors.yellow}Testing Patient Login...${colors.reset}`);
    res = await request('POST', `${API_URL}/auth/patient/login`, {
      email: testEmail,
      password: testPassword,
    });

    assert(res.status === 200, 'Patient login returns 200', `Status: ${res.status}`);
    assert(res.body?.token, 'Patient login returns token', res.body?.token ? 'Token received ✓' : 'No token');
    assert(res.body?.user?.id, 'Patient login returns user', `User ID: ${res.body?.user?.id}`);

    if (res.body?.token) {
      patientToken = res.body.token;
    }

    // Test 3: Token Refresh
    console.log(`\n${colors.yellow}Testing Token Refresh...${colors.reset}`);
    res = await request('POST', `${API_URL}/auth/refresh-token`, {
      refreshToken,
    });

    assert(res.status === 200, 'Token refresh returns 200', `Status: ${res.status}`);
    assert(res.body?.token, 'Token refresh returns new token', res.body?.token ? 'New token received ✓' : 'No new token');

    if (res.body?.token) {
      patientToken = res.body.token;
    }

    // Test 4: Dashboard Access (requires valid token)
    console.log(`\n${colors.yellow}Testing Dashboard Access...${colors.reset}`);
    res = await request('GET', `${API_URL}/patient/dashboard`, null, {
      Authorization: `Bearer ${patientToken}`,
    });

    assert(res.status === 200, 'Dashboard returns 200', `Status: ${res.status}`);
    assert(res.body?.patient, 'Dashboard returns patient info', `Patient: ${res.body?.patient?.first_name}`);
    assert(Array.isArray(res.body?.appointments), 'Dashboard returns appointments array', `Count: ${res.body?.appointments?.length || 0}`);
    assert(Array.isArray(res.body?.doctors), 'Dashboard returns doctors array', `Count: ${res.body?.doctors?.length || 0}`);
    assert(res.body?.stats, 'Dashboard returns stats', `Stats: ${JSON.stringify(res.body?.stats)}`);

    // Test 5: Doctor Search
    console.log(`\n${colors.yellow}Testing Doctor Search...${colors.reset}`);
    res = await request('GET', `${API_URL}/patient/doctors/search?limit=5`, null, {
      Authorization: `Bearer ${patientToken}`,
    });

    assert(res.status === 200, 'Doctor search returns 200', `Status: ${res.status}`);
    assert(Array.isArray(res.body?.doctors), 'Doctor search returns doctors array', `Count: ${res.body?.doctors?.length || 0}`);

    // Test 6: Unauthorized Access (missing token)
    console.log(`\n${colors.yellow}Testing Authorization...${colors.reset}`);
    res = await request('GET', `${API_URL}/patient/dashboard`);

    assert(res.status === 401, 'Missing token returns 401', `Status: ${res.status}`);
    assert(res.body?.error === 'token required', 'Missing token error message', `Error: ${res.body?.error}`);

    // Test 7: Invalid Token
    console.log(`\n${colors.yellow}Testing Invalid Token...${colors.reset}`);
    res = await request('GET', `${API_URL}/patient/dashboard`, null, {
      Authorization: 'Bearer invalid_token_xyz',
    });

    assert(res.status === 401, 'Invalid token returns 401', `Status: ${res.status}`);
    assert(res.body?.error === 'invalid token', 'Invalid token error message', `Error: ${res.body?.error}`);

    // Summary
    console.log(`\n${colors.blue}=== Test Summary ===${colors.reset}`);
    console.log(`Total Tests: ${testsRun}`);
    console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
    if (testsFailed > 0) {
      console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
    }

    const passPercentage = ((testsPassed / testsRun) * 100).toFixed(1);
    console.log(`\nPass Rate: ${passPercentage}%\n`);

    if (testsFailed === 0) {
      console.log(`${colors.green}✓ All tests passed!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.red}✗ Some tests failed.${colors.reset}\n`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`${colors.red}Error during tests:${colors.reset}`, err.message);
    process.exit(1);
  }
}

runTests();
