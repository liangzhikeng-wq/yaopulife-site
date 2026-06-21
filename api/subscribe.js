/**
 * Newsletter Subscribe API - yaopulife
 * Previously the newsletter form only console.logged and faked success.
 * This captures the email and notifies the owner via Resend so no signup is lost.
 * Env (production): RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL (optional).
 * TODO: when a Resend Audience is created, also POST to /audiences/:id/contacts
 *       (set NEWSLETTER_AUDIENCE_ID) to build a real mailing list.
 */
export const prerender = false;

export const config = { api: { bodyParser: true } };

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

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
    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || 'hello@yaopulife.com';
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'noreply@yaopulife.com';
    const safeEmail = escapeHtml(email);

    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toEmail,
          from: fromEmail,
          replyTo: email,
          subject: `[Newsletter] New subscriber: ${email}`,
          html: `<h2>New newsletter subscriber</h2><p>Email: <a href="mailto:${safeEmail}">${safeEmail}</a></p><p style="color:#666;font-size:12px;">Submitted: ${new Date().toISOString()}<br>Source: yaopulife.com</p>`,
          text: `New newsletter subscriber: ${email}\nSubmitted: ${new Date().toISOString()}`,
        }),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        console.error('Resend error (subscribe):', detail);
        return res.status(500).json({ error: 'Subscription failed. Please try again.' });
      }
      return res.status(200).json({ success: true, message: 'Thanks for subscribing!' });
    }

    // No key configured: do not fake success.
    console.error('subscribe: RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Subscription service not configured' });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: 'Failed to process request. Please try again.' });
  }
}
