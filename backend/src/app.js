require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json()); // This is the magic line that reads Postman JSON

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

// --- ROUTES ---
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

const ordersRouter = require('./routes/orders');
app.use('/api/orders', ordersRouter);
// --------------

startServer();
module.exports = app;