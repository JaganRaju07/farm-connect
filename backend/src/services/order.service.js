/**
 * ============================================================
 * FARM CONNECT – ORDER SERVICE
 * File: backend/src/services/order.service.js
 * Author: Jagan Raju B (Week 2 implementation)
 * ============================================================
 *
 * PURPOSE:
 * This module manages the full lifecycle of an order, from the
 * moment a consumer taps "Place Order" to the moment the farmer
 * confirms cash was received. Every function here is a single
 * "chapter" in that story.
 *
 * ORDER LIFECYCLE (state machine):
 *
 *  Consumer places order
 *        │
 *        ▼
 *    [pending]  ─── (farmer/consumer cancels) ──► [cancelled]
 *        │
 *        ▼  (farmer accepts)
 *   [confirmed]
 *        │
 *        ▼  (farmer packs goods)
 *    [packed]
 *        │
 *        ▼  (farmer starts driving)
 * [out_for_delivery]
 *        │
 *        ▼  (farmer hands over goods)
 *   [delivered]   ← payment_status stays 'cod_pending' here
 *        │
 *        ▼  (farmer collects cash)
 *   [completed]  → payment_status = 'paid'
 *
 * WHY A STATE MACHINE?
 * It guarantees we can NEVER skip steps (e.g., jump from 'pending'
 * directly to 'delivered'). Each transition is recorded with a
 * timestamp so the consumer can see a real-time delivery timeline.
 *
 * TEAM INTEGRATION NOTE FOR DEEKSHITHA:
 *   const { placeOrder, updateOrderStatus, confirmPaymentReceived, getOrderById }
 *     = require('../services/order.service');
 * ============================================================
 */

'use strict';

const db = require('../config/database');
const { calculateDistance } = require('./location.service');
const { createNotification, notifyOrderStatusChange } = require('./notification.service');

// ============================================================
// VALID STATUS TRANSITIONS
// ============================================================
// WHY a map: Instead of a long chain of if-else, this lookup table
// makes it immediately clear which transitions are allowed.
// Example: STATUS_TRANSITIONS['confirmed'] tells us a 'confirmed'
// order can only become 'packed' or 'cancelled'.
const STATUS_TRANSITIONS = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['packed',    'cancelled'],
  packed:           ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered:        ['completed'],
  completed:        [],  // terminal state
  cancelled:        [],  // terminal state
};

// ============================================================
// HELPER: GENERATE ORDER NUMBER
// ============================================================
// WHY timestamp-based: Ensures uniqueness without a DB call.
// Format example: FC1714123456789
// "FC" stands for Farm Connect; visible to users as their receipt number.
function generateOrderNumber() {
  return `FC${Date.now()}`;
}

// ============================================================
// FUNCTION: PLACE ORDER
// ============================================================
/**
 * Creates a new order with stock validation and distance calculation.
 * Uses a DATABASE TRANSACTION to guarantee atomicity.
 *
 * WHAT IS A TRANSACTION AND WHY IS IT CRITICAL HERE?
 * Imagine two consumers both ordering the last 5 kg of tomatoes at the
 * exact same millisecond. Without a transaction, both could see "5 kg
 * available", both subtract 5 kg, and both orders succeed – but the
 * farmer only has 5 kg! The stock would go to -5 kg.
 *
 * A transaction works like this:
 *  1. BEGIN – start an isolated workspace
 *  2. FOR UPDATE – lock the product row so no other query can read it
 *     until we finish (the second consumer's query has to WAIT)
 *  3. Check stock → reduce stock → create order
 *  4. COMMIT – make all changes permanent and release the lock
 *
 * If ANY step fails (e.g., insufficient stock), the entire transaction
 * is ROLLED BACK – no stock is reduced, no order is created. The
 * database stays clean.
 *
 * @param {Object} orderData
 * @param {number}   orderData.consumerId     - Consumer's DB id
 * @param {number}   orderData.consumerLat    - Consumer's GPS latitude
 * @param {number}   orderData.consumerLon    - Consumer's GPS longitude
 * @param {Array}    orderData.items          - [{ productId, farmerId, name, quantity, unit, price }]
 * @param {string}   orderData.deliveryAddress
 * @param {string}   orderData.deliveryCity
 * @param {string}   [orderData.deliveryPincode]
 * @param {string}   [orderData.consumerNotes]
 * @returns {Promise<Object>} The created order row
 */
