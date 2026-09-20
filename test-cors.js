const https = require('https');

const options = {
  hostname: 'farm-connect-backend-n7st.onrender.com',
  port: 443,
  path: '/api/v1/auth/send-otp',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://farm-connect-eta-ten.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
});
req.on('error', console.error);
req.end();
