const https = require('https');

const req = https.request({
  hostname: 'farm-connect-backend-n7st.onrender.com',
  path: '/api/v1/auth/send-otp',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://farm-connect-eta-ten.vercel.app',
    'Access-Control-Request-Method': 'POST',
    'User-Agent': 'test'
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
  res.on('data', () => {});
  res.on('end', () => console.log('END'));
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
