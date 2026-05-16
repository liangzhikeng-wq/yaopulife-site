/**
 * Multi-Payment Gateway - yaopulife
 * 支持：Stripe / PayPal / Ping++ / Airwallex
 * 
 * 使用方式：
 * 1. 配置各支付平台的 API Keys 到环境变量
 * 2. 前端选择支付方式，调用 /api/create-payment
 */

const fs = require('fs');
const path = require('path');

// 支付网关配置
const GATEWAYS = {
  stripe: {
    name: 'Stripe',
    icon: '/images/stripe.svg',
    currencies: ['USD', 'EUR', 'GBP'],
    fee: '2.9% + $0.30',
    description: 'Credit/Debit Card',
    keys: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
  },
  paypal: {
    name: 'PayPal',
    icon: '/images/paypal.svg',
    currencies: ['USD', 'CNY', 'EUR'],
    fee: '3.7% + $0.30',
    description: 'PayPal, Credit Card, Bank Transfer',
    keys: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET']
  },
  pingpp: {
    name: 'Ping++',
    icon: '/images/pingpp.svg',
    currencies: ['CNY'],
    fee: '0.6% - 1.2%',
    description: 'WeChat Pay, Alipay, Bank Card',
    keys: ['PINGPP_API_KEY', 'PINGPP_APP_ID']
  },
  airwallex: {
    name: 'Airwallex',
    icon: '/images/airwallex.svg',
    currencies: ['USD', 'CNY', 'EUR', 'GBP'],
    fee: '0.5% - 0.7%',
    description: 'International Cards, WeChat, Alipay',
    keys: ['AIRWALLEX_API_KEY', 'AIRWALLEX_MERCHANT_ID']
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { gateway, amount, currency, productId, productName, customerEmail, description } = req.body;

  if (!gateway || !amount) {
    return res.status(400).json({ error: 'Missing required fields: gateway, amount' });
  }

  try {
    let result;

    switch (gateway) {
      case 'stripe':
        result = await createStripePayment(req, res, { amount, currency, productId, productName, customerEmail, description });
        break;
      case 'paypal':
        result = await createPayPalPayment(req, res, { amount, currency, productId, productName, customerEmail, description });
        break;
      case 'pingpp':
        result = await createPingPPPayment(req, res, { amount, currency, productId, productName, customerEmail, description });
        break;
      case 'airwallex':
        result = await createAirwallexPayment(req, res, { amount, currency, productId, productName, customerEmail, description });
        break;
      default:
        return res.status(400).json({ error: 'Unknown gateway: ' + gateway });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: 'Payment creation failed: ' + error.message });
  }
}

