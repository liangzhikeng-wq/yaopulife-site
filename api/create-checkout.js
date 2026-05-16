/**
 * Stripe Payment API - yaopulife
 * 自动收款 + 订单处理
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, productName, price, customerEmail, customization } = req.body;

  if (!productId || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 创建 Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName || 'Custom Gift',
              description: customization ? `Customization: ${customization}` : 'Handcrafted custom gift from yaopulife',
              images: req.body.images || [],
            },
            unit_amount: Math.round(parseFloat(price) * 100), // 转换为分
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SITE_URL || 'https://yaopulife.com'}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL || 'https://yaopulife.com'}/order/cancel`,
      customer_email: customerEmail,
      metadata: {
        productId: productId,
        productName: productName || 'Custom Gift',
        price: price,
        customization: customization || '',
        source: 'website'
      },
      custom_text: {
        submit: {
          message: 'Your custom gift will be crafted with care. Production takes 5-18 days.',
        },
      },
    });

    res.status(200).json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
}