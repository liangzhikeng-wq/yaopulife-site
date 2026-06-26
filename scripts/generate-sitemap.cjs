/**
 * yaopulife 自动生成 sitemap.xml
 * 包含所有产品页、博客页、分类页
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://yaopulife.com';
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

// 读取内容集合
function getAllPages() {
  const pages = [];
  
  // 首页
  pages.push({ url: '/', priority: '1.0', changefreq: 'daily' });
  
  // 分类页
  pages.push({ url: '/shop', priority: '0.9', changefreq: 'weekly' });
  
  // 产品页：白名单（与 product/[id].astro / shop.astro 一致），用 sku slug 作 URL，避免退役品 404
  const LIVE_SKUS = ['PHONE-CASE-001'];
  LIVE_SKUS.forEach(sku => {
    pages.push({ url: `/product/${sku.toLowerCase()}`, priority: '0.8', changefreq: 'weekly' });
  });
  
  // 博客页
  const blogSlugs = [
    'diy-gift-ideas-2026',
    'pet-portrait-memorial-guide',
    'wedding-gift-guide-2026',
    'personalized-home-decor-trends',
    'how-to-customize-gifts',
    'valentines-diy-gift-guide-2026',
    'mothers-day-gift-guide-2026',
    'custom-pet-portrait-guide',
    'handmade-birthday-gift-guide-2026',
    'ocean-themed-home-decor-ideas',
    'trending-custom-gift-ideas-2026'
  ];
  
  blogSlugs.forEach(slug => {
    pages.push({ url: `/blog/${slug}`, priority: '0.7', changefreq: 'monthly' });
  });
  
  // 其他页面
  pages.push({ url: '/about', priority: '0.6', changefreq: 'monthly' });
  pages.push({ url: '/how-it-works', priority: '0.7', changefreq: 'monthly' });
  pages.push({ url: '/contact', priority: '0.5', changefreq: 'yearly' });
  pages.push({ url: '/shipping-and-returns', priority: '0.5', changefreq: 'yearly' });
  pages.push({ url: '/terms-of-service', priority: '0.5', changefreq: 'yearly' });
  
  return pages;
}

// 生成 sitemap XML
function generateSitemap() {
  const pages = getAllPages();
  const now = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;
  
  pages.forEach(page => {
    xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });
  
  xml += '</urlset>';
  
  fs.writeFileSync(OUTPUT_FILE, xml);
  console.log(`Sitemap generated: ${OUTPUT_FILE}`);
  console.log(`Total pages: ${pages.length}`);
}

// 执行
generateSitemap();