async function placeOrder(orderData) {
  const {
    consumerId,
    consumerLat,
    consumerLon,
    items,
    deliveryAddress,
    deliveryCity,
    deliveryPincode,
    consumerNotes,
  } = orderData;

  // Validate that all items belong to the same farmer
  // (MVP constraint: one order = one farmer, simplifies delivery coordination)
  const uniqueFarmerIds = [...new Set(items.map((i) => i.farmerId))];
  if (uniqueFarmerIds.length > 1) {
    throw new Error(
      'All items in one order must come from the same farmer. ' +
      'Please place separate orders for different farmers.'
    );
  }
  const farmerId = uniqueFarmerIds[0];

  // db.executeTransaction wraps everything in BEGIN ... COMMIT / ROLLBACK
  // (this helper must exist in your database.js config – see note below)
  return await db.executeTransaction(async (client) => {

    // ── STEP 1: Validate and lock stock for every item ────────────────
    // FOR UPDATE locks the row. Any other transaction that tries to SELECT
    // this same product row will WAIT until our transaction finishes.
    // This prevents the race condition described above.
    for (const item of items) {
      const stockResult = await client.query(
        `SELECT id, stock_available, farmer_id, name
         FROM products
         WHERE id = $1
         FOR UPDATE`,
        [item.productId]
      );

      if (stockResult.rows.length === 0) {
        throw new Error(`Product with id ${item.productId} does not exist.`);
      }

      const product = stockResult.rows[0];

      if (product.farmer_id !== farmerId) {
        throw new Error(
          `Product "${product.name}" does not belong to the specified farmer.`
        );
      }

      if (product.stock_available < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". ` +
          `Available: ${product.stock_available} ${item.unit}, ` +
          `Requested: ${item.quantity} ${item.unit}.`
        );
      }
    }

    // ── STEP 2: Get farmer GPS to calculate delivery distance ─────────
    const farmerResult = await client.query(
      'SELECT latitude, longitude FROM farmers WHERE id = $1',
      [farmerId]
    );

    if (farmerResult.rows.length === 0) {
      throw new Error(`Farmer with id ${farmerId} not found.`);
    }

    const farmerLat = parseFloat(farmerResult.rows[0].latitude);
    const farmerLon = parseFloat(farmerResult.rows[0].longitude);

    // calculateDistance is our JS Haversine implementation from location.service.js
    const deliveryDistanceKm = calculateDistance(
      farmerLat, farmerLon,
      consumerLat, consumerLon
    );

    // ── STEP 3: Reduce stock ──────────────────────────────────────────
    // Only runs AFTER stock validation passes for ALL items.
    // WHY: If we reduced stock item-by-item and the 3rd item had insufficient
    // stock, we'd need to manually roll back the first two. The transaction
    // handles this for us – but we still validate all items first to give the
    // consumer a single, complete error message rather than one-at-a-time.
    for (const item of items) {
      await client.query(
        `UPDATE products
         SET stock_available = stock_available - $1
         WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }

    // ── STEP 4: Calculate order totals ────────────────────────────────
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Delivery fee: ₹30 base + ₹5 per km (rounded up to nearest km)
    // WHY ceil: Avoids fractional fees (cleaner UX). A 2.3 km delivery
    // costs the same as a 3 km delivery.
    const deliveryFee = 30 + Math.ceil(deliveryDistanceKm) * 5;
    const totalAmount = subtotal + deliveryFee;

    // ── STEP 5: Create the order record ──────────────────────────────
    const orderNumber = generateOrderNumber();

    const orderResult = await client.query(
      `INSERT INTO orders (
         order_number, consumer_id, farmer_id, items,
         subtotal, delivery_fee, total_amount,
         delivery_latitude, delivery_longitude,
         delivery_address, delivery_city, delivery_pincode,
         delivery_distance_km, consumer_notes
       ) VALUES (
         $1,  $2,  $3,  $4,
         $5,  $6,  $7,
         $8,  $9,
         $10, $11, $12,
         $13, $14
       )
       RETURNING *`,
      [
        orderNumber, consumerId, farmerId, JSON.stringify(items),
        subtotal, deliveryFee, totalAmount,
        consumerLat, consumerLon,
        deliveryAddress, deliveryCity, deliveryPincode || null,
        deliveryDistanceKm, consumerNotes || null,
      ]
    );

    await createNotification(
      farmerId, 'farmer',
      'New Order Received',
      `New order #${orderNumber} placed by a customer. Please confirm.`,
      'order_placed', orderResult.rows[0].id, 'order'
    );

    // COMMIT happens automatically when executeTransaction resolves successfully.
    return orderResult.rows[0];
  });
}

