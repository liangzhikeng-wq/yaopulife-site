# yaopulife DIY

Handpicked DIY, AI-Imagined Artistry. Custom handcrafted gifts made to order.

## Tech Stack

- **Framework**: Astro v5 (Static Site Generation)
- **Styling**: Tailwind CSS v3
- **CMS**: Sanity (Headless)
- **Deployment**: Vercel
- **CDN**: Cloudflare
- **Image Hosting**: Cloudflare R2

## Pages

| Page | Route | Status |
|---|---|---|
| Home | `/` | Ready |
| Shop | `/shop` | Ready |
| Product Detail | `/product/:id` | Ready (6 sample products) |
| How It Works | `/how-it-works` | Ready |
| Contact | `/contact` | Ready (Formspree placeholder) |
| About | `/about` | Ready |
| Privacy Policy | `/privacy` | Ready |
| 404 | `/404` | Ready |
| Sitemap | `/sitemap-index.xml` | Dynamic |

## Development

```bash
npm install
npm run dev      # localhost:4321
npm run build    # static build to ./dist
npm run preview  # preview build locally
```

## Project Structure

```
yaopulife-site/
├── src/
│   ├── components/     # Navbar, Footer, TidioChat
│   ├── layouts/        # Layout.astro (SEO + Meta)
│   ├── pages/          # All pages
│   └── styles/         # global.css (Tailwind)
├── public/             # Static assets
├── sanity/             # Sanity CMS schemas
├── scripts/            # R2 upload, Cloudflare setup
├── .github/workflows/  # CI/CD
├── vercel.json         # Vercel config
└── DEPLOY.md           # Deployment guide
```
