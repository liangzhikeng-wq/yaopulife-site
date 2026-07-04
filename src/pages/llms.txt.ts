import type { APIRoute } from 'astro';

// /llms.txt — a plain-text map for AI crawlers / answer engines, served at build time.
// Explainer pages are auto-discovered (same glob philosophy as the sitemap), so new
// explainers appear here automatically. Core + story pages are a small curated set.
const explainers = Object.keys(import.meta.glob('./explainers/*.astro'))
  .filter((f) => !/\/_/.test(f))
  .map((f) => f.replace(/^\.\//, '/').replace(/\.astro$/, ''))
  .sort();

const CORE = ['/', '/myths', '/zodiac', '/festivals'];
const STORIES = ['/wukong', '/nezha', '/houyi', '/jingwei', '/xingtian', '/whitesnake', '/changge', '/shanhaijing'];

export const GET: APIRoute = () => {
  const base = 'https://yaopulife.com';
  const link = (p: string) => `- ${base}${p}`;
  const body = [
    '# yaopulife',
    '',
    'yaopulife explains Chinese myths, festivals, zodiac, and cultural concepts in clear English',
    'for international readers — a native perspective, story-first, with cited sources.',
    'Not an encyclopedia dump: quick answers, Western-misunderstanding notes, and FAQs built to',
    'be trustworthy and quotable.',
    '',
    '## Core',
    ...CORE.map(link),
    '',
    '## Myth & legend stories',
    ...STORIES.map(link),
    '',
    '## Cultural explainers',
    ...explainers.map(link),
    '',
    '## Notes',
    '- Content is in English for a global audience.',
    '- Cultural claims are general knowledge with reputable references (Britannica, Wikipedia,',
    '  museum/encyclopedia pages) cited on each page; where a folk story has multiple versions,',
    '  pages present one common version and note variation.',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
