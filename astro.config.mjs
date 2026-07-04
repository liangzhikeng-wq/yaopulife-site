import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://yaopulife.com',
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()],
  redirects: {
    '/shop': '/myths',
    '/how-it-works': '/',
    '/shipping-and-returns': '/',
    '/order/success': '/',
    '/order/cancel': '/'
  }
  // NOTE: /product/* and /blog/* are intentionally NOT redirected here.
  // They return 410 Gone via src/pages/product/[...path].ts and src/pages/blog/[...path].ts
  // (old DIY commerce/blog, permanently removed — a 301-to-home would read as a soft 404).
});
