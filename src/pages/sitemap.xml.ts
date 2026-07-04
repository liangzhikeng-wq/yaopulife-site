import type { APIRoute } from 'astro';

// Sitemap is fully auto-discovered at build time from the .astro pages that exist,
// so no page is ever left out again (top-level + explainers). To add a page: just
// create the .astro file. To tune its priority/changefreq: add a META entry. To keep
// a page out (e.g. an error page): add it to EXCLUDE.

// Pages that must never appear in the sitemap.
const EXCLUDE = new Set(['/404']);

// Per-path SEO overrides. Anything not listed falls back to a sensible group default
// (0.9/weekly for top-level story pages, 0.8/monthly for explainers).
const META: Record<string, { priority: string; changefreq: string }> = {
  '':                  { priority: '1.0', changefreq: 'weekly' },
  '/jingwei':          { priority: '0.8', changefreq: 'weekly' },
  '/xingtian':         { priority: '0.8', changefreq: 'weekly' },
  '/zodiac':           { priority: '0.8', changefreq: 'monthly' },
  '/festivals':        { priority: '0.8', changefreq: 'monthly' },
  '/about':            { priority: '0.6', changefreq: 'monthly' },
  '/contact':          { priority: '0.6', changefreq: 'monthly' },
  '/privacy':          { priority: '0.3', changefreq: 'yearly' },
  '/terms-of-service': { priority: '0.3', changefreq: 'yearly' },
};

// './index.astro' -> ''; './wukong.astro' -> '/wukong'; './explainers/x.astro' -> '/explainers/x'
function toPath(file: string): string {
  const p = file.replace(/^\.\//, '/').replace(/\.astro$/, '');
  return p === '/index' ? '' : p;
}

// Auto-discover top-level pages and explainer pages (build-time). Files prefixed
// with "_" are treated as non-routed drafts and skipped.
const discovered = Object.keys({
  ...import.meta.glob('./*.astro'),
  ...import.meta.glob('./explainers/*.astro'),
})
  .filter(f => !/\/_/.test(f))
  .map(toPath)
  .filter(path => !EXCLUDE.has(path))
  .sort();

const pages = discovered.map(path => {
  const def = path.startsWith('/explainers/')
    ? { priority: '0.8', changefreq: 'monthly' }
    : { priority: '0.9', changefreq: 'weekly' };
  return { path, ...(META[path] ?? def) };
});

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
