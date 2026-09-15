require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');

const brainDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\e1ce9cc8-e00f-4afd-8002-4a1b12680b22';
const publicImagesDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'products');

// Create the directory if it doesn't exist
if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

const productsToUpdate = [
  { prefix: 'organic_carrots_', dbName: 'Organic Carrots' },
  { prefix: 'fresh_coriander_', dbName: 'Fresh Coriander' },
  { prefix: 'homemade_paneer_', dbName: 'Homemade Paneer' },
  { prefix: 'fresh_ghee_', dbName: 'Fresh Ghee' },
  { prefix: 'yelakki_bananas_', dbName: 'Yelakki Bananas' },
  { prefix: 'raw_mangoes_', dbName: 'Raw Mangoes' },
  { prefix: 'fresh_cabbage_', dbName: 'Fresh Cabbage' },
  { prefix: 'sweet_potatoes_', dbName: 'Sweet Potatoes' }
];

async function run() {
  try {
    const files = fs.readdirSync(brainDir);
    
    for (const item of productsToUpdate) {
      // Find the most recent generated image for this prefix
      const matchingFiles = files.filter(f => f.startsWith(item.prefix) && f.endsWith('.jpg'));
      if (matchingFiles.length === 0) continue;
      
      const fileName = matchingFiles[matchingFiles.length - 1]; // get latest
      const sourcePath = path.join(brainDir, fileName);
      const destFileName = `${item.prefix}hq.jpg`;
      const destPath = path.join(publicImagesDir, destFileName);
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${fileName} to frontend public folder`);
      
      const imageUrl = `/images/products/${destFileName}`;
      
      // Update DB
      await db.query(`UPDATE products SET primary_image_url = $1 WHERE name = $2`, [imageUrl, item.dbName]);
      console.log(`Updated database for ${item.dbName}`);
    }
    
    console.log('✅ All professional images applied successfully!');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

run();
