const axios = require('axios');
const pool = require('./src/config/db');

async function testOTPFlow() {
  const phone = '9999999999';
  const name = 'Test Consumer';
  
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
        // 1. Send OTP
        const sendRes = await axios.post('http://localhost:8080/api/v1/auth/send-otp', {
          phone,
          userType: 'consumer',
          action: 'register'
        });
        console.log('Send OTP response:', sendRes.data);
        
        // 2. Fetch OTP via Demo Endpoint
        // First without secret (should fail)
        try {
          await axios.get(`http://localhost:8080/api/v1/auth/demo-otp/${phone}`);
          console.log('FAIL: Demo endpoint allowed access without secret');
        } catch (err) {
          console.log('PASS: Demo endpoint correctly rejected access without secret. Status:', err.response.status);
        }
        
        // Now with secret
        const demoRes = await axios.get(`http://localhost:8080/api/v1/auth/demo-otp/${phone}`, {
          headers: {
            'x-demo-secret': process.env.OTP_DEMO_SECRET
          }
        });
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
        console.log('Verify OTP response:', verifyRes.data.success);
        
      } catch (err) {
        console.error('Test error:', err.response ? err.response.data : err.message);
      } finally {
        server.close();
        pool.end();
        process.exit(0);
      }
    });
    
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Load env
require('dotenv').config({ path: './.env' });
testOTPFlow();
