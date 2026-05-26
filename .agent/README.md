# Yaopulife Agent MVP

This workspace is local-first. It records sourcing, image, listing draft, readiness, and purchase backtracking data without publishing anything to the live storefront.

## First SKU Workflow

0. Scan the project before operating.

```bash
node scripts/agent-scan.cjs --write-docs true
```

This writes:

- `.agent/reports/project-scan.json`
- `.agent/reports/project-scan.md`
- `docs/AGENT_PROJECT_ANALYSIS.md`

Generate the daily operating summary.

```bash
node scripts/agent-daily-tasks.cjs
```

This writes:

- `.agent/reports/daily/daily-tasks-YYYY-MM-DD.json`
- `.agent/reports/daily/daily-tasks-YYYY-MM-DD.md`

Check one SKU and get the next recommended local command.

```bash
node scripts/agent-run-sku-pipeline.cjs \
  --sku DIY-PET-020 \
  --product-name "Custom Pet Photo Mug" \
  --target-keyword "custom pet photo mug"
```

This writes:

- `.agent/reports/pipelines/DIY-PET-020.json`
- `.agent/reports/pipelines/DIY-PET-020.md`

Generate Chinese domestic sourcing keywords.

```bash
node scripts/agent-generate-sourcing-keywords.cjs \
  --sku DIY-PET-020 \
  --product-idea "Custom Pet Photo Mug"
```

Generate a full manual task pack for one SKU.

```bash
node scripts/agent-create-sku-task-pack.cjs \
  --sku DIY-PET-020 \
  --product-name "Custom Pet Photo Mug" \
  --target-keyword "custom pet photo mug" \
  --domestic-search-keyword "照片陶瓷马克杯 定制"
```

1. Record the overseas product research.

```bash
node scripts/agent-product-research.cjs \
  --product-idea "Custom Pet Photo Mug" \
  --source-platform Etsy \
  --source-url "https://example.com/reference" \
  --target-market US \
  --main-keyword "custom pet photo mug" \
  --secondary-keywords "personalized pet mug, dog photo mug" \
  --estimated-demand medium \
  --gift-occasion "birthday, pet memorial" \
  --visual-style "warm, personalized, clean" \
  --market-demand-score 7 \
  --gift-attribute-score 8 \
  --visual-appeal-score 7 \
  --seo-potential-score 8 \
  --social-spread-score 6 \
  --supply-availability-score 9 \
  --profit-potential-score 8 \
  --shipping-score 9 \
  --aftersales-risk-score 8 \
  --differentiation-score 6 \
  --brand-fit-score 8
```

2. Record a supplier source.

```bash
node scripts/agent-source-product.cjs \
  --yaopulife-sku DIY-PET-020 \
  --product-id 20 \
  --product-status candidate \
  --research-id R-20260525-001 \
  --domestic-platform 1688 \
  --domestic-search-keyword "照片陶瓷马克杯 定制" \
  --supplier-name "Supplier Name" \
  --supplier-product-url "https://detail.1688.com/..." \
  --supplier-price-min 6.80 \
  --supplier-price-max 9.80 \
  --currency CNY \
  --moq 1 \
  --supports-customization yes
```

3. Import supplier reference images into `raw/`.

```bash
node scripts/agent-import-supplier-images.cjs \
  --sku DIY-PET-020 \
  --image "/absolute/path/to/supplier-main.jpg" \
  --source-url "https://detail.1688.com/..."
```

This writes:

- `.agent/sourcing/downloaded-images/DIY-PET-020/raw/supplier-01.jpg`
- `.agent/sourcing/downloaded-images/DIY-PET-020/raw/image-source.json`

4. Create the OpenClaw handoff folder.

```bash
node scripts/agent-create-openclaw-brief.cjs \
  --sku DIY-PET-020 \
  --product-name "Custom Pet Photo Mug" \
  --target-market US \
  --output-count 5
```

5. Put generated images into:

```text
.agent/sourcing/downloaded-images/DIY-PET-020/openclaw-output/
```

6. Run image QC.

```bash
node scripts/agent-image-qc.cjs --sku DIY-PET-020
```

7. Generate a product draft.

```bash
node scripts/agent-generate-product.cjs \
  --sku DIY-PET-020 \
  --product-title "Custom Pet Photo Mug" \
  --target-keyword "custom pet photo mug" \
  --target-selling-price 28
```

8. Check listing readiness.

```bash
node scripts/agent-listing-readiness-check.cjs --sku DIY-PET-020
```

9. Create purchase task after an order.

```bash
node scripts/agent-create-purchase-task.cjs \
  --order-id 1008 \
  --yaopulife-sku DIY-PET-020 \
  --customer-country US \
  --quantity 1
```

## Guardrails

- Supplier original images stay in `raw/`.
- Only QC-approved generated images are copied into `final/`.
- Product drafts stay under `.agent/drafts/products/`.
- No script publishes products, changes prices, emails customers, or places supplier orders.
