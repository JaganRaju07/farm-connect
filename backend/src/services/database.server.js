// =============================================================
// FARM CONNECT - DATABASE QUERY HELPERS
// File: backend/src/services/database.service.js
// Author: Jagan Raju B (Team Leader, Database Developer)
// IEEE Internship - IamPro 2026 | Team P116
// Week 1 Deliverable
//
// This service layer sits BETWEEN route handlers and raw SQL.
// Route handlers call these functions by name; they never write
// SQL strings themselves. This separation makes the code easier
// to test, refactor, and audit for security.
//
// Three critical functions for Week 1:
//   1. findUserByPhone       — OTP login lookup (farmers + consumers)
//   2. getProductsByCity     — City-based product listing with filters
//   3. placeOrderWithStockCheck — Atomic order creation (no overselling)
// =============================================================

'use strict';

const db = require('../config/database');

// ------------------------------------------------------------------
// HELPER: Safely build a parameterised WHERE clause
//
// Explanation for the team:
//   PostgreSQL uses $1, $2, $3... as placeholders to prevent
//   SQL injection. We never concatenate user-supplied values
//   directly into a SQL string. Instead, we build a params array
//   and reference positions by index.
//
//   paramIndex starts at 2 in getProductsByCity because $1 is
//   already reserved for `city`.
// ------------------------------------------------------------------

/**
 * Find a farmer or consumer by their phone number.
 *
 * Why this function exists:
 * OTP authentication doesn't use emails or passwords. When a user
 * enters their phone number, we first check whether they already
 * have an account. If yes → login flow. If no → register flow.
 *
 * @param {string} phone    - E.164 or 10-digit phone number
 * @param {string} userType - 'farmer' or 'consumer'
 * @returns {Promise<Object|null>} User row or null if not found
 */
const findUserByPhone = async (phone, userType) => {
  // We select the table name dynamically but ONLY from a known whitelist,
  // so there is no injection risk from the userType parameter.
  const table = userType === 'farmer' ? 'farmers' : 'consumers';

  const sql = `SELECT * FROM ${table} WHERE phone = $1 AND is_active = TRUE`;

  try {
    const result = await db.query(sql, [phone]);
    // rows[0] is undefined if the SELECT returned no results;
    // we normalise that to null for callers to check with a simple `if (!user)`.
    return result.rows[0] || null;
  } catch (err) {
    console.error(`[findUserByPhone] Error querying ${table}:`, err.message);
    throw err;
  }
};


/**
 * Get active products from farmers in a specific city.
 *
 * Why this function is critical:
 * City-based filtering is Farm Connect's core feature — consumers
 * only see produce from local farmers, reducing logistics complexity.
 * The JOIN ensures we also check the farmer's city, not just the
 * product table (products don't store city directly).
 *
 * Additional filters (category, price range, organic) are appended
 * ONLY if provided, keeping the query efficient.
 *
 * @param {Object} filters
 * @param {string}  filters.city      - Required. e.g. 'bengaluru'
 * @param {string}  [filters.category]  - e.g. 'vegetables'
 * @param {number}  [filters.minPrice]  - minimum price (inclusive)
 * @param {number}  [filters.maxPrice]  - maximum price (inclusive)
 * @param {boolean} [filters.isOrganic] - true → only organic products
 * @returns {Promise<Array>} Array of product rows with farmer details joined
 */
const getProductsByCity = async (filters) => {
  const { city, category, minPrice, maxPrice, isOrganic } = filters;

  if (!city) throw new Error('city filter is required');

  // Base query: join products → farmers so we can filter on farmer's city
  // and also return farmer_name and farmer_verified to the frontend.
  let sql = `
    SELECT
      p.id,
      p.name,
      p.category,
      p.description,
      p.price,
      p.unit,
      p.stock_available,
      p.minimum_order_quantity,
      p.is_organic,
      p.harvest_date,
      p.image_url,
      f.id          AS farmer_id,
      f.name        AS farmer_name,
      f.city        AS farmer_city,
      f.is_verified AS farmer_verified
    FROM products p
    JOIN farmers f ON p.farmer_id = f.id
    WHERE p.is_active = TRUE
      AND f.is_active = TRUE
      AND f.is_verified = TRUE        -- only show verified farmers' products
      AND LOWER(f.city) = LOWER($1)  -- case-insensitive city match
  `;

  // $1 is already taken by city; additional filters start at $2.
  const params = [city];
  let paramIndex = 2;

  if (category) {
    sql += ` AND LOWER(p.category) = LOWER($${paramIndex})`;
    params.push(category);
    paramIndex++;
  }

  if (minPrice !== undefined && minPrice !== null) {
    sql += ` AND p.price >= $${paramIndex}`;
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice !== undefined && maxPrice !== null) {
    sql += ` AND p.price <= $${paramIndex}`;
    params.push(maxPrice);
    paramIndex++;
  }

  // isOrganic is a boolean; only add the filter if explicitly passed
  // (undefined means "don't filter"; false means "show non-organic only").
  if (isOrganic !== undefined && isOrganic !== null) {
    sql += ` AND p.is_organic = $${paramIndex}`;
    params.push(isOrganic);
    paramIndex++;
  }

  // Most recently added products appear first.
  sql += ` ORDER BY p.created_at DESC`;

  try {
    const result = await db.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('[getProductsByCity] Query failed:', err.message);
    throw err;
  }
};


