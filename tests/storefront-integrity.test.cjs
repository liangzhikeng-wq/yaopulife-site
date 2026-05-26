const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const projectRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

function existsPublic(assetPath) {
  return fs.existsSync(path.join(projectRoot, 'public', assetPath.replace(/^\//, '')));
}

test('homepage featured products point to generated product pages and existing images', () => {
  const index = read('src/pages/index.astro');
  const productPage = read('src/pages/product/[id].astro');
  const productIds = new Set([...productPage.matchAll(/id:\s*"(\d+)"/g)].map(match => match[1]));
  const featuredIds = [...index.matchAll(/\{\s*id:\s*(\d+),/g)].map(match => match[1]);
  const featuredImages = [...index.matchAll(/image:\s*"([^"]+)"/g)].map(match => match[1]);

  assert.ok(featuredIds.length > 0, 'expected featured products on the homepage');
  assert.deepEqual(
    featuredIds.filter(id => !productIds.has(id)),
    [],
    'homepage should not link to product pages that are not generated'
  );
  assert.deepEqual(
    featuredImages.filter(image => !existsPublic(image)),
    [],
    'homepage featured product images should exist under public/'
  );
});

test('storefront pages do not include placeholders or unverified review claims', () => {
  const layout = read('src/layouts/Layout.astro');
  const productPage = read('src/pages/product/[id].astro');
  const trustSection = read('src/components/Testimonials.astro');

  assert.doesNotMatch(layout, /GSC_VERIFICATION_CODE/);
  assert.doesNotMatch(productPage, /aggregateRating/);
  assert.doesNotMatch(trustSection, /Real reviews|Verified Purchase|127 reviews/);
});

test('product page related blog links point to existing blog content', () => {
  const productPage = read('src/pages/product/[id].astro');
  const blogSlugs = new Set(
    fs.readdirSync(path.join(projectRoot, 'src/content/blog'))
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace(/\.md$/, ''))
  );
  const linkedSlugs = [...productPage.matchAll(/href="\/blog\/([^"]+)"/g)].map(match => match[1]);

  assert.ok(linkedSlugs.length > 0, 'expected related blog links on product pages');
  assert.deepEqual(
    linkedSlugs.filter(slug => !blogSlugs.has(slug)),
    [],
    'related blog links should point to existing content files'
  );
});

test('sitemap product URLs match generated product pages', () => {
  const productPage = read('src/pages/product/[id].astro');
  const sitemap = read('public/sitemap.xml');
  const productIds = new Set([...productPage.matchAll(/id:\s*"(\d+)"/g)].map(match => match[1]));
  const sitemapIds = [...sitemap.matchAll(/\/product\/(\d+)<\/loc>/g)].map(match => match[1]);

  assert.deepEqual(
    sitemapIds.filter(id => !productIds.has(id)),
    [],
    'sitemap should not include product pages that are not generated'
  );
  assert.deepEqual(
    [...productIds].filter(id => !sitemapIds.includes(id)),
    [],
    'sitemap should include every generated product page'
  );
});
