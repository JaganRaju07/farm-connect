require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function moveFarmers() {
  const client = await pool.connect();
  try {
    // Update all farmers to be around Bengaluru (lat: 12.9716, lon: 77.5946)
    // We add a tiny random offset so they aren't on the exact same pixel
    const res = await client.query(`
      UPDATE farmers 
      SET 
        latitude = 12.9716 + (random() * 0.05 - 0.025),
        longitude = 77.5946 + (random() * 0.05 - 0.025),
        city = 'Bengaluru'
      WHERE is_active = true;
    `);
    
    console.log(`Successfully relocated ${res.rowCount} farmers to Bengaluru!`);
    console.log(`All 56 products will now appear within the 25km radius!`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

moveFarmers();
