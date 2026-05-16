/**
 * Stripe Webhook - 处理付款成功 + 自动邮件通知
 * yaopulife 自动收款系统
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];

  // 记录请求信息
  console.log('Webhook received');
  console.log('Has signature:', !!sig);
  console.log('Has webhook secret:', !!webhookSecret);

  // 如果没有配置 webhook secret，跳过验证（开发模式）
  if (!webhookSecret) {
    console.log('STRIPE_WEBHOOK_SECRET not configured, processing in dev mode');
    
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const session = body?.data?.object;
      
      if (session?.id) {
        console.log('Dev mode: Order received:', session.id);
        
        const orderData = {
          orderId: session.id,
          customerEmail: session.customer_email || session.customer_details?.email,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          productName: session.metadata?.productName || 'Custom Gift',
          customization: session.metadata?.customization || '',
        };
        
        // 开发模式只打印，不发送邮件
        console.log('Order data:', JSON.stringify(orderData));
      }
      
      return res.status(200).json({ received: true, mode: 'dev' });
    } catch (e) {
      console.log('Dev mode parse error:', e.message);
      return res.status(200).json({ received: true });
    }
  }

  // 生产模式：需要配置完整的 stripe
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const rawBody = req.body;
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    
    console.log('Event type:', event.type);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Payment successful:', session.id);
      
      const orderData = {
        orderId: session.id,
        customerEmail: session.customer_email,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        productName: session.metadata?.productName || 'Custom Gift',
        customization: session.metadata?.customization || '',
      };
      
      // 发送邮件
      await sendEmails(orderData);
      
      console.log('Order processed:', orderData.orderId);
    }
    
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send('Webhook Error: ' + err.message);
  }
}

async function sendEmails(order) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'liangzhikeng@163.com';
  
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not configured, skipping emails');
    return;
  }
  
  const customerHtml = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;"><h1 style="color: #1a1a1a; text-align: center;">Thank You for Your Order!</h1><div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0;"><h2 style="color: #166534; margin-top: 0;">Your Custom Gift is Being Prepared</h2><p><strong>Order ID:</strong> ' + order.orderId.slice(-12).toUpperCase() + '</p><p><strong>Total:</strong> $' + order.amount + '</p></div><div style="background: #f9fafb; border-radius: 8px; padding: 20px;"><h3>What happens next?</h3><ol><li><strong>Design Preview (24h)</strong> - We will email you a custom design preview</li><li><strong>Your Approval</strong> - Review and approve</li><li><strong>Crafting (5-18 days)</strong> - Our artisans handcraft your piece</li><li><strong>Quality Check & Ship</strong> - Carefully packaged and shipped worldwide</li></ol></div></div>';
  
  const adminHtml = '<div style="font-family: Arial, sans-serif; max-width: 600px;"><h1 style="color: #dc2626;">New Order Received!</h1><div style="background: #fef2f2; padding: 20px; border-left: 4px solid #dc2626;"><p><strong>Order ID:</strong> ' + order.orderId.slice(-12).toUpperCase() + '</p><p><strong>Amount:</strong> <span style="color: #166534; font-size: 20px;">$' + order.amount + '</span></p><p><strong>Customer:</strong> ' + order.customerEmail + '</p><p><strong>Product:</strong> ' + order.productName + '</p></div></div>';
  
  // 发送客户邮件
  if (order.customerEmail) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'yaopulife <orders@yaopulife.com>',
        to: [order.customerEmail],
        subject: 'Order Confirmed - ' + order.productName + ' | yaopulife',
        html: customerHtml,
      }),
    }).catch(e => console.error('Customer email failed:', e.message));
  }
  
  // 发送管理员邮件
  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + RESEND_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'yaopulife <orders@yaopulife.com>',
      to: [ADMIN_EMAIL],
      subject: '[ORDER] New order - $' + order.amount + ' | ' + order.productName,
      html: adminHtml,
    }),
  }).catch(e => console.error('Admin email failed:', e.message));
}

export const config = {
  api: {
    bodyParser: false,
  },
};