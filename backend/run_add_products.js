require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');

async function runMigrations() {
  try {
    const file = '../database/add_more_products.sql';
    const sqlFilePath = path.join(__dirname, file);
    console.log(`Reading SQL from: ${sqlFilePath}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    console.log(`Running ${file}...`);
    await db.query(sql);
    console.log('✅ Products added successfully!');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
  } finally {
    process.exit(0);
  }
}

runMigrations();
