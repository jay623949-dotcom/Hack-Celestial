const http = require('http');

function postJSON(path, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testEndpoint() {
  console.log('1. Testing POST /api/v1/ai/analyze with missing context...');
  const res1 = await postJSON('/api/v1/ai/analyze', {});
  console.log('Status:', res1.status);
  console.log('Response:', JSON.stringify(res1.body));

  console.log('\n2. Testing POST /api/v1/ai/analyze with invalid context...');
  const res2 = await postJSON('/api/v1/ai/analyze', { context: { invalid: true } });
  console.log('Status:', res2.status);
  console.log('Response:', JSON.stringify(res2.body));

  console.log('\n3. Testing POST /api/v1/ai/analyze with valid context structure (checking API key handling)...');
  const validContext = {
    context_id: 'ctx-test-01',
    schema_version: '1.0',
    created_at: new Date().toISOString(),
    resort: {
      id: 'resort-001',
      name: 'The Grand Azure Bay Resort & Villas',
      location: 'Goa, India',
    },
    trigger: {
      type: 'vip_early_arrival',
      description: 'Diamond VIP arrived at front desk 20m early',
    },
    rooms: [],
    staff: [],
    incidents: [],
  };
  const res3 = await postJSON('/api/v1/ai/analyze', { context: validContext });
  console.log('Status:', res3.status);
  console.log('Response:', JSON.stringify(res3.body));
}

testEndpoint().catch(console.error);
