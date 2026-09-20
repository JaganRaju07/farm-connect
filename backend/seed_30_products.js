require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Copy AI Images to Frontend
const SOURCE_DIR = `C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\e8275699-8947-4e5d-9c49-0a0f4606d963`;
const DEST_DIR = `c:\\Users\\Lenovo\\farm-connect\\frontend\\public\\products`;

// Create dest dir if not exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

const aiImages = [
  { file: 'organic_vegetables_basket_1789877486310.jpg', name: 'organic_vegetables_basket.jpg' },
  { file: 'raw_honey_jar_1789877498490.jpg', name: 'raw_honey_jar.jpg' },
  { file: 'farm_fresh_dairy_1789877509458.jpg', name: 'farm_fresh_dairy.jpg' },
  { file: 'artisanal_bread_wheat_1789877520976.jpg', name: 'artisanal_bread_wheat.jpg' },
  { file: 'exotic_fresh_fruits_1789877532182.jpg', name: 'exotic_fresh_fruits.jpg' }
];

console.log('Copying AI images to frontend...');
for (const img of aiImages) {
  const src = path.join(SOURCE_DIR, img.file);
  const dest = path.join(DEST_DIR, img.name);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${img.name}`);
  } else {
    console.log(`Warning: Could not find ${src}`);
  }
}

// 2. Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const products = [
  // AI Generated Images
  { name: 'Farm Fresh Organic Vegetable Basket', category: 'vegetables', description: 'A beautiful assortment of freshly harvested organic vegetables including tomatoes, carrots, lettuce, and potatoes.', price: 450, unit: 'basket', stock: 15, organic: true, img: '/products/organic_vegetables_basket.jpg' },
  { name: 'Premium Artisanal Raw Honey', category: 'pantry', description: 'Pure, unfiltered raw honey with fresh honeycomb. Harvested locally.', price: 850, unit: '500g', stock: 25, organic: true, img: '/products/raw_honey_jar.jpg' },
  { glass: true, name: 'A2 Organic Farm Milk & Dairy Set', category: 'dairy', description: 'Freshly bottled A2 organic milk in glass bottles, straight from the farm.', price: 180, unit: '1L', stock: 40, organic: true, img: '/products/farm_fresh_dairy.jpg' },
  { name: 'Rustic Sourdough & Artisan Wheat', category: 'grains', description: 'Freshly baked sourdough bread made with stone-ground organic wheat.', price: 220, unit: 'loaf', stock: 10, organic: true, img: '/products/artisanal_bread_wheat.jpg' },
  { name: 'Exotic Farm Fruit Assortment', category: 'fruits', description: 'A vibrant wooden crate full of freshly picked exotic and local fruits.', price: 600, unit: 'crate', stock: 20, organic: true, img: '/products/exotic_fresh_fruits.jpg' },
  
  // Real Photography Unsplash Fallbacks
  { name: 'Fresh Strawberries', category: 'fruits', description: 'Sweet and juicy organic strawberries.', price: 200, unit: 'box', stock: 30, organic: true, img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=600&auto=format&fit=crop' },
  { name: 'Organic Spinach Bundle', category: 'vegetables', description: 'Crisp, iron-rich spinach leaves.', price: 40, unit: 'bunch', stock: 50, organic: true, img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=600&auto=format&fit=crop' },
  { name: 'Free Range Brown Eggs', category: 'dairy', description: 'Nutritious eggs from free-roaming hens.', price: 120, unit: 'dozen', stock: 60, organic: false, img: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?q=80&w=600&auto=format&fit=crop' },
  { name: 'Cold Pressed Coconut Oil', category: 'pantry', description: 'Pure, unrefined coconut oil extracted using traditional cold press methods.', price: 350, unit: '500ml', stock: 40, organic: true, img: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600&auto=format&fit=crop' },
  { name: 'Fresh Mint Leaves', category: 'vegetables', description: 'Aromatic fresh mint perfect for teas and garnishes.', price: 20, unit: 'bunch', stock: 80, organic: true, img: 'https://images.unsplash.com/photo-1629124400582-7f28db0b7640?q=80&w=600&auto=format&fit=crop' },
  { name: 'Local Avocados', category: 'fruits', description: 'Creamy, ripe avocados grown locally without pesticides.', price: 300, unit: 'kg', stock: 15, organic: true, img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=600&auto=format&fit=crop' },
  { name: 'Homemade Peanut Butter', category: 'pantry', description: 'Crunchy peanut butter made with zero preservatives or added sugar.', price: 280, unit: '350g', stock: 25, organic: false, img: 'https://images.unsplash.com/photo-1590137731773-195b058a9f4c?q=80&w=600&auto=format&fit=crop' },
  { name: 'Black Pepper Corns', category: 'spices', description: 'Highly aromatic bold black pepper.', price: 450, unit: '200g', stock: 35, organic: true, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Fresh Paneer', category: 'dairy', description: 'Soft and fresh cottage cheese made daily.', price: 150, unit: '250g', stock: 20, organic: false, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=600&auto=format&fit=crop' },
  { name: 'Red Apples (Fuji)', category: 'fruits', description: 'Crisp and sweet Fuji apples.', price: 250, unit: 'kg', stock: 45, organic: true, img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?q=80&w=600&auto=format&fit=crop' },
  { name: 'Button Mushrooms', category: 'vegetables', description: 'Fresh, earthy button mushrooms.', price: 80, unit: '200g', stock: 30, organic: false, img: 'https://images.unsplash.com/photo-1611077544715-db1490ce0220?q=80&w=600&auto=format&fit=crop' },
  { name: 'Organic Quinoa', category: 'grains', description: 'High protein, gluten-free organic white quinoa.', price: 320, unit: '500g', stock: 50, organic: true, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop' },
  { name: 'Cinnamon Sticks', category: 'spices', description: 'Sweet and fragrant Ceylon cinnamon sticks.', price: 180, unit: '100g', stock: 40, organic: true, img: 'https://images.unsplash.com/photo-1599818815124-7eb3ff58d34e?q=80&w=600&auto=format&fit=crop' },
  { name: 'Sweet Corn', category: 'vegetables', description: 'Juicy and sweet yellow corn on the cob.', price: 50, unit: 'kg', stock: 60, organic: false, img: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=600&auto=format&fit=crop' },
  { name: 'Watermelon', category: 'fruits', description: 'Large, sweet, and refreshing summer watermelon.', price: 100, unit: 'piece', stock: 15, organic: true, img: 'https://images.unsplash.com/photo-1589984662649-61b9f40bc8ce?q=80&w=600&auto=format&fit=crop' },
  { name: 'Fresh Garlic', category: 'vegetables', description: 'Pungent, freshly harvested garlic bulbs.', price: 120, unit: 'kg', stock: 40, organic: true, img: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?q=80&w=600&auto=format&fit=crop' },
  { name: 'Almonds', category: 'pantry', description: 'Premium quality raw almonds.', price: 850, unit: 'kg', stock: 25, organic: false, img: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=600&auto=format&fit=crop' },
  { name: 'Organic Jaggery Powder', category: 'pantry', description: 'Chemical-free crushed jaggery from local sugarcane.', price: 90, unit: 'kg', stock: 50, organic: true, img: 'https://images.unsplash.com/photo-1620603774845-81216d1dc2a9?q=80&w=600&auto=format&fit=crop' },
  { name: 'Green Grapes', category: 'fruits', description: 'Seedless, sweet green grapes.', price: 160, unit: 'kg', stock: 35, organic: false, img: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?q=80&w=600&auto=format&fit=crop' },
  { name: 'Fresh Ginger', category: 'vegetables', description: 'Strong, spicy fresh ginger root.', price: 140, unit: 'kg', stock: 30, organic: true, img: 'https://images.unsplash.com/photo-1596593574246-24ea93809228?q=80&w=600&auto=format&fit=crop' },
  { name: 'Cardamom Pods', category: 'spices', description: 'Premium green cardamom pods.', price: 1200, unit: '200g', stock: 15, organic: true, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Whole Wheat Bread', category: 'pantry', description: 'Freshly baked 100% whole wheat bread loaf.', price: 60, unit: 'loaf', stock: 20, organic: false, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop' },
  { name: 'Organic Lemon', category: 'fruits', description: 'Juicy, bright yellow organic lemons.', price: 80, unit: 'kg', stock: 45, organic: true, img: 'https://images.unsplash.com/photo-1587496679742-bad502958fbc?q=80&w=600&auto=format&fit=crop' },
  { name: 'Cloves', category: 'spices', description: 'Intensely aromatic whole cloves.', price: 300, unit: '100g', stock: 20, organic: true, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Mustard Seeds', category: 'spices', description: 'Black mustard seeds for tempering.', price: 60, unit: '200g', stock: 50, organic: false, img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop' },
];

async function seedProducts() {
  const client = await pool.connect();
  try {
    const fRes = await client.query('SELECT id FROM farmers WHERE is_active = true');
    if (fRes.rows.length === 0) {
      console.log('No farmers found.');
      return;
    }
    
    let count = 0;
    // Distribute products evenly across active farmers
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const farmerId = fRes.rows[i % fRes.rows.length].id;
      
      const query = `
        INSERT INTO products (farmer_id, name, category, description, price, unit, stock_available, is_organic, is_active, primary_image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
      `;
      await client.query(query, [farmerId, p.name, p.category, p.description, p.price, p.unit, p.stock, p.organic, p.img]);
      count++;
    }
    console.log(`Successfully seeded ${count} new massive products!`);
  } catch (err) {
    console.error('Error adding products:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seedProducts();
