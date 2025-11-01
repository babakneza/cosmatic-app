const fs = require('fs');
const content = fs.readFileSync('src/lib/api/orders.ts', 'utf8');
const lines = content.split('\n');
lines.slice(217, 300).forEach((line, i) => console.log(line));
fs.writeFileSync('orders-output.txt', lines.slice(217, 300).join('\n'));
