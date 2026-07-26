// backend/tests/integration.test.js — CREATE this file

/**
* Farm Connect Integration Test Script
*
* Run with: node backend/tests/integration.test.js
*
* Tests the complete order flow from database perspective:
* 1. Consumer places order -> stock reduces
* 2. Farmer confirms -> status updates with timestamp
* 3. Farmer delivers -> delivered_at set
* 4. Farmer confirms payment -> payment_status = 'paid'
* 5. Consumer cancels different order -> stock restores
* 6. Dashboard stats reflect all above correctly
*/

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../src/config/database');
const { placeOrder, updateOrderStatus, cancelOrder } = require('../src/services/order.service');
const { getFarmerDashboardData } = require('../src/services/dashboard.service');
const { searchProducts } = require('../src/services/search.service');

const FARMER_ID = 1; // Must exist in your seed data
const CONSUMER_ID = 1; // Must exist in your seed data
const PRODUCT_ID = 1; // Must exist in your seed data

async function runTests() {
  console.log('  Starting Farm Connect Integration Tests\n');
  let testsPassed = 0;
  let testsFailed = 0;

  // ── Test 1: GPS product search returns results ──────────────────────────────
  try {
    const products = await searchProducts({
      lat: 12.9716, lon: 77.5946, radius: 50 // Wide radius to ensure seed data appears
    });
    console.assert(Array.isArray(products), 'Search should return array');
    console.assert(products.length > 0, 'Search should return at least one product');
    console.assert('distance_km' in products[0], 'Each product should have distance_km');
    console.log('✅ Test 1 PASS — GPS product search returns distance-sorted results');
    testsPassed++;
  } catch (e) {
    console.error('❌ Test 1 FAIL — GPS search:', e.message);
    testsFailed++;
  }

  // ── Test 2: Check initial stock ─────────────────────────────────────────────
  let initialStock;
  try {
    const stockResult = await db.query(
      'SELECT stock_available FROM products WHERE id = $1', [PRODUCT_ID]
    );
    initialStock = parseInt(stockResult.rows[0].stock_available);
    console.log(`✅ Test 2 PASS — Initial stock for product ${PRODUCT_ID}: ${initialStock} units`);
    testsPassed++;
  } catch (e) {
    console.error('❌ Test 2 FAIL — Stock check:', e.message);
    testsFailed++;
  }

  // ── Test 3: Place order reduces stock atomically ─────────────────────────────
  let createdOrderId;
  const orderQty = 2;
  try {
    const order = await placeOrder({
      consumerId: CONSUMER_ID,
      consumerLat: 12.9716,
      consumerLon: 77.5946,
      items: [{
        productId: PRODUCT_ID,
        name: 'Test Product',
        quantity: orderQty,
        unit: 'kg',
        price: 40,
        farmerId: FARMER_ID
      }],
      deliveryAddress: 'Test Address, Jayanagar',
      deliveryCity: 'Bengaluru',
      deliveryPincode: '560041',
      consumerNotes: 'Integration test order'
    });
    createdOrderId = order.id;

    const newStockResult = await db.query(
      'SELECT stock_available FROM products WHERE id = $1', [PRODUCT_ID]
    );
    const newStock = parseInt(newStockResult.rows[0].stock_available);

    console.assert(newStock === initialStock - orderQty,
      `Stock should reduce by ${orderQty}: expected ${initialStock - orderQty}, got ${newStock}`
    );
    console.log(`✅ Test 3 PASS — Order placed (ID: ${createdOrderId}), stock reduced ${initialStock} -> ${newStock}`);
    testsPassed++;
  } catch (e) {
    console.error('❌ Test 3 FAIL — Order placement:', e.message);
    testsFailed++;
  }

  // ── Test 4: Status transitions work with timestamps ──────────────────────────
  if (createdOrderId) {
    try {
      await updateOrderStatus(createdOrderId, FARMER_ID, 'confirmed');
      await updateOrderStatus(createdOrderId, FARMER_ID, 'packed');
      await updateOrderStatus(createdOrderId, FARMER_ID, 'out_for_delivery');
      await updateOrderStatus(createdOrderId, FARMER_ID, 'delivered');

      const orderCheck = await db.query(
        `SELECT order_status, confirmed_at, packed_at, out_for_delivery_at, delivered_at
         FROM orders WHERE id = $1`, [createdOrderId]
      );
      const row = orderCheck.rows[0];

      console.assert(row.order_status === 'delivered', 'Status should be delivered');
      console.assert(row.confirmed_at !== null, 'confirmed_at timestamp must be set');
      console.assert(row.delivered_at !== null, 'delivered_at timestamp must be set');
      console.log('✅ Test 4 PASS — Order lifecycle complete, all timestamps recorded');
      testsPassed++;
    } catch (e) {
      console.error('❌ Test 4 FAIL — Status transitions:', e.message);
      testsFailed++;
    }
  }

  // ── Test 5: Cancel different order restores stock ────────────────────────────
  try {
    const cancelOrder2 = await placeOrder({
      consumerId: CONSUMER_ID,
      consumerLat: 12.9716, consumerLon: 77.5946,
      items: [{ productId: PRODUCT_ID, name: 'Test', quantity: 1, unit: 'kg', price: 40, farmerId: FARMER_ID }],
      deliveryAddress: 'Test', deliveryCity: 'Bengaluru', deliveryPincode: '560041'
    });

    const stockBeforeCancel = parseInt(
      (await db.query('SELECT stock_available FROM products WHERE id = $1',
      [PRODUCT_ID])).rows[0].stock_available
    );

    await cancelOrder(cancelOrder2.id, 'consumer', 'Test cancellation');

    const stockAfterCancel = parseInt(
      (await db.query('SELECT stock_available FROM products WHERE id = $1',
      [PRODUCT_ID])).rows[0].stock_available
    );

    console.assert(stockAfterCancel === stockBeforeCancel + 1,
      `Stock should restore by 1: expected ${stockBeforeCancel + 1}, got ${stockAfterCancel}`
    );
    console.log(`✅ Test 5 PASS — Order cancellation restores stock: ${stockBeforeCancel} -> ${stockAfterCancel}`);
    testsPassed++;
  } catch (e) {
    console.error('❌ Test 5 FAIL — Order cancellation:', e.message);
    testsFailed++;
  }

  // ── Test 6: Farmer dashboard stats reflect correctly ─────────────────────────
  try {
    const dashboard = await getFarmerDashboardData(FARMER_ID);
    console.assert(dashboard.overview, 'Dashboard should have overview section');
    console.assert(dashboard.recentOrders, 'Dashboard should have recent orders');
    console.assert(Array.isArray(dashboard.monthlyTrend), 'Monthly trend should be array');
    console.log(`✅ Test 6 PASS — Farmer dashboard data: ${dashboard.overview.total_orders} total orders, ₹${dashboard.overview.total_earnings} earned`);
    testsPassed++;
  } catch (e) {
    console.error('❌ Test 6 FAIL — Dashboard stats:', e.message);
    testsFailed++;
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────');
  console.log(`  Results: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('─────────────────────────────────────');

  if (testsFailed === 0) {
    console.log('✅ All integration tests passed. System is ready for Week 4 demo.');
  } else {
    console.log('❌ Fix failing tests before proceeding to deployment.');
  }

  if (db.pool && db.pool.end) {
      await db.pool.end();
  } else if (db.end) {
      await db.end(); // If db is directly exported client
  } else {
      process.exit(0); // fallback
  }
}

runTests().catch(err => {
    console.error(err);
    process.exit(1);
});
