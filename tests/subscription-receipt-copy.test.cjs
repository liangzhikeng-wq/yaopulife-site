const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const storyCta = fs.readFileSync(path.join(root, 'src/components/StoryCTA.astro'), 'utf8');
const subscribeApi = fs.readFileSync(path.join(root, 'api/subscribe.js'), 'utf8');

test('lead form copy describes interest submission without newsletter promises', () => {
  assert.match(storyCta, />Stay connected with YAOPU<\/h3>/);
  assert.match(storyCta, />Share your email to express your interest in our cultural resources\.<\/p>/);
  assert.match(storyCta, />Send my email<\/button>/);
  assert.match(storyCta, />Thanks! Your email address has been submitted\.<\/p>/);

  for (const unsupported of [
    /More myths, in your inbox/,
    /free classroom packs/i,
    /No spam/,
    /Subscribe/,
    /New myths are on the way/,
    /connect with our team/i,
    /received by our team/i,
    /Our team has received/i,
    /tell us what you'd like to see/i,
    /may reach out/i,
  ]) {
    assert.doesNotMatch(storyCta, unsupported);
  }

  assert.match(subscribeApi, /message: 'Thanks! Your email address has been submitted\.'/);
  assert.doesNotMatch(subscribeApi, /message: 'Thanks for subscribing!'/);
});

test('receipt-copy correction keeps the existing notification-only path', () => {
  assert.match(storyCta, /JSON\.stringify\(\{ email: email, source: src \}\)/);
  assert.match(subscribeApi, /https:\/\/api\.resend\.com\/emails/);
  assert.match(subscribeApi, /to: toEmail/);
  assert.match(subscribeApi, /replyTo: email/);
  assert.doesNotMatch(subscribeApi, /fetch\([^)]*audiences\/.+contacts/);
});
