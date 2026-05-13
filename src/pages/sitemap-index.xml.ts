import type { APIRoute } from 'astro';

const pages = [
  '', '/shop', '/how-it-works', '/contact', '/about'
];

const products = ['1', '2', '3', '4', '5', '6'];

export const GET: APIRoute = async () => {
  const baseUrl = 'https://yaopulife.com';
  const now = new Date().toISOString();

  const urls = [
    ...pages.map(p => ({ loc: `${baseUrl}${p}`, changefreq: 'weekly', priority: p === '' ? '1.0' : '0.8' })),
    ...products.map(id => ({ loc: `${baseUrl}/product/${id}`, changefreq: 'weekly', priority: '0.6' }))
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
