require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');

const brainDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\e1ce9cc8-e00f-4afd-8002-4a1b12680b22';
const publicImagesDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'products');

if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

const productsToUpdate = [
  { prefix: 'red_bell_peppers_', dbName: 'Red Bell Peppers', farmerPhone: '9845000001', category: 'vegetables', desc: 'Glossy red bell peppers, perfect for salads and cooking.', price: 80, unit: 'kg', organic: true },
  { prefix: 'fresh_strawberries_', dbName: 'Fresh Strawberries', farmerPhone: '9845000002', category: 'fruits', desc: 'Sweet and juicy fresh red strawberries picked this morning.', price: 150, unit: 'box', organic: true },
  { prefix: 'alphonso_mangoes_', dbName: 'Alphonso Mangoes', farmerPhone: '9845000003', category: 'fruits', desc: 'Premium Devgad Alphonso mangoes, rich and sweet.', price: 600, unit: 'dozen', organic: false },
  { prefix: 'organic_turmeric_', dbName: 'Organic Turmeric', farmerPhone: '9845000001', category: 'other', desc: 'Fresh raw organic turmeric roots, rich in curcumin.', price: 120, unit: 'kg', organic: true },
  { prefix: 'fresh_green_peas_', dbName: 'Fresh Green Peas', farmerPhone: '9845000003', category: 'vegetables', desc: 'Sweet, tender fresh green peas in pods.', price: 60, unit: 'kg', organic: false },
  { prefix: 'wild_honey_', dbName: 'Wild Honey', farmerPhone: '9845000002', category: 'other', desc: 'Pure unfiltered wild raw honey collected from local forests.', price: 350, unit: '500g', organic: true },
  { prefix: 'fresh_mint_leaves_', dbName: 'Fresh Mint Leaves', farmerPhone: '9845000001', category: 'vegetables', desc: 'Aromatic fresh mint leaves for teas and garnishing.', price: 15, unit: 'bunch', organic: true },
  { prefix: 'brown_eggs_', dbName: 'Organic Brown Eggs', farmerPhone: '9845000002', category: 'dairy', desc: 'Farm fresh organic brown eggs from free-range hens.', price: 110, unit: 'dozen', organic: true }
];

async function run() {
  try {
    const files = fs.readdirSync(brainDir);
    
    for (const item of productsToUpdate) {
      // 1. Get Farmer ID
      const farmerRes = await db.query('SELECT id FROM farmers WHERE phone = $1', [item.farmerPhone]);
      if (farmerRes.rows.length === 0) continue;
      const farmerId = farmerRes.rows[0].id;

      // 2. Insert product if it doesn't exist
      await db.query(`
        INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available, is_organic, is_active, average_rating, review_count, harvest_date)
        SELECT $1::int, $2::varchar, $3::varchar, $4::text, $5::decimal, $6::varchar, $7::int, $8::boolean, true, 4.8, 15, NOW() - INTERVAL '1 day'
        WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = $2::varchar AND farmer_id = $1::int)
      `, [farmerId, item.dbName, item.category, item.desc, item.price, item.unit, 20, item.organic]);

      // 3. Find and copy the generated image
      const matchingFiles = files.filter(f => f.startsWith(item.prefix) && f.endsWith('.jpg'));
      if (matchingFiles.length === 0) continue;
      
      const fileName = matchingFiles[matchingFiles.length - 1]; // get latest
      const sourcePath = path.join(brainDir, fileName);
      const destFileName = `${item.prefix}hq.jpg`;
      const destPath = path.join(publicImagesDir, destFileName);
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${fileName} to frontend public folder`);
      
      // 4. Update the image_url in the database
      const imageUrl = `/images/products/${destFileName}`;
      await db.query(`UPDATE products SET primary_image_url = $1 WHERE name = $2 AND farmer_id = $3`, [imageUrl, item.dbName, farmerId]);
      console.log(`Updated database for ${item.dbName}`);
    }
    
    console.log('✅ 8 new products and images added successfully!');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
