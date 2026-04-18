require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Farm Connect API running' });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

startServer();
module.exports = app;