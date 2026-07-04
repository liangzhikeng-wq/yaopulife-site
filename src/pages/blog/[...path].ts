import type { APIRoute } from 'astro';

// Old DIY blog posts (pet-portrait guides, DIY gift guides, etc.) are permanently
// gone. Return 410 Gone so search engines drop them from the index — a 301-to-/myths
// of unrelated DIY content is a topic mismatch that reads as a soft 404.
const gone = () =>
  new Response(
    '410 Gone — this page has been permanently removed. Visit https://yaopulife.com/myths for Chinese myths, festivals and zodiac.',
    { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );

export const GET: APIRoute = gone;
export const prerender = false;
