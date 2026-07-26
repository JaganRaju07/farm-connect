require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');

async function runMigration() {
  try {
    const sqlFilePath = path.join(__dirname, 'src', 'database', 'migrations', '003_profile_and_images.sql');
    console.log(`Reading SQL from: ${sqlFilePath}`);
    
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Running migration...');
    await db.query(sql);
    
    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
  } finally {
    process.exit(0);
  }
}

runMigration();
