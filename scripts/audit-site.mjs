#!/usr/bin/env node
// yaopulife site audit — SEO/GEO hygiene checks. Run: `npm run audit:site`
// Static checks run against src/ (pre-deploy gate). Live checks run against the
// deployed site when reachable (set AUDIT_BASE to override, default production).
//
// HARD checks (exit 1 on failure): regressions we must never ship.
// SOFT checks (report only): coverage goals (Sources / FAQPage) we drive toward.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const PAGES = join(ROOT, 'src', 'pages');
const BASE = process.env.AUDIT_BASE || 'https://yaopulife.com';

let hardFail = 0;
const soft = [];
const ok = (m) => console.log(`  ✅ ${m}`);
const bad = (m) => { console.log(`  ❌ ${m}`); hardFail++; };
const warn = (m) => { console.log(`  ⚠️  ${m}`); soft.push(m); };
const read = (p) => readFileSync(p, 'utf8');
const rel = (p) => relative(ROOT, p);

function walk(dir, ext) {
  const out = [];
  for (const e of readdirSync(dir)) {
    if (['node_modules', 'dist', '.vercel'].includes(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p, ext));
    else if (!ext || ext.test(p)) out.push(p);
  }
  return out;
}

const astro = walk(PAGES, /\.astro$/);
const isExplainer = (p) => /pages[\\/]explainers[\\/]/.test(p);
const STORY = ['wukong', 'nezha', 'houyi', 'jingwei', 'xingtian', 'whitesnake', 'changge', 'shanhaijing', 'zodiac'];
const isStory = (p) => STORY.some((s) => p.endsWith(`${s}.astro`));
const isContent = (p) => isExplainer(p) || isStory(p);

console.log('\n[1] Old DIY keywords absent from src');
{
  const kw = /yaopulife DIY|Custom DIY Gifts|moon lamp|pet portrait|wedding embroidery|dried flower bouquet|home decor/i;
  let hits = 0;
  for (const p of walk(join(ROOT, 'src'), /\.(astro|md|mdx|ts|js|json|txt)$/)) {
    if (p.includes('audit-site') || p.includes('illustration-prompts')) continue;
    const t = read(p);
    if (p.endsWith('.ts') && t.includes('410 Gone')) continue; // 410 route comment
    if (kw.test(t)) { warn(`DIY keyword in ${rel(p)}`); hits++; }
  }
  if (!hits) ok('no DIY keywords in src (excl. 410 route + negative prompt)');
}

console.log('\n[2] No /product or /blog content pages (only 410 endpoints)');
{
  const off = astro.filter((p) => /pages[\\/](product|blog)[\\/]/.test(p));
  off.length ? bad(`content page(s) under product/blog: ${off.map(rel).join(', ')}`) : ok('no .astro under /product or /blog');
  for (const dir of ['product', 'blog']) {
    existsSync(join(PAGES, dir, '[...path].ts')) ? ok(`${dir}/[...path].ts (410) present`) : warn(`${dir} 410 endpoint missing`);
  }
}

console.log('\n[3] Every page has <title>, meta description, canonical');
{
  let miss = 0;
  for (const p of astro) {
    const t = read(p);
    if (/layouts[\\/]Layout\.astro/.test(t)) continue; // head (title/canonical/desc) provided by Layout.astro
    const m = [];
    if (!/<title>/.test(t)) m.push('title');
    if (!/name="description"/.test(t)) m.push('description');
    if (!/rel="canonical"/.test(t)) m.push('canonical');
    if (m.length) { bad(`${rel(p)} missing: ${m.join(', ')}`); miss++; }
  }
  if (!miss) ok('all pages have title/description/canonical');
}

console.log('\n[4] Canonicals clean (no localhost / preview / www / undefined)');
{
  let bad2 = 0;
  for (const p of astro) {
    const m = read(p).match(/rel="canonical"\s+href="([^"]+)"/);
    if (m && /(localhost|vercel\.app|\/\/www\.|undefined)/.test(m[1])) { bad(`${rel(p)} bad canonical: ${m[1]}`); bad2++; }
  }
  if (!bad2) ok('all canonicals clean');
}

console.log('\n[5] Footer social links are real (not "#" / home placeholders)');
{
  const f = join(ROOT, 'src', 'components', 'Footer.astro');
  const t = existsSync(f) ? read(f) : '';
  for (const net of ['youtube', 'tiktok', 'pinterest']) {
    new RegExp(`href:\\s*"https://[^"]*${net}[^"]*"`, 'i').test(t) ? ok(`${net} → real URL`) : warn(`${net} social link missing/placeholder`);
  }
  if (/href:\s*"#"/.test(t)) bad('footer has a "#" placeholder link');
}

console.log('\n[6] Content pages carry a Sources section (coverage)');
{
  const content = astro.filter(isContent);
  let have = 0;
  for (const p of content) /id="sources"/.test(read(p)) ? have++ : warn(`Sources missing: ${rel(p)}`);
  console.log(`  Sources present on ${have}/${content.length} content pages`);
}

console.log('\n[7] Pages with a FAQ carry FAQPage JSON-LD (coverage)');
{
  let missing = 0;
  for (const p of astro) {
    const t = read(p);
    const hasFaq = /id="faq"|>\s*FAQ|Common misunderstandings/.test(t);
    if (hasFaq && !/"FAQPage"/.test(t)) { warn(`FAQ text but no FAQPage schema: ${rel(p)}`); missing++; }
  }
  if (!missing) ok('all FAQ pages emit FAQPage schema');
}

console.log('\n[8] sitemap.xml.ts excludes 404 + is glob-driven');
{
  const sm = read(join(PAGES, 'sitemap.xml.ts'));
  /EXCLUDE[\s\S]*?\/404/.test(sm) ? ok('EXCLUDE contains /404') : bad('sitemap does not exclude /404');
  /import\.meta\.glob/.test(sm) ? ok('sitemap is glob-driven (auto-discovery)') : warn('sitemap not glob-driven');
}

console.log(`\n[9] Live checks against ${BASE} (best-effort)`);
try {
  const smRes = await fetch(BASE + '/sitemap.xml');
  if (smRes.ok) {
    const sm = await smRes.text();
    ok(`sitemap 200 (${(sm.match(/<loc>/g) || []).length} urls)`);
    if (/\/product\//.test(sm)) bad('sitemap contains /product/');
    if (/<loc>[^<]*\/blog/.test(sm)) bad('sitemap contains /blog');
    if (/\/404/.test(sm)) bad('sitemap contains /404');
    if (/localhost|vercel\.app|undefined/.test(sm)) bad('sitemap contains localhost/preview/undefined');
  } else warn('sitemap not reachable');
  const rob = await fetch(BASE + '/robots.txt');
  if (rob.ok) (/Sitemap:/i.test(await rob.text()) ? ok('robots 200 + Sitemap declared') : bad('robots missing Sitemap:'));
  else warn('robots not reachable');
  const llms = await fetch(BASE + '/llms.txt');
  llms.ok ? ok(`llms.txt 200 (${((await llms.text()).match(/^- https/gm) || []).length} links)`) : warn('llms.txt not reachable');
  for (const u of ['/product/7', '/blog/whatever']) {
    const s = (await fetch(BASE + u, { redirect: 'manual' })).status;
    s === 410 ? ok(`${u} → 410`) : warn(`${u} → ${s} (expected 410)`);
  }
} catch (e) {
  warn(`live checks skipped (${e.message})`);
}

console.log(`\n──────── audit: ${hardFail} hard failure(s), ${soft.length} soft warning(s) ────────`);
process.exit(hardFail ? 1 : 0);
