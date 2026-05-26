import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://yaopulife.com',
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()]
});
