// =============================================================
// FARM CONNECT - DATABASE CONNECTION MODULE
// File: backend/src/config/database.js
// Author: Jagan Raju B (Team Leader, Database Developer)
// IEEE Internship - IamPro 2026 | Team P116
// Week 1 Deliverable
//
// This module sets up a PostgreSQL connection POOL (not a single
// connection). A pool keeps several connections open and reuses
// them across requests — much faster than reconnecting every time.
//
// Usage in other modules:
//   const db = require('./config/database');
//   const result = await db.query('SELECT * FROM farmers WHERE city = $1', ['bengaluru']);
// =============================================================

const { Pool } = require('pg');

// ------------------------------------------------------------------
// CONNECTION POOL
// max: 20 means up to 20 simultaneous DB operations can run.
// idleTimeoutMillis: A connection sitting idle for 30s is released.
// connectionTimeoutMillis: If no free connection available within 2s,
//   the request fails rather than queuing indefinitely.
// ------------------------------------------------------------------
const pool = new Pool({
  // In production (Railway), DATABASE_URL is set automatically.
  // Locally, it's in your .env file:
  //   DATABASE_URL=postgres://farmconnect_user:farmconnect_pass@localhost:5432/farmconnect
  connectionString: process.env.DATABASE_URL,

  // Railway requires SSL in production; local Docker does not.
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,

  max: 20,                        // max simultaneous connections
  idleTimeoutMillis: 30000,       // release idle connections after 30s
  connectionTimeoutMillis: 2000,  // fail fast if DB is unreachable
});

// ------------------------------------------------------------------
// POOL EVENT LISTENERS (for monitoring and crash safety)
// ------------------------------------------------------------------

// Fires each time a new client is acquired from the pool
pool.on('connect', () => {
  console.log('✅ PostgreSQL: client connected (pool size may grow)');
});

// If a client throws an unexpected error outside of a query, pg
// calls this handler. We must either handle or exit — otherwise
// the uncaught exception will crash Node.
pool.on('error', (err, client) => {
  console.error('❌ PostgreSQL: unexpected pool error', err.message);
  // In a production app you might send an alert here instead of exiting.
  process.exit(-1);
});

// ------------------------------------------------------------------
// STARTUP CONNECTION TEST
// Verifies database credentials are correct before the server
// starts accepting HTTP requests. Fail early, fail loudly.
// ------------------------------------------------------------------
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() AS db_time');
    console.log(`✅ Database connected. Server time: ${res.rows[0].db_time}`);
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Check DATABASE_URL in your .env file.');
    process.exit(1);
  }
};

// ------------------------------------------------------------------
// TRANSACTION HELPER
//
// A transaction ensures that a set of queries is treated as ONE
// atomic operation — either ALL succeed or ALL are rolled back.
//
// Classic example: placing an order requires
//   (1) decrementing stock in `products`
//   (2) inserting a row in `orders`
// If step 2 fails after step 1, without a transaction the product
// stock would be decremented permanently even though no order exists.
//
// Usage:
//   const order = await executeTransaction(async (client) => {
//     await client.query('UPDATE products SET stock_available = ...');
//     const result = await client.query('INSERT INTO orders ...');
//     return result.rows[0]; // this becomes the resolved value
//   });
// ------------------------------------------------------------------
const executeTransaction = async (callback) => {
  // `getClient` checks out a dedicated client from the pool.
  // It's important to use this SAME client for all queries inside
  // the transaction — a different client would be on a different
  // database session, unaware of the BEGIN.
  const client = await pool.connect();

  try {
    await client.query('BEGIN');          // start transaction
    const result = await callback(client); // run your queries
    await client.query('COMMIT');         // persist changes
    return result;
  } catch (error) {
    await client.query('ROLLBACK');       // undo everything on failure
    // Re-throw so the caller can handle or log the specific error
    throw error;
  } finally {
    // ALWAYS release the client back to the pool, even if an error
    // occurred. Forgetting this would leak a client and eventually
    // starve the pool of available connections.
    client.release();
  }
};

// ------------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------------
module.exports = {
  /**
   * Run a single SQL query using the pool.
   * The pool automatically checks out and returns a client for you.
   * @param {string} text  - Parameterised SQL e.g. 'SELECT * FROM farmers WHERE city = $1'
   * @param {Array}  params - Values matching the $1, $2 placeholders
   * @returns {Promise<pg.QueryResult>}
   */
  query: (text, params) => pool.query(text, params),

  /**
   * Manually check out a pg.Client from the pool.
   * Remember to call client.release() when done.
   * Prefer `query` for simple queries and `executeTransaction` for multi-step ops.
   */
  getClient: () => pool.connect(),

  /**
   * Run multiple queries atomically inside BEGIN/COMMIT/ROLLBACK.
   * @param {Function} callback - Async function receiving a pg.Client
   * @returns {Promise<*>}       Whatever the callback returns
   */
  executeTransaction,

  /** Exposed for testing or metrics (e.g., pool.totalCount) */
  pool,

  /** Call this once when the server starts */
  testConnection,
};  