// ============================================================
// FUNCTION: UPDATE ORDER STATUS
// ============================================================
/**
 * Advances an order to the next status in the lifecycle.
 * Only the owning farmer can call this (enforced by WHERE farmer_id = $n).
 *
 * WHY WE VALIDATE TRANSITIONS:
 * Without this check, a farmer could accidentally mark an order
 * 'delivered' before packing it, which would confuse the consumer's
 * tracking timeline. The STATUS_TRANSITIONS map above defines the
 * only allowed paths.
 *
 * @param {number}  orderId      - Order's database id
 * @param {number}  farmerId     - Must match order.farmer_id (authorization)
 * @param {string}  newStatus    - Target status from STATUS_TRANSITIONS
 * @param {string}  [farmerNotes] - Optional note visible to consumer
 * @returns {Promise<Object>}    Updated order row
 */
async function updateOrderStatus(orderId, farmerId, newStatus, farmerNotes = null) {

  // ── Validate the requested new status exists ──────────────────────
  if (!STATUS_TRANSITIONS[newStatus]) {
    throw new Error(
      `"${newStatus}" is not a valid order status. ` +
      `Valid options: ${Object.keys(STATUS_TRANSITIONS).join(', ')}`
    );
  }

  // ── Fetch current status to validate the transition ──────────────
  const currentResult = await db.query(
    'SELECT order_status FROM orders WHERE id = $1 AND farmer_id = $2',
    [orderId, farmerId]
  );

  if (currentResult.rows.length === 0) {
    throw new Error('Order not found or you are not authorised to update it.');
  }

  const currentStatus = currentResult.rows[0].order_status;
  const allowedNext   = STATUS_TRANSITIONS[currentStatus];

  if (!allowedNext.includes(newStatus)) {
    throw new Error(
      `Cannot change order from "${currentStatus}" to "${newStatus}". ` +
      `Allowed next statuses: ${allowedNext.join(', ') || 'none (terminal state)'}`
    );
  }

  // ── Map status → timestamp column ────────────────────────────────
  // WHY individual timestamp columns: We want the full timeline
  // (confirmed_at, packed_at, delivered_at...) stored on the row so
  // a single SELECT returns everything the tracking page needs.
  const timestampColumnMap = {
    confirmed:        'confirmed_at',
    packed:           'packed_at',
    out_for_delivery: 'out_for_delivery_at',
    delivered:        'delivered_at',
    completed:        'completed_at',
  };
  const tsColumn = timestampColumnMap[newStatus]; // may be undefined for 'cancelled'

  // ── Build the UPDATE query dynamically ───────────────────────────
  let setParts = ['order_status = $1'];
  const params = [newStatus];
  let idx = 2;

  if (tsColumn) {
    // Record exactly when this status was reached
    setParts.push(`${tsColumn} = CURRENT_TIMESTAMP`);
  }

  if (farmerNotes) {
    setParts.push(`farmer_notes = $${idx}`);
    params.push(farmerNotes);
    idx++;
  }

  if (newStatus === 'cancelled' && farmerNotes) {
    // Also copy notes to cancellation_reason for clarity
    setParts.push(`cancellation_reason = $${idx}`);
    params.push(farmerNotes);
    idx++;
  }

  params.push(orderId, farmerId);

  const query = `
    UPDATE orders
    SET ${setParts.join(', ')}
    WHERE id = $${idx}
      AND farmer_id = $${idx + 1}
    RETURNING *
  `;

  const result = await db.query(query, params);

  if (result.rows.length === 0) {
    throw new Error('Order update failed. Order may have been modified concurrently.');
  }

  await notifyOrderStatusChange(result.rows[0], newStatus);

  return result.rows[0];
}

