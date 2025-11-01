const fetch = require('node-fetch');

const directusUrl = 'https://admin.buyjan.com';
const token = '1phLsCeVpTswZCaNuz9YkgYCdK3IkT7h';

async function testAPI() {
    try {
        console.log('Fetching products from Directus...');

        const response = await fetch(`${directusUrl}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                query: `
                    query {
                        products(limit: 1) {
                            id
                            name
                            images {
                                directus_files_id
                                id
                            }
                            main_image
                        }
                    }
                `
            })
        });

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPI();