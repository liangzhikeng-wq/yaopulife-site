#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

const REQUIRED_FIELDS = [
  'supplier_name',
  'supplier_store_url',
  'supplier_product_url',
  'supplier_product_title',
  'supplier_price_min',
  'supplier_price_max',
  'currency',
  'moq',
  'supports_dropshipping',
  'supports_customization',
  'material',
  'size',
  'domestic_shipping_fee',
  'estimated_weight',
  'stock_status',
  'risk_notes'
];

function markdown(template) {
  const optionalArgs = [
    template.research_id ? `  --research-id ${template.research_id} \\` : '',
    template.domestic_search_keyword ? `  --domestic-search-keyword "${template.domestic_search_keyword}" \\` : ''
  ].filter(Boolean).join('\n');
  const optionalBlock = optionalArgs ? `${optionalArgs}\n` : '';

  return `# Source Template: ${template.sku}

Product: ${template.product_name}
Research ID: ${template.research_id || 'Not linked yet'}
Domestic Search Keyword: ${template.domestic_search_keyword || 'Not provided'}
Created At: ${template.created_at}

## Search Targets

- 1688
- Taobao
- Pinduoduo
- YiwuGo
- Baidu AiCaigou

## Required Fields

${template.required_fields.map((field) => `- [ ] ${field}`).join('\n')}

## Candidate Supplier Notes

Use this block while researching, then convert the best candidate into a real source record with \`agent-source-product.cjs\`.

\`\`\`text
supplier_name:
supplier_store_url:
supplier_product_url:
supplier_product_title:
supplier_price_min:
supplier_price_max:
currency: CNY
moq:
supports_dropshipping:
supports_customization:
material:
size:
color_options:
shipping_origin:
domestic_shipping_fee:
estimated_weight:
supplier_rating:
monthly_sales:
review_count:
image_quality_score:
style_match_score:
price_score:
supplier_reliability_score:
stock_status:
purchase_notes:
risk_notes:
\`\`\`

## Next Command

\`\`\`bash
node scripts/agent-source-product.cjs \\
  --yaopulife-sku ${template.sku} \\
  --product-status candidate \\
${optionalBlock}  --supplier-name "Supplier Name" \\
  --supplier-product-url "https://detail.1688.com/..." \\
  --domestic-platform 1688
\`\`\`
`;
}

function createSourceTemplate(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const normalizedInput = core.normalizeAliases(input, [
    'sku',
    'product_name',
    'research_id',
    'domestic_search_keyword'
  ]);

  core.assertRequired(normalizedInput, ['sku']);

  const template = {
    sku: normalizedInput.sku,
    product_name: normalizedInput.product_name || normalizedInput.productName || normalizedInput.sku,
    research_id: normalizedInput.research_id || '',
    domestic_search_keyword: normalizedInput.domestic_search_keyword || '',
    required_fields: REQUIRED_FIELDS,
    created_at: now,
    updated_at: now
  };

  const draftDir = path.join(paths.draftsRoot, 'sourcing');
  core.ensureDir(draftDir);
  const date = now.slice(0, 10);
  const markdownPath = path.join(draftDir, `${template.sku}-source-template-${date}.md`);
  const jsonPath = path.join(draftDir, `${template.sku}-source-template-${date}.json`);
  fs.writeFileSync(markdownPath, markdown(template));
  core.writeJson(jsonPath, template);

  core.writeLog(root, 'sourcing', {
    event: 'source_template_created',
    sku: template.sku,
    timestamp: now
  });

  return {
    template,
    markdownPath,
    jsonPath
  };
}

function main() {
  const args = core.parseArgs();
  const result = createSourceTemplate(args);
  process.stdout.write(`${JSON.stringify({
    sku: result.template.sku,
    markdownPath: result.markdownPath,
    jsonPath: result.jsonPath
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

module.exports = { createSourceTemplate };
