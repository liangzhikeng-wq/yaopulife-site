import type { APIRoute } from 'astro';

// Old DIY commerce URLs (moon lamps, pet portraits, etc.) are permanently gone.
// Return 410 Gone so search engines drop them from the index — a 301-to-home of
// unrelated product pages reads as a soft 404 and keeps the old DIY theme alive.
const gone = () =>
  new Response(
    '410 Gone — this page has been permanently removed. Visit https://yaopulife.com/myths for Chinese myths, festivals and zodiac.',
    { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );

export const GET: APIRoute = gone;
export const prerender = false;
