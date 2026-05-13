# yaopulife DIY - Deployment Guide

## Pre-requisites Checklist

- [ ] Domain registered (yaopulife.com on Namecheap)
- [ ] DNS switched to Cloudflare (Custom DNS: lara.ns.cloudflare.com, greg.ns.cloudflare.com)
- [ ] Cloudflare account created and domain added
- [ ] Cloudflare API Token created (Zone:Read, Zone Settings:Edit, DNS:Edit)
- [ ] Cloudflare Zone ID copied

## Environment Variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

Required for first deploy:
- `CF_API_TOKEN`
- `CF_ZONE_ID`

Optional (can be added later):
- `SANITY_PROJECT_ID` + `SANITY_API_TOKEN` (for CMS)
- `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` (for image hosting)
- `RESEND_API_KEY` (for contact form emails)
- `KLAVIYO_PUBLIC_API_KEY` (for email marketing)
- `TIDIO_PUBLIC_KEY` (for live chat)

## Deploy to Vercel (Option A: CLI)

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Login (opens browser)
vercel login

# Link project (run once)
vercel link

# Deploy to production
vercel --prod
```

## Deploy to Vercel (Option B: GitHub + CI/CD)

1. Push this repo to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add Environment Variables in Vercel Dashboard
4. Every push to `main` auto-deploys

## Post-Deploy Checklist

- [ ] Site loads at https://yaopulife.com
- [ ] HTTPS certificate active
- [ ] All pages accessible (Home, Shop, Product, How It Works, Contact, About, Privacy)
- [ ] Contact form submits successfully
- [ ] Sitemap accessible at /sitemap-index.xml
- [ ] robots.txt accessible
- [ ] Lighthouse score: Performance >= 90, Accessibility >= 90, SEO >= 90
- [ ] Mobile responsive on iPhone/Android
- [ ] Tidio chat widget visible (after replacing YOUR_PUBLIC_KEY)
