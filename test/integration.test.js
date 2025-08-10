#!/usr/bin/env node

/**
 * Integration test script for the enhanced security and observability features
 * Tests all endpoints and functionality
 */

const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = 'test-secret-123';

// Test configuration
const tests = [
  {
    name: 'Public Health Check',
    method: 'GET',
    path: '/health',
    headers: {},
    expectStatus: 200,
    expectFields: ['status', 'timestamp', 'uptime', 'version']
  },
  {
    name: 'Ops Health Check',
    method: 'GET',
    path: '/health',
    headers: { 'x-api-role': 'ops' },
    expectStatus: 200,
    expectFields: ['status', 'details']
  },
  {
    name: 'Admin Health Check',
    method: 'GET',
    path: '/health',
    headers: { 'x-api-role': 'admin' },
    expectStatus: 200,
    expectFields: ['status', 'details']
  },
  {
    name: 'Unauthorized Debug Access',
    method: 'GET',
    path: '/debug/env',
    headers: {},
    expectStatus: 403,
    expectFields: ['error', 'code']
  },
  {
    name: 'Ops Debug Access (should fail)',
    method: 'GET',
    path: '/debug/env',
    headers: { 'x-api-role': 'ops' },
    expectStatus: 403,
    expectFields: ['error', 'code']
  },
  {
    name: 'Invalid Role',
    method: 'GET',
    path: '/debug/env',
    headers: { 'x-api-role': 'invalid' },
    expectStatus: 403,
    expectFields: ['error', 'code']
  }
];

// Helper function to make HTTP requests
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({ status: res.statusCode, body, headers: res.headers });
        } catch (error) {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🧪 Running Enhanced Security & Observability Tests\\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: test.path,
        method: test.method,
        headers: test.headers
      };
      
      const result = await makeRequest(options);
      
      // Check status code
      if (result.status !== test.expectStatus) {
        throw new Error(`Expected status ${test.expectStatus}, got ${result.status}`);
      }
      
      // Check expected fields
      if (typeof result.body === 'object') {
        for (const field of test.expectFields) {
          if (!(field in result.body)) {
            throw new Error(`Expected field '${field}' not found in response`);
          }
        }
      }
      
      console.log(`✅ ${test.name}`);
      passed++;
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }
  
  // Test JWT authentication if admin endpoint is available
  try {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/debug/env',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    };
    
    const result = await makeRequest(options);
    if (result.status === 200 && result.body.server) {
      console.log('✅ JWT Authentication');
      passed++;
    } else {
      throw new Error(`JWT authentication failed - status: ${result.status}`);
    }
  } catch (error) {
    console.log(`❌ JWT Authentication: ${error.message}`);
    failed++;
  }
  
  console.log(`\\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! The enhanced security features are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the server configuration.');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on localhost:5000');
    console.log('Please start the server first with:');
    console.log('ENABLE_DEBUG=true JWT_SECRET=test-secret-123 node server.js');
    process.exit(1);
  }
  
  await runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runTests, checkServer };