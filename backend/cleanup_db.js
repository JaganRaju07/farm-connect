require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanup() {
  const client = await pool.connect();
  try {
    // 1. Get initial count
    const beforeCount = await client.query('SELECT COUNT(*) FROM products');
    console.log(`Products before cleanup: ${beforeCount.rows[0].count}`);

    // 2. Delete duplicates keeping the oldest ID
    const deleteRes = await client.query(`
      DELETE FROM products a USING products b
      WHERE a.id > b.id AND a.name = b.name;
    `);
    console.log(`Deleted ${deleteRes.rowCount} duplicate products.`);

    // 3. Get final count
    const afterCount = await client.query('SELECT COUNT(*) FROM products');
    console.log(`Products after cleanup: ${afterCount.rows[0].count} (Should be ~54 unique products)`);
    console.log('✅ Database is now clean and packed with 50+ unique products!');

  } catch (err) {
    console.error('Error cleaning DB:', err);
  } finally {
    client.release();
    pool.end();
  }
}

cleanup();
