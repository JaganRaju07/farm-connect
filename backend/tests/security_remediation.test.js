/**
 * Farm Connect Security Remediation Test Suite
 *
 * Runs focused verification of:
 * 1. Root & modular JWT authentication & role authorization middleware
 * 2. OTP attempt accumulation, non-reset on resend, and 15-minute lockout enforcement
 * 3. Review gating business validation error assertions
 *
 * Run with: node backend/tests/security_remediation.test.js
 */

const assert = require('assert');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test_security_audit_secret_2026';
process.env.JWT_EXPIRES_IN = '1h';

// Helper for mocking Express req/res/next
function createMockReqRes(options = {}) {
  const req = {
    headers: options.headers || {},
    body: options.body || {},
    params: options.params || {},
    user: options.user || null
  };
  let statusCode = 200;
  let responseData = null;
  let nextCalled = false;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    }
  };

  const next = () => {
    nextCalled = true;
  };

  return {
    req,
    res,
    next,
    getStatus: () => statusCode,
    getData: () => responseData,
    wasNextCalled: () => nextCalled
  };
}

async function runSecurityRemediationTests() {
  console.log('Starting Farm Connect Security Remediation Suite...\n');
  let passed = 0;

  // ─────────────────────────────────────────────────────────────
  // 1. Root Auth Middleware (src/middleware/auth.js)
  // ─────────────────────────────────────────────────────────────
  const rootAuth = require('../../src/middleware/auth');

  // Test 1.1: Missing token returns 401
  {
    const { req, res, next, getStatus, getData, wasNextCalled } = createMockReqRes();
    rootAuth(req, res, next);
    assert.strictEqual(getStatus(), 401, 'Missing token should return 401');
    assert.strictEqual(getData().error.code, 'TOKEN_REQUIRED');
    assert.strictEqual(wasNextCalled(), false);
    console.log('✓ Test 1.1 PASS: Root auth middleware rejects requests missing Authorization header (401)');
    passed++;
  }

  // Test 1.2: Invalid token returns 401
  {
    const { req, res, next, getStatus, getData, wasNextCalled } = createMockReqRes({
      headers: { authorization: 'Bearer invalid_signature_token' }
    });
    rootAuth(req, res, next);
    assert.strictEqual(getStatus(), 401, 'Invalid token should return 401');
    assert.strictEqual(getData().error.code, 'INVALID_TOKEN');
    assert.strictEqual(wasNextCalled(), false);
    console.log('✓ Test 1.2 PASS: Root auth middleware rejects invalid tokens (401)');
    passed++;
  }

  // Test 1.3: Valid token populates req.user and calls next()
  {
    const validToken = jwt.sign(
      { userId: 42, role: 'farmer', name: 'Ravi' },
      process.env.JWT_SECRET
    );
    const { req, res, next, getStatus, wasNextCalled } = createMockReqRes({
      headers: { authorization: `Bearer ${validToken}` }
    });
    rootAuth(req, res, next);
    assert.strictEqual(wasNextCalled(), true, 'Valid token must call next()');
    assert.strictEqual(req.user.userId, 42);
    assert.strictEqual(req.user.role, 'farmer');
    console.log('✓ Test 1.3 PASS: Root auth middleware accepts valid JWT and sets req.user');
    passed++;
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Role Authorization Middleware (src & backend)
  // ─────────────────────────────────────────────────────────────
  const rootRoleAuth = require('../../src/middleware/roleAuth');
  const modRoleAuth = require('../src/middleware/roleAuth');

  // Test 2.1: Rejects unauthenticated request (401)
  {
    const { req, res, next, getStatus, getData } = createMockReqRes();
    rootRoleAuth(['admin'])(req, res, next);
    assert.strictEqual(getStatus(), 401);
    assert.strictEqual(getData().error.code, 'UNAUTHENTICATED');
    console.log('✓ Test 2.1 PASS: Root roleAuth rejects unauthenticated requests (401)');
    passed++;
  }

  // Test 2.2: Rejects unauthorized role (403)
  {
    const { req, res, next, getStatus, getData, wasNextCalled } = createMockReqRes({
      user: { userId: 1, role: 'consumer' }
    });
    rootRoleAuth(['farmer', 'admin'])(req, res, next);
    assert.strictEqual(getStatus(), 403);
    assert.strictEqual(getData().error.code, 'INSUFFICIENT_PERMISSIONS');
    assert.strictEqual(wasNextCalled(), false);
    console.log('✓ Test 2.2 PASS: Root roleAuth rejects insufficient role (403)');
    passed++;
  }

  // Test 2.3: Supports adminRole claim in modular backend
  {
    const { req, res, next, wasNextCalled } = createMockReqRes({
      user: { userId: 1, role: 'admin', adminRole: 'super_admin' }
    });
    modRoleAuth(['super_admin'])(req, res, next);
    assert.strictEqual(wasNextCalled(), true, 'Should match on adminRole');
    console.log('✓ Test 2.3 PASS: Modular roleAuth checks both role and adminRole correctly');
    passed++;
  }

  // ─────────────────────────────────────────────────────────────
  // 3. OTP Lockout & Attempt Persistence (src/controllers/authController)
  // ─────────────────────────────────────────────────────────────
  const authController = require('../../src/controllers/authController');
  const pool = require('../../src/config/db');

  const testPhone = '9888888888';
  authController._otpAttempts.delete(testPhone); // Ensure clean state

  // Mock pool.query for OTP unit tests
  const originalQuery = pool.query;
  const mockOtpCode = '654321';
  const expiresFuture = new Date(Date.now() + 5 * 60 * 1000);

  pool.query = async (sql, params) => {
    // Return existing OTP in otp_store
    if (sql.includes('FROM otp_store')) {
      return {
        rows: [{
          phone: testPhone,
          otp_code: mockOtpCode,
          expires_at: expiresFuture,
          user_type: 'consumer',
          action: 'login'
        }]
      };
    }
    // Farmers/Consumers lookup
    if (sql.includes('SELECT id FROM consumers') || sql.includes('SELECT id, phone, name FROM consumers')) {
      return { rows: [{ id: 1, phone: testPhone, name: 'Test User' }] };
    }
    // Updates/Deletes
    return { rows: [] };
  };

  try {
    // Test 3.1: Failed OTP attempt increments counter
    {
      const { req, res, next, getStatus, getData } = createMockReqRes({
        body: { phone: testPhone, otp: '111111', userType: 'consumer' }
      });
      await authController.verifyOTP(req, res, next);
      assert.strictEqual(getStatus(), 400);
      assert.ok(getData().message.includes('4 attempt(s) remaining'));
      assert.strictEqual(authController._otpAttempts.get(testPhone).attempts, 1);
      console.log('✓ Test 3.1 PASS: Failed OTP verification increments attempt counter');
      passed++;
    }

    // Test 3.2: Re-requesting OTP does NOT reset attempt counter
    {
      const { req, res, next, getStatus } = createMockReqRes({
        body: { phone: testPhone, userType: 'consumer', action: 'login' }
      });
      await authController.sendOTP(req, res, next);
      assert.strictEqual(getStatus(), 200);
      const record = authController._otpAttempts.get(testPhone);
      assert.ok(record, 'Attempt record must be retained');
      assert.strictEqual(record.attempts, 1, 'Attempts must NOT reset on sendOTP');
      console.log('✓ Test 3.2 PASS: Requesting new OTP preserves failed attempts without reset');
      passed++;
    }

    // Test 3.3: Reaching MAX_OTP_ATTEMPTS locks account for 15 minutes (429)
    {
      for (let i = 2; i <= 5; i++) {
        const { req, res, next, getStatus } = createMockReqRes({
          body: { phone: testPhone, otp: '000000', userType: 'consumer' }
        });
        await authController.verifyOTP(req, res, next);
        if (i === 5) {
          assert.strictEqual(getStatus(), 429, '5th failed attempt must trigger 429 lockout');
        }
      }
      const record = authController._otpAttempts.get(testPhone);
      assert.strictEqual(record.attempts, 5);
      assert.ok(record.lockoutUntil > Date.now(), 'Lockout timestamp must be in future');
      console.log('✓ Test 3.3 PASS: 5 failed attempts locks phone for 15 minutes (429)');
      passed++;
    }

    // Test 3.4: Re-requesting OTP during active lockout is rejected with 429
    {
      const { req, res, next, getStatus, getData } = createMockReqRes({
        body: { phone: testPhone, userType: 'consumer', action: 'login' }
      });
      await authController.sendOTP(req, res, next);
      assert.strictEqual(getStatus(), 429, 'sendOTP must reject during lockout with 429');
      assert.ok(getData().message.includes('Too many failed attempts'));
      console.log('✓ Test 3.4 PASS: sendOTP rejected with 429 during active lockout');
      passed++;
    }

    // Test 3.5: Successful verification clears attempt counter
    {
      // Manually reset lockout for clean verification test
      authController._otpAttempts.delete(testPhone);
      const { req, res, next, getStatus, getData } = createMockReqRes({
        body: { phone: testPhone, otp: mockOtpCode, userType: 'consumer' }
      });
      await authController.verifyOTP(req, res, next);
      assert.strictEqual(getStatus(), 200);
      assert.ok(getData().data.token, 'Must return JWT token');
      assert.strictEqual(authController._otpAttempts.get(testPhone), undefined, 'Counter must be cleared on success');
      console.log('✓ Test 3.5 PASS: Successful OTP verification clears attempt counter');
      passed++;
    }
  } finally {
    pool.query = originalQuery;
    authController._otpAttempts.delete(testPhone);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Review Gating Validation Specificity
  // ─────────────────────────────────────────────────────────────
  const reviewService = require('../src/services/review.service');
  const db = require('../src/config/database');
  const originalExecuteTx = db.executeTransaction;

  try {
    // Test 4.1: Business rejection throws REVIEW_NOT_ELIGIBLE (403)
    {
      // Mock db.executeTransaction returning a mock client with 0 orders
      db.executeTransaction = async (callback) => {
        const mockClient = {
          query: async (sql) => {
            if (sql.includes('FROM orders')) {
              return { rows: [] }; // Order not found or not delivered
            }
            return { rows: [] };
          }
        };
        return await callback(mockClient);
      };

      let caughtCode = null;
      let caughtStatus = null;
      try {
        await reviewService.createReview(1, {
          productId: 1,
          orderId: 999,
          rating: 5,
          reviewText: 'Great product'
        });
      } catch (err) {
        caughtCode = err.code;
        caughtStatus = err.statusCode;
      }

      assert.strictEqual(caughtCode, 'REVIEW_NOT_ELIGIBLE', 'Code must be REVIEW_NOT_ELIGIBLE');
      assert.strictEqual(caughtStatus, 403, 'Status must be 403');
      console.log('✓ Test 4.1 PASS: createReview specifically throws REVIEW_NOT_ELIGIBLE (403) for non-delivered order');
      passed++;
    }

    // Test 4.2: Network/connectivity error is NOT masked as validation pass
    {
      db.executeTransaction = async () => {
        const netErr = new Error('getaddrinfo ENOTFOUND tenant.supabase.co');
        netErr.code = 'ENOTFOUND';
        throw netErr;
      };

      let caught = false;
      try {
        await reviewService.createReview(1, { productId: 1, orderId: 999, rating: 5 });
      } catch (err) {
        // Assert that connectivity errors are distinct from business validation errors
        assert.notStrictEqual(err.code, 'REVIEW_NOT_ELIGIBLE');
        assert.strictEqual(err.code, 'ENOTFOUND');
        caught = true;
      }
      assert.ok(caught, 'Network error must be propagated and not masked');
      console.log('✓ Test 4.2 PASS: Network/connectivity errors are propagated and cannot trigger false validation pass');
      passed++;
    }
  } finally {
    db.executeTransaction = originalExecuteTx;
  }

  console.log(`\n=============================================================`);
  console.log(`  Security Remediation Suite Complete: ${passed}/${passed} passed!`);
  console.log(`=============================================================\n`);

  if (db.pool && db.pool.end) {
    await db.pool.end();
  }
  process.exit(0);
}

runSecurityRemediationTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
