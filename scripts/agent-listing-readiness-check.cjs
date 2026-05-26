#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

function resolveProjectPath(root, maybeRelativePath) {
  if (!maybeRelativePath) return '';
  return path.isAbsolute(maybeRelativePath) ? maybeRelativePath : path.join(root, maybeRelativePath);
}

function checkListingReadiness(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);

  core.assertRequired(input, ['sku']);

  const sku = input.sku;
  const sourceRows = core.readCsv(paths.sourcingMasterCsv, core.SOURCE_HEADERS).rows;
  const source = sourceRows.find((row) => row.yaopulife_sku === sku);
  const map = core.readJson(paths.productSourceMap, {});
  const mapEntry = map[sku];
  const skuImageDir = path.join(paths.downloadedImagesRoot, sku);
  const qcReport = path.join(skuImageDir, 'qc', 'qc-report.md');
  const finalDir = path.join(skuImageDir, 'final');
  const draftPath = resolveProjectPath(root, source?.listing_draft_path || mapEntry?.listing_draft_path);
  const missing = [];

  if (!source) missing.push('sourcing_record');
  if (!mapEntry) missing.push('product_source_map');
  if (!source?.supplier_product_url && !mapEntry?.supplier_product_url) missing.push('supplier_product_url');
  if (!fs.existsSync(qcReport)) missing.push('qc_report');
  if (core.listImageFiles(finalDir).length === 0) missing.push('final_images');
  if (!draftPath || !fs.existsSync(draftPath)) missing.push('listing_draft');

  const result = {
    sku,
    checked_at: now,
    status: missing.length ? 'missing_required_fields' : 'ready_to_list',
    missing,
    needs_human_review: true,
    source_id: source?.source_id || mapEntry?.source_id || '',
    supplier_product_url: source?.supplier_product_url || mapEntry?.supplier_product_url || ''
  };

  const reportDir = path.join(paths.reportsRoot, 'listing-readiness');
  core.ensureDir(reportDir);
  const reportPath = path.join(reportDir, `${sku}-${now.slice(0, 10)}.json`);
  core.writeJson(reportPath, result);

  return { ...result, reportPath };
}

function main() {
  const args = core.parseArgs();
  const result = checkListingReadiness(args);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

module.exports = { checkListingReadiness };
