/**
 * Contact / Inquiry API — yaopulife (Astro endpoint)
 * 询盘制核心后端：产品页 → /contact 表单 → 本端点 → Resend → 业务邮箱。
 * 迁自仓库根 /api/contact.js（在 output:'server' 模式下根级 Vercel function 不被部署，
 * 改为 Astro endpoint，路由 = /api/contact，与前端 fetch 对齐）。
 */
import type { APIRoute } from 'astro';

export const prerender = false;

function escapeHtml(value = ''): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const OPTIONS: APIRoute = () =>
  new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });

export const POST: APIRoute = async ({ request }) => {
  try {
    let payload: Record<string, unknown> = {};
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const { name, email, interest, budget, timeline, message, privacy } =
      payload as Record<string, string | boolean>;

    if (!name || !email || !message) {
      return json({ error: 'Name, email, and message are required' }, 400);
    }
    if (!privacy) {
      return json({ error: 'You must agree to the privacy policy' }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return json({ error: 'Invalid email format' }, 400);
    }

    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safeInterest = escapeHtml(String(interest || 'Not specified'));
    const safeBudget = escapeHtml(String(budget || 'Not specified'));
    const safeTimeline = escapeHtml(String(timeline || 'Not specified'));
    const safeMessage = escapeHtml(String(message));

    const emailContent = {
      to: process.env.CONTACT_TO_EMAIL || 'hello@yaopulife.com',
      from: process.env.CONTACT_FROM_EMAIL || 'noreply@yaopulife.com',
      reply_to: String(email),
      subject: `[New Inquiry] ${interest || 'Custom Order'} from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Name</td><td style="padding: 8px; border: 1px solid #ddd;">${safeName}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Product Interest</td><td style="padding: 8px; border: 1px solid #ddd;">${safeInterest}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Budget</td><td style="padding: 8px; border: 1px solid #ddd;">${safeBudget}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Timeline</td><td style="padding: 8px; border: 1px solid #ddd;">${safeTimeline}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Message</td><td style="padding: 8px; border: 1px solid #ddd;">${safeMessage}</td></tr>
        </table>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Submitted at: ${new Date().toISOString()}<br>
          Source: yaopulife.com/contact
        </p>
      `,
      text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nProduct: ${interest || 'N/A'}\nBudget: ${budget || 'N/A'}\nTimeline: ${timeline || 'N/A'}\n\nMessage:\n${message}\n\n---\nSubmitted: ${new Date().toISOString()}`,
    };

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailContent),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Resend error:', errorData);
        return json({ error: 'Failed to send email', details: errorData }, 500);
      }

      return json({
        success: true,
        message: 'Thank you! We will respond within 2 business hours.',
      });
    }

    // Fallback (no RESEND_API_KEY, e.g. local dev): log instead of send.
    console.log('Contact form submission (no RESEND_API_KEY, not sent):', emailContent);
    return json({
      success: true,
      message: 'Thank you! Your inquiry has been received. We will respond within 2 business hours.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return json({ error: 'Failed to process request. Please try again.' }, 500);
  }
};
