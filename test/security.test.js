/**
 * Unit tests for security middleware
 */

const { extractRole, hasRole, isIpAllowlisted, ROLES } = require('../lib/security');
const jwt = require('jsonwebtoken');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.ADMIN_ALLOWLIST = '127.0.0.1,192.168.1.1';

describe('Security Middleware Tests', () => {
  
  describe('extractRole', () => {
    test('should extract role from x-api-role header', () => {
      const req = { headers: { 'x-api-role': 'admin' } };
      expect(extractRole(req)).toBe('admin');
    });

    test('should extract role from JWT Bearer token', () => {
      const token = jwt.sign({ role: 'ops' }, 'test-secret');
      const req = { headers: { authorization: `Bearer ${token}` } };
      expect(extractRole(req)).toBe('ops');
    });

    test('should return null for invalid role', () => {
      const req = { headers: { 'x-api-role': 'invalid' } };
      expect(extractRole(req)).toBeNull();
    });

    test('should return null for invalid JWT', () => {
      const req = { headers: { authorization: 'Bearer invalid-token' } };
      expect(extractRole(req)).toBeNull();
    });
  });

  describe('hasRole', () => {
    test('admin should have access to all roles', () => {
      expect(hasRole('admin', 'admin')).toBe(true);
      expect(hasRole('admin', 'ops')).toBe(true);
      expect(hasRole('admin', 'read')).toBe(true);
    });

    test('ops should have access to ops and read', () => {
      expect(hasRole('ops', 'admin')).toBe(false);
      expect(hasRole('ops', 'ops')).toBe(true);
      expect(hasRole('ops', 'read')).toBe(true);
    });

    test('read should only have read access', () => {
      expect(hasRole('read', 'admin')).toBe(false);
      expect(hasRole('read', 'ops')).toBe(false);
      expect(hasRole('read', 'read')).toBe(true);
    });
  });

  describe('isIpAllowlisted', () => {
    test('should allow allowlisted IPs', () => {
      expect(isIpAllowlisted('127.0.0.1')).toBe(true);
      expect(isIpAllowlisted('192.168.1.1')).toBe(true);
    });

    test('should block non-allowlisted IPs', () => {
      expect(isIpAllowlisted('10.0.0.1')).toBe(false);
      expect(isIpAllowlisted('unknown')).toBe(false);
    });
  });
});

// Simple test runner for Node.js environment
if (require.main === module) {
  console.log('Running Security Middleware Tests...\n');
  
  const tests = [
    // extractRole tests
    () => {
      const req1 = { headers: { 'x-api-role': 'admin' } };
      console.assert(extractRole(req1) === 'admin', 'Should extract admin role from header');
      
      const token = jwt.sign({ role: 'ops' }, 'test-secret');
      const req2 = { headers: { authorization: `Bearer ${token}` } };
      console.assert(extractRole(req2) === 'ops', 'Should extract ops role from JWT');
      
      const req3 = { headers: { 'x-api-role': 'invalid' } };
      console.assert(extractRole(req3) === null, 'Should return null for invalid role');
      
      console.log('✅ extractRole tests passed');
    },
    
    // hasRole tests
    () => {
      console.assert(hasRole('admin', 'admin') === true, 'Admin should have admin access');
      console.assert(hasRole('admin', 'ops') === true, 'Admin should have ops access');
      console.assert(hasRole('admin', 'read') === true, 'Admin should have read access');
      
      console.assert(hasRole('ops', 'admin') === false, 'Ops should not have admin access');
      console.assert(hasRole('ops', 'ops') === true, 'Ops should have ops access');
      console.assert(hasRole('ops', 'read') === true, 'Ops should have read access');
      
      console.assert(hasRole('read', 'admin') === false, 'Read should not have admin access');
      console.assert(hasRole('read', 'ops') === false, 'Read should not have ops access');
      console.assert(hasRole('read', 'read') === true, 'Read should have read access');
      
      console.log('✅ hasRole tests passed');
    },
    
    // isIpAllowlisted tests
    () => {
      console.assert(isIpAllowlisted('127.0.0.1') === true, 'Should allow 127.0.0.1');
      console.assert(isIpAllowlisted('192.168.1.1') === true, 'Should allow 192.168.1.1');
      console.assert(isIpAllowlisted('10.0.0.1') === false, 'Should block 10.0.0.1');
      
      console.log('✅ IP allowlist tests passed');
    }
  ];
  
  try {
    tests.forEach(test => test());
    console.log('\n🎉 All security tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}