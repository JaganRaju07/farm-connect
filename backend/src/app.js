require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');
const sanitizeInputs = require('./middleware/sanitizer');

const app = express();

// Security Headers
app.use(helmet());

// HTTP Request Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate Limiting (Global)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);


const getAllowedOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS;
  if (!origins) return ['http://localhost:3000', 'http://localhost:5173', 'https://farm-connect-eta-ten.vercel.app'];
  return origins.split(',').map(o => o.trim());
};

app.use(cors({
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-demo-secret']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeInputs);

const healthController = require('./controllers/health.controller');
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

// --- ROUTES ---
const authRoutes = require('./routes/auth.routes');
app.use('/api/v1/auth', authRoutes);

const productsRouter = require('./routes/products');
app.use('/api/v1/products', productsRouter); // fixed to /api/v1

const ordersRouter = require('./routes/orders');
app.use('/api/v1/orders', ordersRouter); // fixed to /api/v1

const reviewRoutes = require('./routes/review.routes');
app.use('/api/v1/reviews', reviewRoutes);

const wishlistRoutes = require('./routes/wishlist.routes');
app.use('/api/v1/wishlist', wishlistRoutes);

const farmerRoutes = require('./routes/farmer.routes');
app.use('/api/v1/farmers', farmerRoutes);

const adminRoutes = require('./routes/admin.routes');
app.use('/api/v1/admin', adminRoutes);

const notificationRoutes = require('./routes/notification.routes');
app.use('/api/v1/notifications', notificationRoutes);

const uploadRoutes = require('./routes/upload.routes');
app.use('/api/v1/upload', uploadRoutes);

// --- 404 & Global Error Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} does not exist`
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  // Remove synchronous fs.writeFileSync to avoid blocking the event loop in production.
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (err.message || 'Internal Server Error')
    }
  });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await testConnection();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Farm Connect API running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
module.exports = app;