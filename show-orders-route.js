const fs = require('fs');
const content = fs.readFileSync('src/app/api/customers/[customerId]/orders/route.ts', 'utf8');
fs.writeFileSync('orders-route-output.txt', content);
console.log('File written');
