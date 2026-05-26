const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const core = require('../scripts/agent-core.cjs');
const { scanProject } = require('../scripts/agent-scan.cjs');
const { generateDailyTasks } = require('../scripts/agent-daily-tasks.cjs');
const { runSkuPipeline } = require('../scripts/agent-run-sku-pipeline.cjs');
const { createProductResearch } = require('../scripts/agent-product-research.cjs');
const { createSourceRecord } = require('../scripts/agent-source-product.cjs');
const { createSourceTemplate } = require('../scripts/agent-create-source-template.cjs');
const { createSkuTaskPack } = require('../scripts/agent-create-sku-task-pack.cjs');
const { generateSourcingKeywords } = require('../scripts/agent-generate-sourcing-keywords.cjs');
const { importSupplierImages } = require('../scripts/agent-import-supplier-images.cjs');
const { createOpenClawBrief } = require('../scripts/agent-create-openclaw-brief.cjs');
const { runImageQc } = require('../scripts/agent-image-qc.cjs');
const { generateProductDraft } = require('../scripts/agent-generate-product.cjs');
const { calculateProfit } = require('../scripts/agent-profit-calculator.cjs');
const { checkListingReadiness } = require('../scripts/agent-listing-readiness-check.cjs');
const { createPurchaseTask } = require('../scripts/agent-create-purchase-task.cjs');

function tempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'yaopu-agent-workflow-'));
  core.ensureWorkspace(root);
  return root;
}