// ============================================================
// FUNCTION: CONFIRM PAYMENT RECEIVED
// ============================================================
/**
 * Farmer confirms they physically received cash from the consumer.
 * This flips payment_status from 'cod_pending' → 'paid'.
 *
 * WHY separate from updateOrderStatus?
 * Payment status and delivery status are independent concepts.
 * A delivery is completed when goods change hands. Payment is
 * confirmed when cash changes hands. Sometimes these happen at
 * slightly different times (e.g., consumer is away, neighbour receives
 * goods, cash given later). Keeping them separate lets us model reality.
 *
 * GUARD: Order must already be 'delivered' to mark payment as received.
 * This prevents marking payment on an order still in transit.
 *
 * @param {number} orderId   - Order id
 * @param {number} farmerId  - Must match order.farmer_id
 * @returns {Promise<Object>} Updated order row
 */
async function confirmPaymentReceived(orderId, farmerId) {
  const result = await db.query(
    `UPDATE orders
     SET payment_status = 'paid'
     WHERE id = $1
       AND farmer_id = $2
       AND order_status = 'delivered'
       AND payment_status = 'cod_pending'
     RETURNING *`,
    [orderId, farmerId]
  );

  if (result.rows.length === 0) {
    throw new Error(
      'Cannot confirm payment. Order must be in "delivered" status and ' +
      'payment must still be pending. Verify the order id and your farmer account.'
    );
  }

  return result.rows[0];
}

// ============================================================
// FUNCTION: GET ORDER BY ID (with auth check)
// ============================================================
/**
 * Fetches a full order record with joined farmer and consumer names.
 * The query automatically adds an authorization filter based on
 * who is requesting:
 *   - A farmer can only see their own orders (farmer_id matches)
 *   - A consumer can only see their own orders (consumer_id matches)
 *   - An admin sees any order (no filter added)
 *
 * WHY include farmer and consumer names in the JOIN?
 * The order tracking page needs to display "Order from Ravi Kumar"
 * and "Deliver to Arjun Mehta" without making separate API calls.
 * Fetching it in one JOIN is more efficient.
 *
 * @param {number} orderId          - Order id
 * @param {number} userId           - Requesting user's id
 * @param {'farmer'|'consumer'|'admin'} userType - Role for auth filter
 * @returns {Promise<Object>} Full order row with farmer + consumer info
 */
async function getOrderById(orderId, userId, userType) {
  let query = `
    SELECT
      o.*,
      f.name    AS farmer_name,
      f.phone   AS farmer_phone,
      f.address AS farmer_address,
      c.name    AS consumer_name,
      c.phone   AS consumer_phone,
      c.delivery_address AS consumer_delivery_address
    FROM orders o
    JOIN farmers  f ON o.farmer_id   = f.id
    JOIN consumers c ON o.consumer_id = c.id
    WHERE o.id = $1
  `;

  const params = [orderId];

  // Role-based row-level authorization
  if (userType === 'farmer') {
    query += ` AND o.farmer_id = $2`;
    params.push(userId);
  } else if (userType === 'consumer') {
    query += ` AND o.consumer_id = $2`;
    params.push(userId);
  }
  // admin → no additional filter, they can see everything

  const result = await db.query(query, params);

  if (result.rows.length === 0) {
    throw new Error('Order not found or you do not have permission to view it.');
  }

  return result.rows[0];
}

