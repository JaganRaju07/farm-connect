require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const products = [
  { name: 'Fresh Tomatoes', category: 'vegetables', description: 'Red and juicy local tomatoes.', price: 40, unit: 'kg', stock: 100, organic: true },
  { name: 'Onions', category: 'vegetables', description: 'Dry red onions.', price: 30, unit: 'kg', stock: 150, organic: false },
  { name: 'Raw Honey', category: 'pantry', description: 'Pure unpasteurized honey.', price: 400, unit: '500g', stock: 20, organic: true },
  { name: 'Basmati Rice', category: 'grains', description: 'Long grain fragrant rice.', price: 120, unit: 'kg', stock: 200, organic: false },
  { name: 'Wheat Flour', category: 'grains', description: 'Stone ground whole wheat flour.', price: 50, unit: 'kg', stock: 50, organic: true },
  { name: 'Turmeric Powder', category: 'spices', description: 'Locally ground pure turmeric.', price: 80, unit: '200g', stock: 30, organic: true },
  { name: 'Green Chillies', category: 'vegetables', description: 'Spicy farm fresh green chillies.', price: 60, unit: 'kg', stock: 20, organic: true },
  { name: 'Farm Eggs', category: 'dairy', description: 'Free range brown eggs.', price: 100, unit: 'dozen', stock: 40, organic: false }
];

async function addProducts() {
  const client = await pool.connect();
  try {
    // Get first active farmer
    const fRes = await client.query('SELECT id FROM farmers WHERE is_active = true LIMIT 1');
    if (fRes.rows.length === 0) {
      console.log('No farmers found.');
      return;
    }
    const farmerId = fRes.rows[0].id;
    console.log('Using farmer ID:', farmerId);

    let count = 0;
    for (const p of products) {
      const query = `
        INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available, is_organic, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      `;
      await client.query(query, [farmerId, p.name, p.category, p.description, p.price, p.unit, p.stock, p.organic]);
      count++;
    }
    console.log(`Successfully added ${count} new products!`);
  } catch (err) {
    console.error('Error adding products:', err);
  } finally {
    client.release();
    pool.end();
  }
}

addProducts();
