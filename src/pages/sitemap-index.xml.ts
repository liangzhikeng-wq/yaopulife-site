import type { APIRoute } from 'astro';

const pages = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: '/shop', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/how-it-works', priority: '0.7', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
];

const products = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const blogPosts = [
  'best-custom-pet-portrait-gifts',
  'needle-felt-vs-embroidery-pet-portraits',
  'personalized-wedding-anniversary-gift-ideas',
  'how-custom-moon-lamps-are-made',
  'why-handmade-gifts-are-more-meaningful',
  'how-to-choose-perfect-custom-gift',
  'best-fathers-day-gifts-2026-personalized',
  'ocean-resin-art-handmade-coasters-guide',
];

export const GET: APIRoute = async () => {
  const baseUrl = 'https://yaopulife.com';
  const now = new Date().toISOString();

  const urls = [
    ...pages.map(p => ({ loc: `${baseUrl}${p.path}`, changefreq: p.changefreq, priority: p.priority })),
    ...products.map(id => ({ loc: `${baseUrl}/product/${id}`, changefreq: 'weekly', priority: '0.8' })),
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
