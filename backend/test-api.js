const axios = require('axios');

axios.get('http://localhost:4000/api/v1/products')
  .then(res => console.log('SUCCESS:', res.data))
  .catch(err => {
    console.error('ERROR STATUS:', err.response?.status);
    console.error('ERROR DATA:', err.response?.data);
  });
