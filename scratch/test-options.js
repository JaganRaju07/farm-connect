const https = require('https');

const req = https.request({
  hostname: 'farm-connect-backend-n7st.onrender.com',
  path: '/api/v1/auth/send-otp',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://farm-connect-eta-ten.vercel.app',
    'Access-Control-Request-Method': 'POST'
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
