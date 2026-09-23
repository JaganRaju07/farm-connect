const axios = require('axios');
const pool = require('./src/config/db');

async function testOTPFlow() {
  const phone = '9999999999';
  const name = 'Test Consumer';
  
  try {
    console.log('Sending OTP to', phone);
    
    // In order to avoid starting the server via http request, we can just call the service functions or controllers directly.
    // However, it's a bit complicated because the controller expects express req/res.
    
    // Instead of doing it directly, let's just write a test script that sets up env, calls sendOTP
    // and verifyOTP in authController.
    
  } catch (err) {
    console.error(err);
  }
}
testOTPFlow();
