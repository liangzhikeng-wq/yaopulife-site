# Yaopulife Agent MVP Design

## Goal

Build the first local-file operating loop for yaopulife.com:

research idea -> source record -> product/source map -> OpenClaw brief -> image QC record -> listing readiness check -> purchase task.

This MVP does not publish products, edit live pages, change prices, send emails, or automate supplier purchases.

## Current Project Fit

The site is an Astro project with existing CommonJS scripts. Product pages and shop data are currently hardcoded in Astro pages, so the MVP will not try to publish directly into the storefront. It will produce auditable files under `.agent/` first.

The existing repo has many uncommitted changes. The MVP will only add new files under:

- `.agent/`
- `scripts/agent-*.cjs`
- `tests/agent-*.test.cjs`
- `docs/superpowers/`

## Recommended MVP Scope

### In Scope

- Create a stable `.agent` workspace.
- Store sourcing data in CSV and JSON.
- Generate deterministic IDs for sources, purchases, and reports.
- Add CLI tools for:
  - creating or updating sourcing records
  - creating OpenClaw prompt folders
  - checking generated images with file-based QC metadata
  - checking listing readiness
  - calculating profit estimates
  - creating purchase tasks from SKU/source mapping
- Add Node built-in test coverage for core utilities.

### Out of Scope

- Automatic scraping of Etsy, Amazon, TikTok, Pinterest, 1688, Taobao, or Pinduoduo.
- Automatic publishing to Astro product pages.
- Admin UI.
- XLSX generation.
- Payment or order webhook integration.
- Automatic supplier checkout.

## Architecture

The MVP uses small CommonJS modules so it matches the existing script style and does not need new dependencies.

Core responsibilities:

- `scripts/agent-core.cjs`: file, CSV, ID, date, JSON, and logging helpers.
- `scripts/agent-scan.cjs`: read-only project scan and analysis report generator.
- `scripts/agent-daily-tasks.cjs`: local operating summary and recommended task generator.
- `scripts/agent-run-sku-pipeline.cjs`: per-SKU state checker and next-command recommender.
- `scripts/agent-generate-sourcing-keywords.cjs`: Chinese domestic sourcing keyword generator.
- `scripts/agent-create-source-template.cjs`: manual supplier data template generator.
- `scripts/agent-create-sku-task-pack.cjs`: combined SKU task pack generator.
- `scripts/agent-product-research.cjs`: create overseas product research records with first-principles scoring.
- `scripts/agent-source-product.cjs`: create sourcing records and SKU/source mappings.
- `scripts/agent-import-supplier-images.cjs`: import manually downloaded supplier images into `raw/` and write image provenance.
- `scripts/agent-create-openclaw-brief.cjs`: create image folder structure and `prompt.md`.
- `scripts/agent-image-qc.cjs`: inspect image folders and write `qc-report.md` plus JSON summary.
- `scripts/agent-generate-product.cjs`: generate draft product listing Markdown/JSON from source data and approved images.
- `scripts/agent-listing-readiness-check.cjs`: validate that one SKU has the required files and data.
- `scripts/agent-profit-calculator.cjs`: calculate gross/net margins from numeric inputs.
- `scripts/agent-create-purchase-task.cjs`: create purchase records from `order_id + SKU`.

The scripts all read and write under `.agent/` by default. They should accept CLI flags but also expose functions for tests.

## Data Model

Initial files:

- `.agent/config/agent.config.json`
- `.agent/config/permissions.json`
- `.agent/config/brand-rules.json`
- `.agent/memory/brand-summary.md`
- `.agent/memory/product-taxonomy.md`
- `.agent/memory/seo-keywords.md`
- `.agent/sourcing/sourcing-master.csv`
- `.agent/sourcing/suppliers.json`
- `.agent/sourcing/product-source-map.json`
- `.agent/sourcing/purchase-records/purchase-master.csv`

CSV is the source of truth for tabular records in v1. JSON is used for lookup maps and structured task output.

## Safety Rules

- Supplier original images can only live under `raw/`.
- Generated images must go through QC before they are copied into `final/`.
- Listing readiness must fail if a SKU has no source record, no mapping, no QC report, no final image, or no draft listing.
- Purchase tasks only produce instructions and records; they do not place orders.
- Scripts must not modify `src/pages`, `src/content`, `public`, API routes, Vercel config, or payment config.

## Success Criteria

- A starter `.agent` workspace exists.
- One command can scan the current project and write `.agent/reports/project-scan.*` plus `docs/AGENT_PROJECT_ANALYSIS.md`.
- One command can generate daily operating tasks under `.agent/reports/daily/`.
- One command can inspect a SKU and recommend the next local Agent command under `.agent/reports/pipelines/`.
- One command can generate Chinese domestic sourcing keywords.
- One command can generate a manual source template for a SKU.
- One command can generate a combined SKU task pack.
- One command can create a source record and update `product-source-map.json`.
- One command can create a research record under `.agent/research/overseas/`.
- One command can create an OpenClaw folder and prompt for a SKU.
- One command can import supplier reference images into `raw/` and write `image-source.json`.
- One command can generate image QC output from an `openclaw-output/` folder.
- One command can generate a product listing draft under `.agent/drafts/products/`.
- One command can report readiness status for a SKU.
- One command can create a purchase task from `order_id + SKU`.
- `node --test tests/agent-core.test.cjs tests/agent-workflow.test.cjs` passes.
- `npm run build` still passes.
