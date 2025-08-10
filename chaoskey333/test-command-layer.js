#!/usr/bin/env node

/**
 * Test script for Master Command Layer
 * Tests command execution, state updates, and authentication
 */

const crypto = require('crypto');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const HMAC_SECRET = process.env.MASTER_HMAC_SECRET || 'test_secret_key';

// Test configuration
const OPERATOR_KEYS = {
  'owner_key_123': 'owner',
  'operator_key_456': 'operator', 
  'bot_key_789': 'bot'
};

function signCommand(command) {
  const payload = JSON.stringify(command);
  const hmac = crypto.createHmac('sha256', HMAC_SECRET);
  hmac.update(payload);
  return hmac.digest('hex');
}

function createTestCommand(type, actor, payload = null) {
  const command = {
    type,
    payload,
    idempotencyKey: `test_${Date.now()}_${Math.random()}`,
    timestamp: Date.now(),
    actor
  };
  
  command.signature = signCommand(command);
  return command;
}

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  console.log(`→ ${options.method || 'GET'} ${path}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    console.log(`← ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.log('  Error:', data.error);
    } else {
      console.log('  Success:', data.message || 'OK');
    }
    
    return { status: response.status, data };
  } catch (error) {
    console.log(`← Error: ${error.message}`);
    return { status: 0, data: { error: error.message } };
  }
}

async function testAuthenticationFailure() {
  console.log('\n🔒 Testing Authentication Failure');
  
  // Test with invalid signature
  const command = createTestCommand('REPLAY.START', 'owner_key_123');
  command.signature = 'invalid_signature';
  
  const result = await makeRequest('/api/command', {
    method: 'POST',
    body: JSON.stringify(command)
  });
  
  console.log(`   Expected 401, got ${result.status}: ${result.status === 401 ? '✅ PASS' : '❌ FAIL'}`);
}

async function testIdempotencyProtection() {
  console.log('\n🔄 Testing Idempotency Protection');
  
  const command = createTestCommand('BROADCAST.PULSE', 'owner_key_123');
  
  // First request
  const result1 = await makeRequest('/api/command', {
    method: 'POST',
    body: JSON.stringify(command)
  });
  
  // Second request with same idempotency key
  const result2 = await makeRequest('/api/command', {
    method: 'POST', 
    body: JSON.stringify(command)
  });
  
  console.log(`   First request: ${result1.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Second request (duplicate): ${result2.status === 409 ? '✅ PASS' : '❌ FAIL'}`);
}

async function testStateUpdates() {
  console.log('\n📊 Testing State Updates');
  
  // Get initial state
  const initialState = await makeRequest('/api/state');
  console.log(`   Initial state retrieved: ${initialState.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  
  // Execute command to change state
  const command = createTestCommand('HUD.DECODE.ENABLE', 'operator_key_456');
  await makeRequest('/api/command', {
    method: 'POST',
    body: JSON.stringify(command)
  });
  
  // Check state update
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  const updatedState = await makeRequest('/api/state');
  
  const stateChanged = updatedState.data.state?.hud?.decodeEnabled === true;
  console.log(`   State updated correctly: ${stateChanged ? '✅ PASS' : '❌ FAIL'}`);
}

async function testEventLogging() {
  console.log('\n📝 Testing Event Logging');
  
  // Get initial event count
  const initialEvents = await makeRequest('/api/events?limit=1');
  
  // Execute a command
  const command = createTestCommand('MINT.GATE.OPEN', 'owner_key_123');
  const commandResult = await makeRequest('/api/command', {
    method: 'POST',
    body: JSON.stringify(command)
  });
  
  // Check if event was logged
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  const newEvents = await makeRequest('/api/events?limit=5');
  
  const hasNewEvent = newEvents.data.events?.some(event => 
    event.type === 'COMMAND.MINT.GATE.OPEN' && event.actor === 'owner_key_123'
  );
  
  console.log(`   Event logged: ${hasNewEvent ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Event ID returned: ${commandResult.data.eventId ? '✅ PASS' : '❌ FAIL'}`);
}

async function testRoleBasedAccess() {
  console.log('\n👥 Testing Role-Based Access');
  
  // Test operator trying to execute owner-only command
  const restrictedCommand = createTestCommand('RELIC.EVOLVE.TRIGGER', 'operator_key_456');
  const restrictedResult = await makeRequest('/api/command', {
    method: 'POST',
    body: JSON.stringify(restrictedCommand)
  });
  
  console.log(`   Operator blocked from owner command: ${restrictedResult.status === 403 ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test bot executing allowed command
  const allowedCommand = createTestCommand('BROADCAST.PULSE', 'bot_key_789');
  const allowedResult = await makeRequest('/api/command', {
    method: 'POST',
    body: JSON.stringify(allowedCommand)
  });
  
  console.log(`   Bot allowed command: ${allowedResult.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
}

async function runAllTests() {
  console.log('🧪 Master Command Layer Test Suite');
  console.log('=' .repeat(50));
  
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`HMAC Secret: ${HMAC_SECRET}`);
  
  // Set environment variables for the test
  process.env.MASTER_HMAC_SECRET = HMAC_SECRET;
  process.env.OPERATOR_KEYS = Object.entries(OPERATOR_KEYS)
    .map(([key, role]) => `${key}:${role}`)
    .join(',');
  process.env.ASCENSION_DRY_RUN = 'false';
  process.env.ASCENSION_PAUSED = 'false';
  
  try {
    await testAuthenticationFailure();
    await testIdempotencyProtection();
    await testStateUpdates(); 
    await testEventLogging();
    await testRoleBasedAccess();
    
    console.log('\n🎉 Test Suite Complete');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('\n💥 Test Suite Failed');
    console.error(error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  createTestCommand,
  signCommand,
  OPERATOR_KEYS
};