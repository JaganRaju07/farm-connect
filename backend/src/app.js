require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json()); // This is the magic line that reads Postman JSON

const healthController = require('./controllers/health.controller');
// Health check — no auth, no rate limiting (Railway must reach this)
app.get('/health', healthController.healthCheck);
app.get('/', (req, res) => res.json({
 name: 'Farm Connect API',
 version: '1.0.0',
 status: 'running',
 docs: '/health'
}));

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

// New Routes
const reviewRoutes = require('./routes/review.routes');
app.use('/api/v1/reviews', reviewRoutes);

const wishlistRoutes = require('./routes/wishlist.routes');
app.use('/api/v1/wishlist', wishlistRoutes);

const farmerRoutes = require('./routes/farmer.routes');
app.use('/api/v1/farmers', farmerRoutes);

const adminRoutes = require('./routes/admin.routes');
app.use('/api/v1/admin', adminRoutes);
startServer();
module.exports = app;