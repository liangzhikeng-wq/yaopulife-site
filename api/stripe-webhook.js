/**
 * Stripe Webhook - 处理付款成功
 * 自动发送邮件通知 + 更新订单状态
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 处理不同事件
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Payment successful:', session.id);

      // 提取订单信息
      const orderData = {
        orderId: session.id,
        customerEmail: session.customer_email,
        amount: session.amount_total / 100,
        productId: session.metadata?.productId,
        customization: session.metadata?.customization,
        paymentStatus: 'paid',
        createdAt: new Date().toISOString()
      };

      // 发送确认邮件给客户
      await sendOrderConfirmationEmail(orderData);

      // 发送通知邮件给你
      await sendAdminNotificationEmail(orderData);

      console.log('Order processed:', orderData);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log('Payment failed:', paymentIntent.id);
      // 可以发送失败通知邮件
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
}

// 发送订单确认邮件给客户
async function sendOrderConfirmationEmail(order) {
  // 这里将接入 Resend
  console.log('Sending confirmation email to:', order.customerEmail);
  // TODO: 调用 Resend API 发送邮件
}

// 发送订单通知邮件给你
async function sendAdminNotificationEmail(order) {
  // 这里将接入 Resend
  console.log('Sending admin notification for order:', order.orderId);
  // TODO: 调用 Resend API 发送邮件到你邮箱
}

// 禁用 Vercel 的自动 body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};