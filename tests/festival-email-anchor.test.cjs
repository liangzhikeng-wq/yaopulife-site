const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const anchor = 'email-signup';
const linkCopy = 'Explore more festival guides and our email sign-up form.';

test('festival email form has a stable anchor', () => {
  const component = read('src/components/StoryCTA.astro');
  assert.match(component, new RegExp(`<section\\s+id=["']${anchor}["']`));
});

for (const explainer of ['qixi-festival', 'double-ninth-festival']) {
  test(`${explainer} related reading links directly to the existing email form`, () => {
    const page = read(`src/pages/explainers/${explainer}.astro`);
    assert.match(page, /<h2 id="next">Related reading<\/h2>/);
    assert.match(page, new RegExp(`href=["']/festivals#${anchor}["']`));
    assert.ok(page.includes(linkCopy));
  });
}

test('the candidate does not add mailing, audience, tracking, or product claims', () => {
  for (const explainer of ['qixi-festival', 'double-ninth-festival']) {
    const page = read(`src/pages/explainers/${explainer}.astro`);
    const directLink = page.match(new RegExp(`<a\\s+href=["']/festivals#${anchor}["'][^>]*>([^<]+)<\\/a>`));
    assert.ok(directLink, `${explainer} should contain the direct email-form link`);
    assert.equal(directLink[1].trim(), linkCopy);
    assert.doesNotMatch(directLink[1], /send|deliver|audience|track|buy|purchase|paid|product/i);
  }
});
