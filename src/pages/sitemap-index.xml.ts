import type { APIRoute } from 'astro';

const pages = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: '/shop', priority: '0.9', changefreq: 'weekly' },
  { path: '/product/phone-case-001', priority: '0.9', changefreq: 'weekly' },
  { path: '/how-it-works', priority: '0.7', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/shipping-and-returns', priority: '0.4', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
];

// pet 博客已随纯手机壳店重定位下架，不再进 sitemap
const blogPosts: string[] = [];

export const GET: APIRoute = async () => {
  const baseUrl = 'https://yaopulife.com';
  const now = new Date().toISOString();

  const urls = [
    ...pages.map(p => ({ loc: `${baseUrl}${p.path}`, changefreq: p.changefreq, priority: p.priority })),
    ...blogPosts.map(slug => ({ loc: `${baseUrl}/blog/${slug}`, changefreq: 'monthly', priority: '0.7' })),
  ];

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