// ========== Stripe 支付 ==========
async function createStripePayment(req, res, options) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  if (!process.env.STRIPE_SECRET_KEY) {
    return { success: false, error: 'Stripe not configured', config: GATEWAYS.stripe.keys };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: options.currency || 'usd',
        product_data: {
          name: options.productName || 'Custom Gift',
          description: options.description || 'Handcrafted custom gift from yaopulife',
        },
        unit_amount: Math.round(parseFloat(options.amount) * 100),
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.SITE_URL || 'https://yaopulife.com'}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL || 'https://yaopulife.com'}/order/cancel`,
    customer_email: options.customerEmail,
    metadata: {
      productId: options.productId,
      productName: options.productName,
      gateway: 'stripe'
    },
  });

  return { success: true, gateway: 'stripe', url: session.url, sessionId: session.id };
}

// ========== PayPal 支付 ==========
async function createPayPalPayment(req, res, options) {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return { success: false, error: 'PayPal not configured', config: GATEWAYS.paypal.keys };
  }

  // 获取 Access Token
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_CLIENT_SECRET).toString('base64');
  const tokenResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  });
  
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // 创建订单
  const orderResponse = await fetch('https://api-m.sandbox.paypal.com/v2/checkout/orders', {
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
  
  // 找到 PayPal 结算链接
  const approvalUrl = orderData.links.find(link => link.rel === 'approve').href;

  return { 
    success: true, 
    gateway: 'paypal', 
    url: approvalUrl, 
    orderId: orderData.id 
  };
}

// ========== Ping++ 支付 ==========
async function createPingPPPayment(req, res, options) {
  const PINGPP_API_KEY = process.env.PINGPP_API_KEY;
  const PINGPP_APP_ID = process.env.PINGPP_APP_ID;

  if (!PINGPP_API_KEY || !PINGPP_APP_ID) {
    return { success: false, error: 'Ping++ not configured', config: GATEWAYS.pingpp.keys };
  }

  // Ping++ 使用 REST API
  const auth = Buffer.from(PINGPP_API_KEY + ':').toString('base64');
  
  const chargeResponse = await fetch('https://api.pingxx.com/v1/charges', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_no: 'yaopulife_' + Date.now(),
      app: { id: PINGPP_APP_ID },
      channel: 'alipay', // 默认支付宝，可扩展 wx/bfb/unionpay
      amount: Math.round(parseFloat(options.amount) * 100), // 分为单位
      currency: 'cny',
      subject: options.productName || 'Custom Gift',
      body: options.description || 'Handcrafted custom gift',
      client_ip: req.headers['x-forwarded-for'] || '127.0.0.1',
      metadata: { productId: options.productId }
    })
  });

  const chargeData = await chargeResponse.json();
  
  return { 
    success: true, 
    gateway: 'pingpp', 
    credential: chargeData.credential,
    chargeId: chargeData.id,
    // Ping++ 返回的是客户端 SDK 需要的凭证
    display: chargeData.credential 
  };
}

// ========== Airwallex 支付 ==========
async function createAirwallexPayment(req, res, options) {
  const AIRWALLEX_API_KEY = process.env.AIRWALLEX_API_KEY;
  const AIRWALLEX_MERCHANT_ID = process.env.AIRWALLEX_MERCHANT_ID;

  if (!AIRWALLEX_API_KEY || !AIRWALLEX_MERCHANT_ID) {
    return { success: false, error: 'Airwallex not configured', config: GATEWAYS.airwallex.keys };
  }

  // Airwallex Payment Intent API
  const paymentResponse = await fetch('https://api.airwallex.com/api/v1/payment_intents/create', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + AIRWALLEX_API_KEY,
      'Content-Type': 'application/json',
      'x-api-key': AIRWALLEX_API_KEY,
    },
    body: JSON.stringify({
      amount: parseFloat(options.amount).toFixed(2),
      currency: options.currency || 'USD',
      merchant_order_id: 'yaopulife_' + Date.now(),
      descriptor: 'yaopulife Custom Gift',
      metadata: {
        productId: options.productId,
        productName: options.productName
      }
    })
  });

  const paymentData = await paymentResponse.json();

  return { 
    success: true, 
    gateway: 'airwallex', 
    clientSecret: paymentData.client_secret,
    intentId: paymentData.id
  };
}

// ========== 获取可用支付网关 ==========
export async function getGateways(req, res) {
  const available = [];
  
  for (const [key, gateway] of Object.entries(GATEWAYS)) {
    const hasKeys = gateway.keys.every(k => process.env[k]);
    available.push({
      id: key,
      name: gateway.name,
      icon: gateway.icon,
      description: gateway.description,
      fee: gateway.fee,
      currencies: gateway.currencies,
      configured: hasKeys
    });
  }

  return res.status(200).json({ gateways: available });
}

// ========== Webhook 处理 ==========
export async function webhookHandler(req, res) {
  const gateway = req.query.gateway;
  const sig = req.headers['stripe-signature'];

  switch (gateway) {
    case 'stripe':
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        return res.status(200).json({ received: true });
      }
      // Stripe webhook 处理在 stripe-webhook.js
      break;
    case 'pingpp':
      // Ping++ 回调处理
      const pingEvent = req.body;
      console.log('Ping++ webhook:', pingEvent.type, pingEvent.id);
      break;
    case 'airwallex':
      // Airwallex 回调处理
      const airEvent = req.body;
      console.log('Airwallex webhook:', airEvent.type, airEvent.id);
      break;
  }

  return res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};