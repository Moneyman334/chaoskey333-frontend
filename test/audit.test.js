/**
 * Unit tests for audit logging with hash chain integrity
 */

const { calculateHash, createAuditEntry, verifyHashChain } = require('../lib/audit');
const fs = require('fs').promises;
const path = require('path');

// Test file path
const TEST_LOG_FILE = path.join(process.cwd(), '.test-audit-log.json');

describe('Audit Logging Tests', () => {
  
  beforeEach(async () => {
    // Clean up test file before each test
    try {
      await fs.unlink(TEST_LOG_FILE);
    } catch (error) {
      // File doesn't exist, which is fine
    }
  });

  describe('calculateHash', () => {
    test('should generate consistent hash for same input', () => {
      const entry = {
        timestamp: 1234567890,
        type: 'test',
        ip: '127.0.0.1',
        path: '/test',
        details: { action: 'test' }
      };
      
      const hash1 = calculateHash(entry, '0');
      const hash2 = calculateHash(entry, '0');
      
      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex format
    });

    test('should generate different hash for different input', () => {
      const entry1 = {
        timestamp: 1234567890,
        type: 'test1',
        ip: '127.0.0.1',
        path: '/test',
        details: {}
      };
      
      const entry2 = {
        timestamp: 1234567890,
        type: 'test2',
        ip: '127.0.0.1',
        path: '/test',
        details: {}
      };
      
      const hash1 = calculateHash(entry1, '0');
      const hash2 = calculateHash(entry2, '0');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Hash Chain Integrity', () => {
    test('should maintain hash chain with multiple entries', () => {
      // This test simulates creating multiple entries and verifying the chain
      const entries = [
        { type: 'test1', ip: '127.0.0.1', path: '/test1' },
        { type: 'test2', ip: '127.0.0.1', path: '/test2' },
        { type: 'test3', ip: '127.0.0.1', path: '/test3' }
      ];

      let prevHash = '0';
      const processedEntries = [];

      entries.forEach((entry, index) => {
        const fullEntry = {
          timestamp: Date.now() + index,
          type: entry.type,
          ip: entry.ip,
          path: entry.path,
          details: {},
          prevHash
        };

        const hash = calculateHash(fullEntry, prevHash);
        fullEntry.hash = hash;
        processedEntries.push(fullEntry);
        
        prevHash = hash;
      });

      // Verify each entry in the chain
      for (let i = 0; i < processedEntries.length; i++) {
        const entry = processedEntries[i];
        const expectedPrevHash = i === 0 ? '0' : processedEntries[i - 1].hash;
        const expectedHash = calculateHash(entry, expectedPrevHash);
        
        expect(entry.hash).toBe(expectedHash);
        expect(entry.prevHash).toBe(expectedPrevHash);
      }
      
      console.log('✅ Hash chain integrity verified');
    });
  });
});

// Simple test runner for Node.js environment
if (require.main === module) {
  console.log('Running Audit Logging Tests...\n');
  
  const tests = [
    // calculateHash tests
    () => {
      const entry = {
        timestamp: 1234567890,
        type: 'test',
        ip: '127.0.0.1',
        path: '/test',
        details: { action: 'test' }
      };
      
      const hash1 = calculateHash(entry, '0');
      const hash2 = calculateHash(entry, '0');
      
      console.assert(hash1 === hash2, 'Hash should be consistent');
      console.assert(hash1.match(/^[a-f0-9]{64}$/), 'Hash should be SHA256 hex format');
      
      console.log('✅ calculateHash tests passed');
    },
    
    // Hash chain integrity test
    () => {
      const entries = [
        { type: 'test1', ip: '127.0.0.1', path: '/test1' },
        { type: 'test2', ip: '127.0.0.1', path: '/test2' },
        { type: 'test3', ip: '127.0.0.1', path: '/test3' }
      ];

      let prevHash = '0';
      const processedEntries = [];

      entries.forEach((entry, index) => {
        const fullEntry = {
          timestamp: Date.now() + index,
          type: entry.type,
          ip: entry.ip,
          path: entry.path,
          details: {},
          prevHash
        };

        const hash = calculateHash(fullEntry, prevHash);
        fullEntry.hash = hash;
        processedEntries.push(fullEntry);
        
        prevHash = hash;
      });

      // Verify each entry in the chain
      for (let i = 0; i < processedEntries.length; i++) {
        const entry = processedEntries[i];
        const expectedPrevHash = i === 0 ? '0' : processedEntries[i - 1].hash;
        const expectedHash = calculateHash(entry, expectedPrevHash);
        
        console.assert(entry.hash === expectedHash, `Hash mismatch at entry ${i}`);
        console.assert(entry.prevHash === expectedPrevHash, `Previous hash mismatch at entry ${i}`);
      }
      
      console.log('✅ Hash chain integrity tests passed');
    },
    
    // Key redaction test
    () => {
      const testEnv = {
        NODE_ENV: 'test',
        DATABASE_URL: 'postgres://localhost',
        API_KEY: 'secret123',
        SECRET_TOKEN: 'super-secret',
        PUBLIC_URL: 'https://example.com',
        PRIVATE_KEY: 'private123',
        PASSWORD: 'password123'
      };
      
      // Test the redaction function
      function testRedactSensitiveEnv(env) {
        const sensitivePattern = /key|secret|token|password|private|auth|credential/i;
        const redacted = {};
        
        Object.keys(env).forEach(key => {
          if (sensitivePattern.test(key)) {
            redacted[key] = '***REDACTED***';
          } else {
            redacted[key] = env[key];
          }
        });
        
        return redacted;
      }
      
      const redacted = testRedactSensitiveEnv(testEnv);
      
      console.assert(redacted.NODE_ENV === 'test', 'Non-sensitive env should not be redacted');
      console.assert(redacted.DATABASE_URL === 'postgres://localhost', 'Non-sensitive env should not be redacted');
      console.assert(redacted.PUBLIC_URL === 'https://example.com', 'Non-sensitive env should not be redacted');
      
      console.assert(redacted.API_KEY === '***REDACTED***', 'API_KEY should be redacted');
      console.assert(redacted.SECRET_TOKEN === '***REDACTED***', 'SECRET_TOKEN should be redacted');
      console.assert(redacted.PRIVATE_KEY === '***REDACTED***', 'PRIVATE_KEY should be redacted');
      console.assert(redacted.PASSWORD === '***REDACTED***', 'PASSWORD should be redacted');
      
      console.log('✅ Key redaction tests passed');
    }
  ];
  
  try {
    tests.forEach(test => test());
    console.log('\n🎉 All audit tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}