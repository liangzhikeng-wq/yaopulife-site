/**
 * PayPal Payment Gateway API for Vercel
 */
export const prerender = false;

export const config = {
  api: {
    bodyParser: true,
  },
};

const GATEWAYS = {
  paypal: {
    name: 'PayPal',
    keys: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET']
  }
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { gateway, amount, currency, productId, productName, customerEmail, description } = req.body || {};

    if (!gateway || !amount) {
      return res.status(400).json({ error: 'Missing required fields: gateway, amount' });
    }

    if (gateway !== 'paypal') {
      return res.status(400).json({ error: 'Only PayPal is currently supported' });
    }

    const result = await createPayPalPayment({ amount, currency, productId, productName, customerEmail, description });
    return res.status(200).json(result);

  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: 'Payment creation failed: ' + error.message });
  }
}

async function createPayPalPayment(options) {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return { success: false, error: 'PayPal not configured', config: GATEWAYS.paypal.keys };
  }

  const isSandbox = PAYPAL_CLIENT_ID.includes('sandbox') || PAYPAL_CLIENT_ID.includes('SB');
  const baseUrl = isSandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';

  const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_CLIENT_SECRET).toString('base64');
  const tokenResponse = await fetch(baseUrl + '/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return { success: false, error: 'Failed to get PayPal access token', details: tokenData };
  }

  const orderResponse = await fetch(baseUrl + '/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: options.currency || 'USD',
          value: parseFloat(options.amount).toFixed(2)
        },
        description: options.productName || 'Custom Gift',
        custom_id: options.productId
      }]
    })
  });

  const orderData = await orderResponse.json();

  if (!orderData.id) {
    return { success: false, error: 'Failed to create PayPal order', details: orderData };
  }

  const approvalUrl = orderData.links?.find(link => link.rel === 'approve')?.href;

  return {
    success: true,
    gateway: 'paypal',
    url: approvalUrl,
    orderId: orderData.id
  };
}