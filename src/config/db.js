const { Pool } = require('pg');
require('dotenv').config();

// Use the DATABASE_URL from your .env file
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Force a test connection immediately so we can see the console log
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Failed to connect to the database. Check your DATABASE_URL in .env');
        console.error(err.message);
    } else {
        console.log('✅ Connected to the PostgreSQL database successfully.');
    }
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;