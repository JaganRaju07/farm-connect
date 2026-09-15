const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity-ide\\brain\\e1ce9cc8-e00f-4afd-8002-4a1b12680b22';
const destDir = path.join(__dirname, 'frontend', 'public', 'images');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
const categories = ['vegetables', 'fruits', 'dairy', 'grains', 'default'];

categories.forEach(cat => {
  const match = files.find(f => f.startsWith(`fallback_${cat}`) && f.endsWith('.jpg'));
  if (match) {
    fs.copyFileSync(path.join(srcDir, match), path.join(destDir, `fallback_${cat}.jpg`));
    console.log(`Copied ${cat} image.`);
  }
});
