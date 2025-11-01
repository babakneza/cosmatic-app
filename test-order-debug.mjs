import https from 'https';
import fs from 'fs';

const directusUrl = 'admin.buyjan.com';
const token = '1phLsCeVpTswZCaNuz9YkgYCdK3IkT7h';
const logFile = 'test-debug.log';

function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: directusUrl,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  // Clear log
  fs.writeFileSync(logFile, '');
  
  try {
    log('=== Step 1: Fetching existing orders ===');
    const getRes = await makeRequest('GET', '/items/orders?limit=1&fields=*', null);
    log(`Status: ${getRes.status}`);
    
    if (getRes.data.data && getRes.data.data[0]) {
      const order = getRes.data.data[0];
      log(`Order ID: ${order.id}`);
      log(`Order Number: ${order.order_number}`);
      log(`Shipping Address Type: ${typeof order.shipping_address}`);
      log(`Shipping Address Value: ${JSON.stringify(order.shipping_address)}`);
      log(`Billing Address Value: ${JSON.stringify(order.billing_address)}`);
    } else {
      log('No orders found');
    }

    log('\n=== Step 2: Creating test order with JSON addresses ===');
    const testOrder = {
      order_number: `TEST-${Date.now()}`,
      customer: 1,
      customer_email: 'test@buyjan.com',
      status: 'pending',
      payment_status: 'pending',
      shipping_address: {
        first_name: 'Mohammad',
        last_name: 'Akbari',
        address_line_1: 'No 35 Way 1400',
        address_line_2: 'Building 5',
        city: 'Muscat',
        state: 'muscat',
        postal_code: '12345',
        phone_number: '+96891372715',
        countries: 7,
        type: 'shipping'
      },
      billing_address: {
        first_name: 'Mohammad',
        last_name: 'Akbari',
        address_line_1: 'No 35 Way 1400',
        address_line_2: 'Building 5',
        city: 'Muscat',
        state: 'muscat',
        postal_code: '12345',
        phone_number: '+96891372715',
        countries: 7,
        type: 'billing'
      },
      subtotal: 100,
      tax_rate: 0,
      tax_amount: 0,
      shipping_cost: 10,
      total: 110,
      payment_method: 'cash_on_delivery'
    };

    log('Request Payload: ' + JSON.stringify(testOrder, null, 2));
    
    const createRes = await makeRequest('POST', '/items/orders', testOrder);
    log(`\nResponse Status: ${createRes.status}`);
    log(`Response Body: ${JSON.stringify(createRes.data, null, 2)}`);
    
    if (createRes.status === 201 || createRes.status === 200) {
      const created = createRes.data.data;
      log(`\n=== Order Created ===`);
      log(`Order ID: ${created.id}`);
      log(`Shipping Address Saved: ${JSON.stringify(created.shipping_address)}`);
      log(`Billing Address Saved: ${JSON.stringify(created.billing_address)}`);

      log(`\n=== Step 3: Verifying saved order ===`);
      const verifyRes = await makeRequest('GET', `/items/orders/${created.id}`, null);
      const verified = verifyRes.data.data;
      log(`Verified Shipping Address: ${JSON.stringify(verified.shipping_address)}`);
      log(`Verified Billing Address: ${JSON.stringify(verified.billing_address)}`);
    } else {
      log(`Error Response: ${JSON.stringify(createRes.data, null, 2)}`);
    }
  } catch (error) {
    log(`Error: ${error.message}`);
    log(`Stack: ${error.stack}`);
  }
}

test();
