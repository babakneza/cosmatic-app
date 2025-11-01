const axios = require('axios');

const API_URL = 'https://admin.buyjan.com';
const TOKEN = '1phLsCeVpTswZCaNuz9YkgYCdK3IkT7h';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testOrderAPI() {
  try {
    console.log('=== Step 1: Fetch Orders Table Structure ===');
    const ordersResponse = await api.get('/items/orders?limit=1&fields=*');
    console.log('Orders Response Status:', ordersResponse.status);
    
    if (ordersResponse.data.data && ordersResponse.data.data.length > 0) {
      const firstOrder = ordersResponse.data.data[0];
      console.log('\n=== First Order Fields ===');
      console.log('Keys:', Object.keys(firstOrder));
      console.log('ID:', firstOrder.id);
      console.log('Order Number:', firstOrder.order_number);
      console.log('Shipping Address:', JSON.stringify(firstOrder.shipping_address, null, 2));
      console.log('Billing Address:', JSON.stringify(firstOrder.billing_address, null, 2));
    } else {
      console.log('No orders found');
    }

    console.log('\n=== Step 2: Create Test Order with JSON Addresses ===');
    const newOrder = await api.post('/items/orders', {
      order_number: `TEST-${Date.now()}`,
      customer: 1,
      customer_email: 'test@test.com',
      status: 'pending',
      payment_status: 'pending',
      shipping_address: {
        first_name: 'Mohammad',
        last_name: 'Akbari',
        address_line_1: 'No 35 - Way 1400 - Bowsher',
        address_line_2: 'building',
        city: 'Muscat',
        state: 'muscat',
        postal_code: '12345',
        phone_number: '+96891372715',
        type: 'shipping',
        countries: 7,
        is_default: true
      },
      billing_address: {
        first_name: 'Mohammad',
        last_name: 'Akbari',
        address_line_1: 'No 35 - Way 1400 - Bowsher',
        address_line_2: 'building',
        city: 'Muscat',
        state: 'muscat',
        postal_code: '12345',
        phone_number: '+96891372715',
        type: 'billing',
        countries: 7
      },
      subtotal: 100,
      tax_rate: 0,
      tax_amount: 0,
      shipping_cost: 10,
      discount_amount: 0,
      total: 110,
      payment_method: 'cash_on_delivery'
    });

    console.log('Created Order Response Status:', newOrder.status);
    const createdOrderId = newOrder.data.data.id;
    console.log('Created Order ID:', createdOrderId);
    console.log('Created Order Number:', newOrder.data.data.order_number);
    console.log('Saved Shipping Address:', JSON.stringify(newOrder.data.data.shipping_address, null, 2));
    console.log('Saved Billing Address:', JSON.stringify(newOrder.data.data.billing_address, null, 2));

    console.log('\n=== Step 3: Verify Saved Order ===');
    const verifyResponse = await api.get(`/items/orders/${createdOrderId}`);
    console.log('Verified Shipping Address:', JSON.stringify(verifyResponse.data.data.shipping_address, null, 2));
    console.log('Verified Billing Address:', JSON.stringify(verifyResponse.data.data.billing_address, null, 2));

  } catch (error) {
    console.error('\n=== ERROR ===');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testOrderAPI();
