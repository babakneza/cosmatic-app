const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/[locale]/account/orders/[id]/page.tsx');
console.log('File path:', filePath);
try {
  console.log(fs.readFileSync(filePath, 'utf8'));
} catch (err) {
  console.error('Error:', err.message);
  console.log('Files in src/app:', fs.readdirSync(path.join(__dirname, 'src/app')));
}
