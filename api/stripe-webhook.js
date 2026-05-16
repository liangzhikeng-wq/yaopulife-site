/**
 * Stripe Webhook - 处理付款成功 + 自动邮件通知
 * yaopulife 自动收款系统
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_placeholder';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'liangzhikeng@163.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  const rawBody = req.body;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Payment successful:', session.id);

      const orderData = {
        orderId: session.id,
        customerEmail: session.customer_email,
        amount: session.amount_total ? session.amount_total / 100 : session.metadata?.price,
        productId: session.metadata?.productId || 'Custom Gift',
        productName: session.metadata?.productName || 'Custom Gift',
        customization: session.metadata?.customization || '',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString()
      };

      await sendCustomerEmail(orderData);
      await sendAdminEmail(orderData);

      console.log('Order processed:', orderData.orderId);
      break;
    }

    default:
      console.log('Unhandled event type:', event.type);
  }

  res.status(200).json({ received: true });
}

async function sendCustomerEmail(order) {
  if (!RESEND_API_KEY || RESEND_API_KEY === 're_placeholder' || RESEND_API_KEY === 're_bw79QtV5_5g2dbJkr5ciwcH8ABfSf39Hz') {
    console.log('RESEND_API_KEY configured, sending customer email to:', order.customerEmail);
  }

  const html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #1a1a1a; text-align: center;">Thank You for Your Order!</h1><div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0;"><h2 style="color: #166534; margin-top: 0;">Your Custom Gift is Being Prepared</h2><p style="color: #166534;">Order ID: <strong>' + order.orderId.slice(-12).toUpperCase() + '</strong></p><p style="color: #166534;">Total: <strong>$' + order.amount + '</strong></p></div><div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;"><h3 style="color: #374151; margin-top: 0;">What happens next?</h3><ol style="color: #6b7280; line-height: 1.8;"><li><strong>Design Preview (24h)</strong> - We will email you a custom design preview</li><li><strong>Your Approval</strong> - Review and approve or request changes</li><li><strong>Crafting (5-18 days)</strong> - Our artisans handcraft your piece</li><li><strong>Quality Check & Ship</strong> - Carefully packaged and shipped worldwide</li></ol></div><p style="color: #6b7280; font-size: 14px; text-align: center;">Questions? Reply to this email or contact <a href="mailto:support@yaopulife.com" style="color: #2563eb;">support@yaopulife.com</a></p><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"><p style="color: #9ca3af; font-size: 12px; text-align: center;">yaopulife - Handcrafted with love<br/><a href="https://yaopulife.com" style="color: #2563eb;">https://yaopulife.com</a></p></div>';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'yaopulife <orders@yaopulife.com>',
        to: [order.customerEmail],
        subject: 'Order Confirmed - ' + order.productName + ' | yaopulife',
        html: html,
      }),
    });
    console.log('Customer email sent to:', order.customerEmail);
  } catch (error) {
    console.error('Failed to send customer email:', error);
  }
}

async function sendAdminEmail(order) {
  const html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #dc2626;">New Order Received!</h1><div style="background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0;"><h2 style="color: #991b1b; margin-top: 0;">Order Details</h2><p><strong>Order ID:</strong> ' + order.orderId.slice(-12).toUpperCase() + '</p><p><strong>Amount:</strong> <span style="color: #166534; font-size: 20px;">$' + order.amount + '</span></p><p><strong>Customer:</strong> <a href="mailto:' + order.customerEmail + '" style="color: #2563eb;">' + order.customerEmail + '</a></p><p><strong>Product:</strong> ' + order.productName + '</p>' + (order.customization ? '<p><strong>Customization:</strong> ' + order.customization + '</p>' : '') + '</div><p>Log in to <a href="https://dashboard.stripe.com" style="color: #2563eb;">Stripe Dashboard</a> to process this order.</p></div>';

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'yaopulife <orders@yaopulife.com>',
        to: [ADMIN_EMAIL],
        subject: '[ORDER] New order - $' + order.amount + ' | ' + order.productName,
        html: html,
      }),
    });
    console.log('Admin notification sent to:', ADMIN_EMAIL);
  } catch (error) {
    console.error('Failed to send admin email:', error);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};