// ============================================================
// FUNCTION: GET ORDERS FOR FARMER (dashboard list)
// ============================================================
/**
 * Returns all orders assigned to a specific farmer, with pagination.
 * Results are newest-first (most urgent to act on).
 *
 * Optional `status` filter lets the farmer view only pending orders,
 * or only delivered orders, etc.
 *
 * @param {number}  farmerId          - Farmer's id
 * @param {string}  [statusFilter]    - e.g. 'pending', 'confirmed'
 * @param {number}  [limit=20]        - Max orders per page
 * @param {number}  [offset=0]        - Pagination offset
 * @returns {Promise<Array>}
 */
async function getOrdersForFarmer(farmerId, statusFilter, limit = 20, offset = 0) {
  let query = `
    SELECT
      o.id, o.order_number, o.order_status, o.payment_status,
      o.total_amount, o.delivery_distance_km, o.created_at,
      o.confirmed_at, o.delivered_at,
      c.name AS consumer_name, c.phone AS consumer_phone,
      o.delivery_city
    FROM orders o
    JOIN consumers c ON o.consumer_id = c.id
    WHERE o.farmer_id = $1
  `;
  const params = [farmerId];
  let idx = 2;

  if (statusFilter) {
    query += ` AND o.order_status = $${idx}`;
    params.push(statusFilter);
    idx++;
  }

  query += ` ORDER BY o.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
  params.push(limit, offset);

  const result = await db.query(query, params);
  return result.rows;
}

// ============================================================
// FUNCTION: GET ORDERS FOR CONSUMER (history / tracking)
// ============================================================
/**
 * Returns all orders placed by a specific consumer, newest first.
 * Used for the consumer's order history and tracking pages.
 *
 * @param {number} consumerId
 * @param {number} [limit=20]
 * @param {number} [offset=0]
 * @returns {Promise<Array>}
 */
async function getOrdersForConsumer(consumerId, limit = 20, offset = 0) {
  const query = `
    SELECT
      o.id, o.order_number, o.order_status, o.payment_status,
      o.total_amount, o.delivery_distance_km, o.created_at,
      o.confirmed_at, o.out_for_delivery_at, o.delivered_at, o.completed_at,
      f.name AS farmer_name, f.phone AS farmer_phone, f.city AS farmer_city
    FROM orders o
    JOIN farmers f ON o.farmer_id = f.id
    WHERE o.consumer_id = $1
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3
  `;
  const result = await db.query(query, [consumerId, limit, offset]);
  return result.rows;
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  placeOrder,               // Consumer places an order
  updateOrderStatus,        // Farmer progresses order through lifecycle
  confirmPaymentReceived,   // Farmer marks COD cash received
  getOrderById,             // Any party views a single order detail
  getOrdersForFarmer,       // Farmer views their incoming orders list
  getOrdersForConsumer,     // Consumer views their order history
};

// ============================================================
// NOTE FOR DEEKSHITHA – DATABASE CONFIG REQUIREMENT
// ============================================================
// The placeOrder function calls:
//   db.executeTransaction(async (client) => { ... })
//
// This means your database.js (or db/index.js) must export an
// `executeTransaction` helper that:
//   1. Calls client.query('BEGIN')
//   2. Runs the provided async callback with the client
//   3. Calls client.query('COMMIT') on success
//   4. Calls client.query('ROLLBACK') on error, then re-throws
//
// Example implementation to add to backend/src/config/database.js:
//
//   async function executeTransaction(callback) {
//     const client = await pool.connect();
//     try {
//       await client.query('BEGIN');
//       const result = await callback(client);
//       await client.query('COMMIT');
//       return result;
//     } catch (err) {
//       await client.query('ROLLBACK');
//       throw err;
//     } finally {
//       client.release();
//     }
//   }
//   module.exports = { query, executeTransaction };
// ============================================================
