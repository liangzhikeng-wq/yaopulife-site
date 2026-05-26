/**
 * Contact Form API - yaopulife
 */
export const prerender = false;

export const config = {
  api: {
    bodyParser: true,
  },
};

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
    const { name, email, interest, budget, timeline, message, privacy } = req.body || {};

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    if (!privacy) {
      return res.status(400).json({ error: 'You must agree to the privacy policy' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Build email content
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeInterest = escapeHtml(interest || 'Not specified');
    const safeBudget = escapeHtml(budget || 'Not specified');
    const safeTimeline = escapeHtml(timeline || 'Not specified');
    const safeMessage = escapeHtml(message);

    const emailContent = {
      to: 'hello@yaopulife.com',
      from: 'noreply@yaopulife.com',
      replyTo: email,
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
      text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nProduct: ${interest || 'N/A'}\nBudget: ${budget || 'N/A'}\nTimeline: ${timeline || 'N/A'}\n\nMessage:\n${message}\n\n---\nSubmitted: ${new Date().toISOString()}`
    };

    // Check if Resend API key is configured
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (RESEND_API_KEY) {
      // Send via Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailContent)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Resend error:', errorData);
        return res.status(500).json({ error: 'Failed to send email', details: errorData });
      }

      return res.status(200).json({
        success: true,
        message: 'Thank you! We will respond within 2 business hours.'
      });
    } else {
      // Fallback: Log to console (for development)
      console.log('Contact form submission:', emailContent);

      return res.status(200).json({
        success: true,
        message: 'Thank you! Your inquiry has been received. We will respond within 2 business hours.'
      });
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Failed to process request. Please try again.' });
  }
}
