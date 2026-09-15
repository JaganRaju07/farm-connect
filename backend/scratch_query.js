require('dotenv').config();
const db = require('./src/config/database');

async function run() {
  try {
    const res = await db.query('SELECT * FROM products LIMIT 1');
    console.log(JSON.stringify(res.rows[0], null, 2));
    const farmers = await db.query('SELECT id, name FROM farmers LIMIT 5');
    console.log(JSON.stringify(farmers.rows, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
