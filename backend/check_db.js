require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkDB() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT COUNT(*) FROM products');
    console.log(`Total products: ${res.rows[0].count}`);
    
    // Find duplicates
    const dupRes = await client.query(`
      SELECT name, COUNT(*) 
      FROM products 
      GROUP BY name 
      HAVING COUNT(*) > 1
    `);
    console.log('Duplicates:', dupRes.rows);
  } finally {
    client.release();
    pool.end();
  }
}
checkDB();