function writeFixtureProject(root) {
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({
    scripts: { build: 'astro build' },
    dependencies: { astro: '^5.0.0', '@astrojs/vercel': '^8.0.0' }
  }, null, 2));
  fs.mkdirSync(path.join(root, 'src', 'pages', 'product'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'content', 'blog'), { recursive: true });
  fs.mkdirSync(path.join(root, 'src', 'content', 'products'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src', 'pages', 'index.astro'), '<h1>Home</h1>');
  fs.writeFileSync(path.join(root, 'src', 'pages', 'product', '[id].astro'), '<h1>Product</h1>');
  fs.writeFileSync(path.join(root, 'src', 'content', 'blog', 'gift-guide.md'), '---\ntitle: Gift Guide\n---\n');
  fs.writeFileSync(path.join(root, 'src', 'content', 'products', 'DIY-PET-020.md'), '---\ntitle: Mug\n---\n');
  fs.writeFileSync(path.join(root, 'scripts', 'generate-product-pages.cjs'), 'console.log("ok");');
  fs.writeFileSync(path.join(root, 'docs', 'operations-sop-v3.md'), '# SOP');
}

function sourceInput(overrides = {}) {
  return {
    product_id: '20',
    yaopulife_sku: 'DIY-PET-020',
    product_status: 'candidate',
    research_id: 'R-20260525-001',
    overseas_product_title: 'Custom Pet Photo Mug',
    overseas_target_keyword: 'custom pet photo mug',
    domestic_platform: '1688',
    domestic_search_keyword: '照片陶瓷马克杯 定制',
    supplier_name: 'Test Mug Factory',
    supplier_store_url: 'https://example.com/store',
    supplier_product_url: 'https://detail.1688.com/test-mug',
    supplier_product_title: '照片马克杯定制',
    supplier_price_min: '6.80',
    supplier_price_max: '9.80',
    currency: 'CNY',
    moq: '1',
    supports_dropshipping: 'yes',
    supports_customization: 'yes',
    material: 'ceramic',
    size: '11oz',
    stock_status: 'unknown',
    created_at: '2026-05-25T12:00:00.000Z',
    updated_at: '2026-05-25T12:00:00.000Z',
    ...overrides
  };
}

test('scanProject writes project scan JSON, Markdown, and analysis doc', () => {
  const root = tempProject();
  writeFixtureProject(root);

  const result = scanProject({ write_docs: true }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.summary.tech_stack.framework, 'Astro');
  assert.equal(result.summary.pages.length, 2);
  assert.equal(result.summary.blog_posts.length, 1);
  assert.equal(result.summary.product_content.length, 1);
  assert.ok(result.summary.scripts.includes('scripts/generate-product-pages.cjs'));
  assert.ok(fs.existsSync(result.jsonPath));
  assert.ok(fs.existsSync(result.markdownPath));
  assert.ok(fs.existsSync(path.join(root, 'docs', 'AGENT_PROJECT_ANALYSIS.md')));

  const markdown = fs.readFileSync(result.markdownPath, 'utf8');
  assert.match(markdown, /# Agent Project Scan/);
  assert.match(markdown, /Framework: Astro/);
});

test('generateDailyTasks summarizes project and agent operating state', () => {
  const root = tempProject();
  writeFixtureProject(root);
  scanProject({ write_docs: true }, { root, now: '2026-05-25T12:00:00.000Z' });
  createProductResearch({
    product_idea: 'Custom Pet Photo Mug',
    main_keyword: 'custom pet photo mug',
    market_demand_score: '8',
    gift_attribute_score: '8',
    visual_appeal_score: '8',
    seo_potential_score: '8',
    social_spread_score: '8',
    supply_availability_score: '8',
    profit_potential_score: '8',
    shipping_score: '8',
    aftersales_risk_score: '8',
    differentiation_score: '8',
    brand_fit_score: '8'
  }, { root, now: '2026-05-25T12:00:00.000Z' });
  createSourceRecord(sourceInput({ listing_draft_path: '.agent/drafts/products/DIY-PET-020-2026-05-25.md' }), {
    root,
    now: '2026-05-25T12:00:00.000Z'
  });

  const result = generateDailyTasks({}, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.summary.framework, 'Astro');
  assert.equal(result.summary.research_records, 1);
  assert.equal(result.summary.sourcing_records, 1);
  assert.equal(result.summary.purchase_records, 0);
  assert.ok(result.tasks.some((task) => task.includes('Run listing readiness checks')));
  assert.ok(fs.existsSync(result.markdownPath));
  assert.ok(fs.existsSync(result.jsonPath));

  const markdown = fs.readFileSync(result.markdownPath, 'utf8');
  assert.match(markdown, /# Daily Agent Tasks/);
  assert.match(markdown, /Research Records: 1/);
});

test('runSkuPipeline reports missing source as first blocker for unknown SKU', () => {
  const root = tempProject();

  const result = runSkuPipeline({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.status, 'blocked');
  assert.equal(result.current_step, 'source_record');
  assert.ok(result.missing.includes('sourcing_record'));
  assert.ok(result.next_commands.some((command) => command.includes('agent-source-product.cjs')));
  assert.ok(fs.existsSync(result.markdownPath));
  assert.ok(fs.existsSync(result.jsonPath));
});

test('runSkuPipeline advances suggestions as SKU artifacts appear', () => {
  const root = tempProject();
  createSourceRecord(sourceInput(), { root, now: '2026-05-25T12:00:00.000Z' });

  const afterSource = runSkuPipeline({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });
  assert.equal(afterSource.current_step, 'raw_images');
  assert.ok(afterSource.next_commands[0].includes('agent-import-supplier-images.cjs'));

  const sourceImage = path.join(root, 'supplier-main.jpg');
  fs.writeFileSync(sourceImage, 'fake supplier image');
  importSupplierImages({
    sku: 'DIY-PET-020',
    image: sourceImage,
    source_url: 'https://detail.1688.com/test-mug'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  const afterRaw = runSkuPipeline({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });
  assert.equal(afterRaw.current_step, 'openclaw_brief');
  assert.ok(afterRaw.next_commands[0].includes('agent-create-openclaw-brief.cjs'));

  const brief = createOpenClawBrief({ sku: 'DIY-PET-020', product_name: 'Custom Pet Photo Mug' }, { root });
  const afterBrief = runSkuPipeline({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });
  assert.equal(afterBrief.current_step, 'openclaw_output');
  assert.ok(afterBrief.next_commands[0].includes('openclaw-output'));

  fs.writeFileSync(path.join(brief.skuImageDir, 'openclaw-output', 'generated-01.png'), 'fake image');
  const afterOutput = runSkuPipeline({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });
  assert.equal(afterOutput.current_step, 'image_qc');
  assert.ok(afterOutput.next_commands[0].includes('agent-image-qc.cjs'));

  runImageQc({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });
  const afterQc = runSkuPipeline({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });
  assert.equal(afterQc.current_step, 'product_draft');
  assert.ok(afterQc.next_commands[0].includes('agent-generate-product.cjs'));

  generateProductDraft({ sku: 'DIY-PET-020', product_title: 'Custom Pet Photo Mug' }, { root, now: '2026-05-25T12:00:00.000Z' });
  const afterDraft = runSkuPipeline({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });
  assert.equal(afterDraft.current_step, 'readiness_check');
  assert.ok(afterDraft.next_commands[0].includes('agent-listing-readiness-check.cjs'));
});

test('importSupplierImages copies files into raw and writes image-source metadata', () => {
  const root = tempProject();
  createSourceRecord(sourceInput(), { root, now: '2026-05-25T12:00:00.000Z' });
  const imageA = path.join(root, 'source-a.jpg');
  const imageB = path.join(root, 'source-b.png');
  fs.writeFileSync(imageA, 'a');
  fs.writeFileSync(imageB, 'b');

  const result = importSupplierImages({
    sku: 'DIY-PET-020',
    image: [imageA, imageB],
    source_url: 'https://detail.1688.com/test-mug',
    note: 'manual download'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.imported.length, 2);
  assert.ok(fs.existsSync(path.join(result.rawDir, 'supplier-01.jpg')));
  assert.ok(fs.existsSync(path.join(result.rawDir, 'supplier-02.png')));
  assert.ok(fs.existsSync(result.metadataPath));

  const metadata = core.readJson(result.metadataPath, {});
  assert.equal(metadata.sku, 'DIY-PET-020');
  assert.equal(metadata.images.length, 2);
  assert.equal(metadata.images[0].source_url, 'https://detail.1688.com/test-mug');
});

test('createSourceTemplate writes a manual sourcing template for one SKU', () => {
  const root = tempProject();

  const result = createSourceTemplate({
    sku: 'DIY-PET-020',
    product_name: 'Custom Pet Photo Mug',
    research_id: 'R-20260525-001',
    domestic_search_keyword: '照片陶瓷马克杯 定制'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.ok(fs.existsSync(result.markdownPath));
  assert.ok(fs.existsSync(result.jsonPath));
  assert.equal(result.template.sku, 'DIY-PET-020');
  assert.equal(result.template.required_fields.includes('supplier_product_url'), true);

  const markdown = fs.readFileSync(result.markdownPath, 'utf8');
  assert.match(markdown, /# Source Template: DIY-PET-020/);
  assert.match(markdown, /supplier_product_url/);
  assert.match(markdown, /照片陶瓷马克杯 定制/);
  assert.doesNotMatch(markdown, /^\+  --supplier-name/m);
});

test('createSkuTaskPack writes a combined manual task pack for one SKU', () => {
  const root = tempProject();

  const result = createSkuTaskPack({
    sku: 'DIY-PET-020',
    product_name: 'Custom Pet Photo Mug',
    target_keyword: 'custom pet photo mug',
    domestic_search_keyword: '照片陶瓷马克杯 定制'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.pack.sku, 'DIY-PET-020');
  assert.equal(result.pack.pipeline.current_step, 'source_record');
  assert.ok(fs.existsSync(result.markdownPath));
  assert.ok(fs.existsSync(result.jsonPath));
  assert.ok(fs.existsSync(result.sourceTemplatePath));
  assert.ok(fs.existsSync(result.sourcingKeywordsPath));

  const markdown = fs.readFileSync(result.markdownPath, 'utf8');
  assert.match(markdown, /# SKU Task Pack: DIY-PET-020/);
  assert.match(markdown, /Custom Pet Photo Mug/);
  assert.match(markdown, /Sourcing Keywords/);
  assert.match(markdown, /agent-source-product.cjs/);
});

test('generateSourcingKeywords writes Chinese domestic sourcing keywords', () => {
  const root = tempProject();

  const result = generateSourcingKeywords({
    product_idea: 'Custom Pet Photo Mug',
    sku: 'DIY-PET-020'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.record.sku, 'DIY-PET-020');
  assert.ok(result.record.keywords.includes('照片陶瓷马克杯 定制'));
  assert.ok(result.record.keywords.includes('宠物照片马克杯 定制'));
  assert.ok(fs.existsSync(result.markdownPath));
  assert.ok(fs.existsSync(result.jsonPath));

  const markdown = fs.readFileSync(result.markdownPath, 'utf8');
  assert.match(markdown, /# Sourcing Keywords/);
  assert.match(markdown, /照片陶瓷马克杯 定制/);
});

test('createProductResearch writes research markdown/json with scores and decision', () => {
  const root = tempProject();

  const result = createProductResearch({
    product_idea: 'Custom Pet Photo Mug',
    source_platform: 'Etsy',
    source_url: 'https://example.com/pet-mug',
    target_market: 'US',
    main_keyword: 'custom pet photo mug',
    secondary_keywords: 'personalized pet mug, dog photo mug',
    estimated_demand: 'medium',
    gift_occasion: 'birthday, pet memorial',
    visual_style: 'warm, personalized, clean',
    market_demand_score: '7',
    gift_attribute_score: '8',
    visual_appeal_score: '7',
    seo_potential_score: '8',
    social_spread_score: '6',
    supply_availability_score: '9',
    profit_potential_score: '8',
    shipping_score: '9',
    aftersales_risk_score: '8',
    differentiation_score: '6',
    brand_fit_score: '8'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.record.research_id, 'R-20260525-001');
  assert.equal(result.record.total_score, 84);
  assert.equal(result.record.decision, 'worth_testing');
  assert.ok(fs.existsSync(result.markdownPath));
  assert.ok(fs.existsSync(result.jsonPath));

  const markdown = fs.readFileSync(result.markdownPath, 'utf8');
  assert.match(markdown, /# Product Research: Custom Pet Photo Mug/);
  assert.match(markdown, /Total Score: 84/);
  assert.match(markdown, /Decision: worth_testing/);
});

test('createSourceRecord appends sourcing CSV and updates SKU map', () => {
  const root = tempProject();

  const result = createSourceRecord(sourceInput(), { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.record.source_id, 'SRC-20260525-001');
  assert.equal(result.record.yaopulife_sku, 'DIY-PET-020');

  const paths = core.workspacePaths(root);
  const sourceCsv = core.readCsv(paths.sourcingMasterCsv);
  const map = core.readJson(paths.productSourceMap, {});

  assert.equal(sourceCsv.rows.length, 1);
  assert.equal(sourceCsv.rows[0].supplier_name, 'Test Mug Factory');
  assert.equal(map['DIY-PET-020'].source_id, 'SRC-20260525-001');
  assert.equal(map['DIY-PET-020'].supplier_product_url, 'https://detail.1688.com/test-mug');
});

test('createSourceRecord accepts CLI-shaped camelCase aliases', () => {
  const root = tempProject();

  const result = createSourceRecord({
    yaopulifeSku: 'DIY-PET-020',
    supplierName: 'CLI Supplier',
    supplierProductUrl: 'https://detail.1688.com/cli-test',
    supplierPriceMin: '8.80',
    productStatus: 'candidate'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.record.yaopulife_sku, 'DIY-PET-020');
  assert.equal(result.record.supplier_name, 'CLI Supplier');
  assert.equal(result.record.supplier_product_url, 'https://detail.1688.com/cli-test');
});

test('createOpenClawBrief creates SKU image folders and prompt', () => {
  const root = tempProject();
  createSourceRecord(sourceInput(), { root, now: '2026-05-25T12:00:00.000Z' });

  const result = createOpenClawBrief({
    sku: 'DIY-PET-020',
    product_name: 'Custom Pet Photo Mug',
    target_market: 'US',
    output_count: '5'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.ok(fs.existsSync(path.join(result.skuImageDir, 'raw')));
  assert.ok(fs.existsSync(path.join(result.skuImageDir, 'openclaw-input', 'prompt.md')));
  assert.ok(fs.existsSync(path.join(result.skuImageDir, 'openclaw-input', 'selected-reference-images')));
  assert.ok(fs.existsSync(path.join(result.skuImageDir, 'openclaw-output')));
  assert.ok(fs.existsSync(path.join(result.skuImageDir, 'qc', 'approved')));
  assert.ok(fs.existsSync(path.join(result.skuImageDir, 'qc', 'rejected')));
  assert.ok(fs.existsSync(path.join(result.skuImageDir, 'final')));

  const prompt = fs.readFileSync(result.promptPath, 'utf8');
  assert.match(prompt, /Custom Pet Photo Mug/);
  assert.match(prompt, /No supplier watermark/);
  assert.match(prompt, /Do not change the product core structure/);
});

test('runImageQc writes reports and copies acceptable images into final', () => {
  const root = tempProject();
  createSourceRecord(sourceInput(), { root, now: '2026-05-25T12:00:00.000Z' });
  const brief = createOpenClawBrief({ sku: 'DIY-PET-020', product_name: 'Custom Pet Photo Mug' }, { root });
  const outputDir = path.join(brief.skuImageDir, 'openclaw-output');

  fs.writeFileSync(path.join(outputDir, 'generated-01.png'), 'fake image');
  fs.writeFileSync(path.join(outputDir, 'generated-watermark.png'), 'fake image');

  const result = runImageQc({
    sku: 'DIY-PET-020',
    reject: 'generated-watermark.png'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.summary.approved, 1);
  assert.equal(result.summary.rejected, 1);
  assert.ok(fs.existsSync(path.join(brief.skuImageDir, 'qc', 'qc-report.md')));
  assert.ok(fs.existsSync(path.join(brief.skuImageDir, 'qc', 'qc-report.json')));
  assert.ok(fs.existsSync(path.join(brief.skuImageDir, 'final', 'generated-01.png')));
  assert.ok(fs.existsSync(path.join(brief.skuImageDir, 'qc', 'rejected', 'generated-watermark.png')));

  const report = core.readJson(path.join(brief.skuImageDir, 'qc', 'qc-report.json'), {});
  assert.equal(report.results.length, 2);
  assert.equal(report.summary.approved, 1);
});

test('generateProductDraft writes markdown/json drafts and updates SKU map', () => {
  const root = tempProject();
  createSourceRecord(sourceInput(), { root, now: '2026-05-25T12:00:00.000Z' });
  const brief = createOpenClawBrief({ sku: 'DIY-PET-020', product_name: 'Custom Pet Photo Mug' }, { root });
  fs.writeFileSync(path.join(brief.skuImageDir, 'openclaw-output', 'generated-01.png'), 'fake image');
  runImageQc({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });

  const result = generateProductDraft({
    sku: 'DIY-PET-020',
    product_title: 'Custom Pet Photo Mug',
    target_keyword: 'custom pet photo mug',
    target_selling_price: '28'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.ok(fs.existsSync(result.markdownPath));
  assert.ok(fs.existsSync(result.jsonPath));

  const markdown = fs.readFileSync(result.markdownPath, 'utf8');
  assert.match(markdown, /# Custom Pet Photo Mug/);
  assert.match(markdown, /SEO Title:/);
  assert.match(markdown, /FAQ/);
  assert.match(markdown, /Supplier Trace/);

  const map = core.readJson(core.workspacePaths(root).productSourceMap, {});
  assert.equal(map['DIY-PET-020'].listing_draft_path, '.agent/drafts/products/DIY-PET-020-2026-05-25.md');

  const readiness = checkListingReadiness({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });
  assert.equal(readiness.status, 'ready_to_list');
});

test('calculateProfit returns gross and net margin classifications', () => {
  const result = calculateProfit({
    supplier_price: '8',
    domestic_shipping_fee: '2',
    international_shipping_estimate: '6',
    platform_fee: '1',
    payment_fee: '1.5',
    packaging_cost: '1',
    ad_cost_estimate: '4',
    target_selling_price: '38'
  });

  assert.equal(result.totalCost, 23.5);
  assert.equal(result.grossProfit, 22);
  assert.equal(result.netProfitEstimate, 14.5);
  assert.equal(result.grossMargin, 0.5789);
  assert.equal(result.marginDecision, 'testable');
});

test('checkListingReadiness fails before draft exists and passes once all local artifacts exist', () => {
  const root = tempProject();
  createSourceRecord(sourceInput({ listing_draft_path: '.agent/drafts/products/DIY-PET-020-2026-05-25.md' }), {
    root,
    now: '2026-05-25T12:00:00.000Z'
  });
  const brief = createOpenClawBrief({ sku: 'DIY-PET-020', product_name: 'Custom Pet Photo Mug' }, { root });
  fs.writeFileSync(path.join(brief.skuImageDir, 'openclaw-output', 'generated-01.png'), 'fake image');
  runImageQc({ sku: 'DIY-PET-020' }, { root, now: '2026-05-25T12:00:00.000Z' });

  const beforeDraft = checkListingReadiness({ sku: 'DIY-PET-020' }, { root });
  assert.equal(beforeDraft.status, 'missing_required_fields');
  assert.ok(beforeDraft.missing.includes('listing_draft'));

  const draftPath = path.join(root, '.agent', 'drafts', 'products', 'DIY-PET-020-2026-05-25.md');
  fs.mkdirSync(path.dirname(draftPath), { recursive: true });
  fs.writeFileSync(draftPath, '# Custom Pet Photo Mug\n\nSEO Title: Custom Pet Photo Mug\n\nFAQ\n');

  const afterDraft = checkListingReadiness({ sku: 'DIY-PET-020' }, { root });
  assert.equal(afterDraft.status, 'ready_to_list');
  assert.deepEqual(afterDraft.missing, []);
});

test('createPurchaseTask writes purchase record and Markdown task from SKU map', () => {
  const root = tempProject();
  createSourceRecord(sourceInput(), { root, now: '2026-05-25T12:00:00.000Z' });

  const result = createPurchaseTask({
    order_id: '1008',
    yaopulife_sku: 'DIY-PET-020',
    customer_country: 'US',
    quantity: '2',
    selected_spec: '11oz white mug'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.record.purchase_id, 'PUR-20260525-001');
  assert.equal(result.record.source_id, 'SRC-20260525-001');
  assert.equal(result.record.purchase_status, 'pending');
  assert.ok(fs.existsSync(result.taskPath));
  assert.match(fs.readFileSync(result.taskPath, 'utf8'), /Open the supplier URL/);
  assert.match(fs.readFileSync(result.taskPath, 'utf8'), /https:\/\/detail\.1688\.com\/test-mug/);

  const purchaseCsv = core.readCsv(core.workspacePaths(root).purchaseMasterCsv);
  assert.equal(purchaseCsv.rows.length, 1);
  assert.equal(purchaseCsv.rows[0].supplier_product_url, 'https://detail.1688.com/test-mug');
});

test('createPurchaseTask accepts CLI-shaped camelCase aliases', () => {
  const root = tempProject();
  createSourceRecord(sourceInput(), { root, now: '2026-05-25T12:00:00.000Z' });

  const result = createPurchaseTask({
    orderId: '1009',
    yaopulifeSku: 'DIY-PET-020',
    customerCountry: 'US'
  }, { root, now: '2026-05-25T12:00:00.000Z' });

  assert.equal(result.record.order_id, '1009');
  assert.equal(result.record.yaopulife_sku, 'DIY-PET-020');
  assert.equal(result.record.customer_country, 'US');
});
