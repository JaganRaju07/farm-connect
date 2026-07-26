// backend/src/controllers/health.controller.js
/**
* GET /health
* Production health check endpoint
*
* STUDY NOTE — Why Health Checks Matter:
* Railway (and any deployment platform) pings a health endpoint to determine
* if your service is running correctly. If this endpoint returns non-200,
* Railway marks your deployment as unhealthy and can restart the container.
*
* A good health check verifies not just that Node is running, but that
* your database connection is alive — the most common production failure mode.
*/
const db = require('../config/database');

exports.healthCheck = async (req, res) => {
  const startTime = Date.now();

  try {
    // Verify database responds
    await db.query('SELECT 1');
    const dbLatency = Date.now() - startTime;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`
      },
      uptime: `${Math.floor(process.uptime())}s`
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error.message
      }
    });
  }
};
