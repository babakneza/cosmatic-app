const https = require('https');

const directusUrl = 'admin.buyjan.com';
const token = '1phLsCeVpTswZCaNuz9YkgYCdK3IkT7h';

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
  try {
    console.log('=== Fetching existing orders ===');
    const getRes = await makeRequest('GET', '/items/orders?limit=1', null);
    console.log('Status:', getRes.status);
    if (getRes.data.data && getRes.data.data[0]) {
      const order = getRes.data.data[0];
      console.log('Order ID:', order.id);
      console.log('Order Number:', order.order_number);
      console.log('Shipping Address Type:', typeof order.shipping_address);
      console.log('Shipping Address:', order.shipping_address);
      console.log('Billing Address:', order.billing_address);
    }

    console.log('\n=== Creating test order ===');
    const testOrder = {
      order_number: `TEST-${Date.now()}`,
      customer: 1,
      customer_email: 'test@buyjan.com',
      status: 'pending',
      payment_status: 'pending',
      shipping_address: {
        first_name: 'Test',
        last_name: 'User',
        address_line_1: 'Test Street',
        city: 'Muscat',
        state: 'muscat',
        postal_code: '12345',
        countries: 7,
        type: 'shipping'
      },
      billing_address: {
        first_name: 'Test',
        last_name: 'User',
        address_line_1: 'Test Street',
        city: 'Muscat',
        state: 'muscat',
        postal_code: '12345',
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

    console.log('Creating order with payload:', JSON.stringify(testOrder, null, 2));
    const createRes = await makeRequest('POST', '/items/orders', testOrder);
    console.log('Status:', createRes.status);
    
    if (createRes.status === 201 || createRes.status === 200) {
      const created = createRes.data.data;
      console.log('Created Order ID:', created.id);
      console.log('Shipping Address Saved:', created.shipping_address);
      console.log('Billing Address Saved:', created.billing_address);

      console.log('\n=== Verifying saved order ===');
      const verifyRes = await makeRequest('GET', `/items/orders/${created.id}`, null);
      const verified = verifyRes.data.data;
      console.log('Verified Shipping Address:', verified.shipping_address);
      console.log('Verified Billing Address:', verified.billing_address);
    } else {
      console.log('Error creating order:', createRes.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
