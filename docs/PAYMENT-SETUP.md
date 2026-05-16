# yaopulife 自动化收款配置指南

## 你需要做的事情（激活自动化）

### 1. Stripe 配置（5分钟）

1. 访问 https://dashboard.stripe.com/register 注册账号
2. 完成商家验证后，获取：
   - **STRIPE_SECRET_KEY**: Stripe Dashboard → Developers → API Keys → Secret key
   - **STRIPE_WEBHOOK_SECRET**: 需要配置 Webhook

3. 配置 Webhook:
   - Stripe Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://yaopulife.com/api/stripe-webhook`
   - Events to listen: `checkout.session.completed`, `payment_intent.payment_failed`
   - 复制 Signing Secret 到 `STRIPE_WEBHOOK_SECRET`

### 2. Resend 邮件配置（5分钟）

1. 访问 https://resend.com 注册账号
2. 验证你的域名 `yaopulife.com`
3. 获取 API Key: Settings → API Keys → Create API Key
4. 复制 `RESEND_API_KEY`

### 3. Vercel 环境变量配置

在 Vercel Dashboard → your project → Settings → Environment Variables:

| Name | Value | Environments |
|------|-------|--------------|
| STRIPE_SECRET_KEY | sk_live_xxxx | Production, Preview |
| STRIPE_WEBHOOK_SECRET | whsec_xxxx | Production, Preview |
| RESEND_API_KEY | re_xxxx | Production, Preview |
| SITE_URL | https://yaopulife.com | Production, Preview |
| ADMIN_EMAIL | your@email.com | Production, Preview |

### 4. 完成后

配置完成后：
- 客户点击 "Buy Now" → Stripe Checkout → 付款 → 自动邮件通知
- 你会收到订单邮件，包含客户需求和金额
- 你回复客户确认细节 → 开始制作 → 发货

---

## 当前功能状态

| 功能 | 状态 | 说明 |
|------|------|------|
| Stripe收款 | 已开发，需配置Key | 客户可直接购买 |
| 订单成功页 | ✅ 已完成 | /order/success |
| 订单取消页 | ✅ 已完成 | /order/cancel |
| 自动邮件 | 已开发，需Resend Key | 付款后发送确认 |

---

## 快速测试

配置完成后，你可以：
1. 访问任意产品页（如 /product/1）
2. 点击 "Buy Now" 按钮
3. 测试 Stripe Checkout 流程