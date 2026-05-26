#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

function titleCase(value) {
  return String(value || '')
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

function findSource(paths, sku) {
  const rows = core.readCsv(paths.sourcingMasterCsv, core.SOURCE_HEADERS).rows;
  return rows.find((row) => row.yaopulife_sku === sku);
}

function productTitle(input, source) {
  return input.product_title
    || input.productTitle
    || source?.overseas_product_title
    || source?.supplier_product_title
    || titleCase(input.sku);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function imageAltText(title, images) {
  return images.map((image, index) => ({
    image,
    alt: `${title} product image ${index + 1} for yaopulife custom gift listing`
  }));
}

function markdownDraft(data) {
  return `# ${data.title}

SKU: ${data.sku}
Status: Draft only - human review required before publishing

## SEO

SEO Title: ${data.seoTitle}
Meta Description: ${data.metaDescription}
URL Slug: ${data.urlSlug}
Target Keyword: ${data.targetKeyword}

## Short Description

${data.shortDescription}

## Full Description

${data.fullDescription}

## Key Benefits

${data.keyBenefits.map((item) => `- ${item}`).join('\n')}

## Customization Options

${data.customizationOptions.map((item) => `- ${item}`).join('\n')}

## Product Specifications

- Material: ${data.specifications.material}
- Size: ${data.specifications.size}
- Supplier Price Range: ${data.specifications.supplierPriceRange}
- Target Selling Price: ${data.specifications.targetSellingPrice}

## Perfect For

${data.perfectFor.map((item) => `- ${item}`).join('\n')}

## How It Works

1. Customer sends photo, name, message, or customization notes.
2. Yaopulife confirms the design direction before production.
3. Supplier production starts only after manual review.
4. Finished item is checked before international shipping.

## Production & Shipping Notes

- Production time must be confirmed with the supplier before quoting the customer.
- Shipping time must be confirmed before making any customer promise.
- Do not claim certifications, materials, or packaging that are not confirmed.

## FAQ

### Can I customize this product?
Yes. The exact customization scope must be confirmed with the supplier before payment or production.

### How long does it take?
Production and shipping time are not automatically promised. Confirm current supplier capacity before replying to the customer.

### Can I see a preview first?
Yes. A design preview can be prepared before production when the customer provides clear customization materials.

## Image Alt Text

${data.imageAltText.map((item) => `- ${item.image}: ${item.alt}`).join('\n') || '- No final images found yet.'}

## Tags

${data.tags.map((item) => `- ${item}`).join('\n')}

## Recommended Collection

${data.recommendedCollection}

## Missing Information

${data.missingInformation.map((item) => `- ${item}`).join('\n') || '- None'}

## Supplier Trace

- Source ID: ${data.sourceId}
- Supplier: ${data.supplierName}
- Supplier URL: ${data.supplierProductUrl}
- Domestic Platform: ${data.domesticPlatform}

`;
}

function buildDraft(input, source, finalImages) {
  const title = productTitle(input, source);
  const targetKeyword = input.target_keyword || input.targetKeyword || source?.overseas_target_keyword || title.toLowerCase();
  const targetSellingPrice = input.target_selling_price || input.targetSellingPrice || '';
  const material = input.material || source?.material || 'Needs supplier confirmation';
  const size = input.size || source?.size || 'Needs supplier confirmation';
  const supplierPriceRange = [source?.supplier_price_min, source?.supplier_price_max].filter(Boolean).join(' - ') || 'Needs supplier confirmation';
  const category = input.category || source?.product_status || 'custom-gifts';

  return {
    sku: input.sku,
    title,
    seoTitle: `${title} | Personalized Gift by yaopulife`,
    metaDescription: `Create a personalized ${targetKeyword} with yaopulife. Draft listing pending supplier, image, and human review before publishing.`,
    urlSlug: slugify(title),
    targetKeyword,
    shortDescription: `A customizable ${title.toLowerCase()} concept prepared for yaopulife's independent store workflow.`,
    fullDescription: `This draft presents ${title} as a personalized gift option for overseas customers. It should be reviewed against the confirmed supplier record, approved final images, and actual customization capacity before publishing.`,
    keyBenefits: [
      'Personalized gift concept designed for emotional occasions',
      'Supplier trace is attached for purchase backtracking',
      'Image usage is limited to QC-approved generated assets',
      'Draft keeps unconfirmed production and shipping promises out of the listing'
    ],
    customizationOptions: [
      'Customer photo or artwork input',
      'Name, date, or short message when supplier supports it',
      'Color, size, and packaging options only after supplier confirmation'
    ],
    specifications: {
      material,
      size,
      supplierPriceRange,
      targetSellingPrice: targetSellingPrice || 'Needs pricing review'
    },
    perfectFor: [
      'Pet lovers',
      'Birthday gifts',
      'Memorial gifts',
      'Holiday gifting',
      'Personalized everyday keepsakes'
    ],
    imageAltText: imageAltText(title, finalImages),
    tags: Array.from(new Set([
      targetKeyword,
      'personalized gift',
      'custom gift',
      category,
      'yaopulife'
    ].filter(Boolean))),
    recommendedCollection: category,
    missingInformation: [
      !source?.supplier_product_url && 'Confirmed supplier product URL',
      !material || material === 'Needs supplier confirmation' ? 'Confirmed material' : '',
      !size || size === 'Needs supplier confirmation' ? 'Confirmed size' : '',
      !targetSellingPrice && 'Target selling price',
      finalImages.length === 0 && 'QC-approved final images'
    ].filter(Boolean),
    sourceId: source?.source_id || '',
    supplierName: source?.supplier_name || '',
    supplierProductUrl: source?.supplier_product_url || '',
    domesticPlatform: source?.domestic_platform || ''
  };
}

function generateProductDraft(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const normalizedInput = core.normalizeAliases(input, ['sku', 'product_title', 'target_keyword', 'target_selling_price']);

  core.assertRequired(normalizedInput, ['sku']);

  const source = findSource(paths, normalizedInput.sku);
  if (!source) throw new Error(`No sourcing record found for SKU: ${normalizedInput.sku}`);

  const finalDir = path.join(paths.downloadedImagesRoot, normalizedInput.sku, 'final');
  const finalImages = core.listImageFiles(finalDir).map((image) => core.relativeAgentPath(root, path.join(finalDir, image)));
  const draft = buildDraft(normalizedInput, source, finalImages);
  const date = now.slice(0, 10);
  const draftDir = path.join(paths.draftsRoot, 'products');
  core.ensureDir(draftDir);
  const markdownPath = path.join(draftDir, `${normalizedInput.sku}-${date}.md`);
  const jsonPath = path.join(draftDir, `${normalizedInput.sku}-${date}.json`);

  fs.writeFileSync(markdownPath, markdownDraft(draft));
  core.writeJson(jsonPath, {
    generated_at: now,
    ...draft
  });

  const map = core.readJson(paths.productSourceMap, {});
  if (!map[normalizedInput.sku]) map[normalizedInput.sku] = {};
  map[normalizedInput.sku].listing_draft_path = core.relativeAgentPath(root, markdownPath);
  map[normalizedInput.sku].listing_draft_json_path = core.relativeAgentPath(root, jsonPath);
  map[normalizedInput.sku].status = 'draft_generated';
  core.writeJson(paths.productSourceMap, map);

  core.writeLog(root, 'products', {
    event: 'product_draft_generated',
    sku: normalizedInput.sku,
    markdown_path: core.relativeAgentPath(root, markdownPath),
    timestamp: now
  });

  return {
    draft,
    markdownPath,
    jsonPath
  };
}

function main() {
  const args = core.parseArgs();
  const result = generateProductDraft(args);
  process.stdout.write(`${JSON.stringify({
    markdownPath: result.markdownPath,
    jsonPath: result.jsonPath,
    title: result.draft.title,
    missingInformation: result.draft.missingInformation
  }, null, 2)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

module.exports = { generateProductDraft };
