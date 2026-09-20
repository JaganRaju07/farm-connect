const https = require('https');

const data = JSON.stringify({
  phone: '9754213522',
  userType: 'farmer',
  action: 'register'
});

const options = {
  hostname: 'farm-connect-backend-n7st.onrender.com',
  port: 443,
  path: '/api/v1/auth/send-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