/**
 * Place an order with atomic stock validation.
 *
 * Why this is the most important function in Week 1:
 * Imagine two consumers click "Buy" on the last 2 kg of tomatoes
 * at the exact same millisecond. Without a transaction + row lock,
 * both might read stock = 2, both think there's enough, and both
 * succeed — resulting in -2 kg of actual tomatoes. A race condition.
 *
 * This function prevents that by using:
 * 1. BEGIN — start an atomic block
 * 2. SELECT ... FOR UPDATE — lock the product row so no one else
 * can read-then-modify it until we're done
 * 3. Validate stock → reduce stock → insert order, all in one block
 * 4. COMMIT (success) or ROLLBACK (any error)
 *
 * @param {Object}   orderData
 * @param {number}   orderData.consumerId       - Consumer's ID
 * @param {number}   orderData.farmerId         - Farmer's ID (MVP: single farmer per order)
 * @param {Array}    orderData.items            - [{ productId, name, quantity, price, unit }]
 * @param {string}   orderData.deliveryAddress  - Full text delivery address
 * @param {string}   orderData.deliveryCity     - City name
 * @param {string}   [orderData.deliveryPincode]
 * @param {string}   [orderData.consumerNotes]
 * @returns {Promise<Object>} The newly created order row
 */
const placeOrderWithStockCheck = async (orderData) => {
  const {
    consumerId,
    farmerId,
    items,
    deliveryAddress,
    deliveryCity,
    deliveryPincode = null,
    consumerNotes  = null,
  } = orderData;

  // Validate input before touching the database
  if (!consumerId || !farmerId || !items?.length || !deliveryAddress || !deliveryCity) {
    throw new Error('Missing required order fields (consumerId, farmerId, items, deliveryAddress, deliveryCity)');
  }

  return await db.executeTransaction(async (client) => {
    // ── STEP 1: Validate stock for EVERY item in the cart ───────────
    // We lock all product rows upfront (FOR UPDATE) to prevent other
    // concurrent transactions from reading stale stock counts during
    // our check.
    for (const item of items) {
      const stockResult = await client.query(
        `SELECT id, name, stock_available
         FROM products
         WHERE id = $1 AND is_active = TRUE
         FOR UPDATE`,             // <-- row-level lock
        [item.productId]
      );

      if (stockResult.rows.length === 0) {
        throw new Error(`Product ID ${item.productId} not found or is inactive`);
      }

      const { name: productName, stock_available: available } = stockResult.rows[0];

      if (available < item.quantity) {
        throw new Error(
          `Insufficient stock for "${productName}". ` +
          `Requested: ${item.quantity}, Available: ${available}`
        );
      }
    }

    // ── STEP 2: Deduct stock for each item ──────────────────────────
    // We can safely do this now because STEP 1 locked every row.
    for (const item of items) {
      await client.query(
        `UPDATE products
         SET stock_available = stock_available - $1,
             updated_at      = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    // ── STEP 3: Calculate totals ─────────────────────────────────────
    const subtotal    = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const deliveryFee = 30;   // fixed delivery fee for MVP (₹30)
    const totalAmount = subtotal + deliveryFee;

    // Unique order number: timestamp-based, good enough for MVP.
    // For production: use UUID v4 or a sequence with a prefix.
    const orderNumber = `ORD-${Date.now()}`;

    // ── STEP 4: Insert the order row ─────────────────────────────────
    const orderResult = await client.query(
      `INSERT INTO orders (
         order_number, consumer_id, farmer_id, items,
         subtotal, delivery_fee, total_amount,
         delivery_address, delivery_city, delivery_pincode,
         consumer_notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        orderNumber,
        consumerId,
        farmerId,
        JSON.stringify(items),   // stored as JSONB in PostgreSQL
        subtotal,
        deliveryFee,
        totalAmount,
        deliveryAddress,
        deliveryCity,
        deliveryPincode,
        consumerNotes,
      ]
    );

    const newOrder = orderResult.rows[0];

    // ── STEP 5: Create the corresponding payment record ──────────────
    // Even for COD, we track payment status from the start.
    await client.query(
      `INSERT INTO payments (order_id, amount, payment_method, payment_status)
       VALUES ($1, $2, 'cod', 'pending')`,
      [newOrder.id, totalAmount]
    );

    // The COMMIT in executeTransaction() will run after we return.
    return newOrder;
  });
};


/**
 * Get order history for a specific consumer.
 * Includes farmer name and payment status in the result.
 *
 * @param {number} consumerId
 * @returns {Promise<Array>}
 */
const getOrdersByConsumer = async (consumerId) => {
  const sql = `
    SELECT
      o.*,
      f.name  AS farmer_name,
      f.phone AS farmer_phone,
      p.payment_status,
      p.completed_at AS payment_completed_at
    FROM orders o
    JOIN farmers  f ON o.farmer_id = f.id
    LEFT JOIN payments p ON p.order_id = o.id
    WHERE o.consumer_id = $1
    ORDER BY o.created_at DESC
  `;
  const result = await db.query(sql, [consumerId]);
  return result.rows;
};


/**
 * Get all pending orders for a specific farmer dashboard.
 *
 * @param {number} farmerId
 * @returns {Promise<Array>}
 */
const getPendingOrdersByFarmer = async (farmerId) => {
  const sql = `
    SELECT
      o.*,
      c.name  AS consumer_name,
      c.phone AS consumer_phone
    FROM orders o
    JOIN consumers c ON o.consumer_id = c.id
    WHERE o.farmer_id   = $1
      AND o.order_status IN ('pending', 'confirmed', 'packed')
    ORDER BY o.created_at DESC
  `;
  const result = await db.query(sql, [farmerId]);
  return result.rows;
};


// ------------------------------------------------------------------
// EXPORTS
// ------------------------------------------------------------------
module.exports = {
  findUserByPhone,
  getProductsByCity,
  placeOrderWithStockCheck,
  getOrdersByConsumer,
  getPendingOrdersByFarmer,
};