const axios = require('axios');
const assert = require('assert');
const pool = require('./src/config/db');

async function testOTPFlow() {
  const phone = '9999999999';
  const name = 'Test Consumer';
  let testFailed = false;

  try {
    // We will start the backend server programmatically to test the route
    const express = require('express');
    const app = express();
    app.use(express.json());

    // Mount routes
    const authRoutes = require('./backend/src/routes/auth.routes');
    app.use('/api/v1/auth', authRoutes);

    // Start server
    const server = app.listen(8080, async () => {
      console.log('Test server started on 8080');

      try {
        // Ensure clean state for test phone number
        await pool.query('DELETE FROM otp_store WHERE phone=$1', [phone]);
        await pool.query('DELETE FROM consumers WHERE phone=$1', [phone]);

        // 1. Send OTP
        const sendRes = await axios.post('http://localhost:8080/api/v1/auth/send-otp', {
          phone,
          userType: 'consumer',
          action: 'register'
        });
        assert.ok(sendRes.data && sendRes.data.success === true, 'send-otp should return success: true');
        console.log('Send OTP response:', sendRes.data);

        // 2. Fetch OTP via Demo Endpoint
        // First without secret (should fail)
        try {
          await axios.get(`http://localhost:8080/api/v1/auth/demo-otp/${phone}`);
          throw new Error('FAIL: Demo endpoint allowed access without secret');
        } catch (err) {
          if (err.message.startsWith('FAIL:')) throw err;
          assert.strictEqual(err.response ? err.response.status : null, 401, 'Should return 401 without secret');
          console.log('PASS: Demo endpoint correctly rejected access without secret. Status:', err.response.status);
        }

        // Now with secret
        const demoRes = await axios.get(`http://localhost:8080/api/v1/auth/demo-otp/${phone}`, {
          headers: {
            'x-demo-secret': process.env.OTP_DEMO_SECRET
          }
        });
        assert.ok(demoRes.data && demoRes.data.data && demoRes.data.data.otp_code, 'Demo OTP retrieval must return otp_code');
        console.log('Demo OTP retrieved:', demoRes.data.data.otp_code);

        // 3. Verify OTP
        const verifyRes = await axios.post('http://localhost:8080/api/v1/auth/verify-otp', {
          phone,
          otp: demoRes.data.data.otp_code,
          userType: 'consumer',
          name,
          latitude: 0,
          longitude: 0,
          city: 'Test City',
          address: 'Test Address'
        });
        assert.ok(verifyRes.data && verifyRes.data.success === true, 'verify-otp should return success: true');
        console.log('Verify OTP response:', verifyRes.data.success);

      } catch (err) {
        testFailed = true;
        console.error('Test error:', err.response ? err.response.data : err.message);
      } finally {
        server.close();
        try {
          await pool.end();
        } catch (closeErr) {
          console.error('Error closing pool:', closeErr.message);
        }
        process.exit(testFailed ? 1 : 0);
      }
    });

  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

// Load env reliably from repository root
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
testOTPFlow();
