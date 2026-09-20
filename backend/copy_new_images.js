const fs = require('fs');
const path = require('path');

const SOURCE_DIR = `C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\e8275699-8947-4e5d-9c49-0a0f4606d963`;
const DEST_DIR = `c:\\Users\\Lenovo\\farm-connect\\frontend\\public\\products`;

const newImages = [
  { file: 'fresh_strawberries_1789878159175.jpg', dest: 'fresh_strawberries.jpg' },
  { file: 'organic_spinach_1789878171593.jpg', dest: 'organic_spinach.jpg' },
  { file: 'brown_eggs_1789878185429.jpg', dest: 'brown_eggs.jpg' },
  { file: 'coconut_oil_1789878198432.jpg', dest: 'coconut_oil.jpg' },
  { file: 'mint_leaves_1789878212721.jpg', dest: 'mint_leaves.jpg' },
  { file: 'local_avocados_1789878230262.jpg', dest: 'local_avocados.jpg' },
  { file: 'peanut_butter_1789878242014.jpg', dest: 'peanut_butter.jpg' },
  { file: 'black_pepper_1789878258986.jpg', dest: 'black_pepper.jpg' }
];

console.log('Copying new AI images...');
for (const img of newImages) {
  const src = path.join(SOURCE_DIR, img.file);
  const dst = path.join(DEST_DIR, img.dest);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Copied ${img.dest}`);
  }
}
