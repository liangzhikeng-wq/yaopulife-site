import type { APIRoute } from 'astro';

const pages = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: '/myths', priority: '0.9', changefreq: 'weekly' },
  { path: '/wukong', priority: '0.9', changefreq: 'weekly' },
  { path: '/nezha', priority: '0.9', changefreq: 'weekly' },
  { path: '/houyi', priority: '0.9', changefreq: 'weekly' },
  { path: '/jingwei', priority: '0.8', changefreq: 'weekly' },
  { path: '/xingtian', priority: '0.8', changefreq: 'weekly' },
  { path: '/whitesnake', priority: '0.9', changefreq: 'weekly' },
  { path: '/shanhaijing', priority: '0.9', changefreq: 'weekly' },
  { path: '/changge', priority: '0.9', changefreq: 'weekly' },
  { path: '/zodiac', priority: '0.8', changefreq: 'monthly' },
  { path: '/festivals', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
];

export const GET: APIRoute = async () => {
  const baseUrl = 'https://yaopulife.com';
  const now = new Date().toISOString();

  const urls = pages.map(p => ({ loc: `${baseUrl}${p.path}`, changefreq: p.changefreq, priority: p.priority }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
};
