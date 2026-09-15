require('dotenv').config();
const db = require('./src/config/database');

async function run() {
  try {
    const res = await db.query('SELECT * FROM products LIMIT 1');
    console.log(Object.keys(res.rows[0]));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
