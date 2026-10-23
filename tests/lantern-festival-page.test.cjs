const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const pagePath = 'src/pages/explainers/lantern-festival.astro';

test('Lantern Festival explainer exposes a complete source-backed route', () => {
  const page = read(pagePath);

  assert.match(page, /<title>What Is the Lantern Festival\?/);
  assert.match(page, /rel="canonical" href="https:\/\/yaopulife\.com\/explainers\/lantern-festival"/);
  assert.match(page, /fifteenth day of the first lunar month/i);
  assert.match(page, /"@type": "FAQPage"/);
  assert.match(page, /https:\/\/www\.ihchina\.cn\/project_details\/15069\.html/);
  assert.match(page, /https:\/\/www\.dpm\.org\.cn\/collection\/paint\/233757\.html/);
  assert.match(page, /https:\/\/www\.xiongan\.gov\.cn\/2018-03\/02\/c_129821320\.htm/);
  assert.match(page, /practice varies by region/i);
});

test('Lantern Festival claims stay inside the verified scope', () => {
  const page = read(pagePath);

  assert.doesNotMatch(page, /oldest romance night|only night young women|originated with|began when/i);
  assert.doesNotMatch(page, /<StoryCTA|email-signup|free classroom pack|subscribe/i);
  assert.match(page, /rolled in dry glutinous rice flour/i);
  assert.match(page, /wrapped in a moistened glutinous-rice dough/i);
});

test('the page and festival hub provide deliberate internal paths', () => {
  const page = read(pagePath);
  const hub = read('src/pages/festivals.astro');

  for (const href of [
    '/festivals',
    '/explainers/qixi-festival',
    '/explainers/what-is-the-mid-autumn-festival',
    '/explainers/why-red-means-luck-in-china',
  ]) {
    assert.match(page, new RegExp(`href=["']${href}["']`));
  }

  assert.match(
    hub,
    /slug: "lantern-festival"[^\n]*link: "\/explainers\/lantern-festival"/,
    'the existing Lantern Festival entry should expose the full guide'
  );
});

test('the explainer uses the site reading column and exposes content links visually', () => {
  const page = read(pagePath);

  assert.match(page, /<main class="wrap art">/);
  assert.equal((page.match(/<section class="sec content-links">/g) || []).length, 2);
  assert.match(page, /\.content-links a\s*\{[^}]*text-decoration:\s*underline/s);
  assert.doesNotMatch(page, /connects their round form with family unity and harmony/i);
});
