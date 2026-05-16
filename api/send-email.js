/**
 * Resend Email API - yaopulife
 * 自动发送订单确认邮件和通知邮件
 */

const resendApiKey = process.env.RESEND_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, html, type } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'Missing required fields: to, subject' });
  }

  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'yaopulife <orders@yaopulife.com>',
        to: [to],
        subject: subject,
        html: html || generateDefaultHtml(subject, type),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}

// 生成默认邮件模板
function generateDefaultHtml(subject, type) {
  if (type === 'order_confirmation') {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Thank You for Your Order!</h1>
        <p>Your custom gift is being prepared with care.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #2563eb; margin-top: 0;">What's Next?</h2>
          <ol>
            <li><strong>Design Preview (24h)</strong> - We'll send you a custom design preview</li>
            <li><strong>Approval</strong> - You review and approve the design</li>
            <li><strong>Crafting (5-18 days)</strong> - Our artisans handcraft your piece</li>
            <li><strong>Quality Check</strong> - We verify quality before shipping</li>
            <li><strong>Delivery</strong> - Carefully packaged and shipped to you</li>
          </ol>
        </div>
        <p>Questions? Reply to this email or contact us at support@yaopulife.com</p>
        <p style="color: #666; font-size: 12px;">
          yaopulife - Handcrafted with love<br/>
          https://yaopulife.com
        </p>
      </div>
    `;
  }

  if (type === 'admin_notification') {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">New Order Received!</h1>
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
          <p><strong>Order ID:</strong> {{orderId}}</p>
          <p><strong>Amount:</strong> ${{amount}}</p>
          <p><strong>Customer:</strong> {{customerEmail}}</p>
          <p><strong>Product:</strong> {{productId}}</p>
          <p><strong>Customization:</strong> {{customization}}</p>
        </div>
        <p>Login to your dashboard to process this order.</p>
      </div>
    `;
  }

  // 默认模板
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${subject}
    </div>
  `;
}