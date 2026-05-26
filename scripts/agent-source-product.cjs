#!/usr/bin/env node

const core = require('./agent-core.cjs');

function createSourceRecord(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const normalizedInput = core.normalizeAliases(input, core.SOURCE_HEADERS);

  core.assertRequired(normalizedInput, ['yaopulife_sku', 'supplier_name', 'supplier_product_url']);

  const existing = core.readCsv(paths.sourcingMasterCsv, core.SOURCE_HEADERS);
  const sku = normalizedInput.yaopulife_sku;
  const record = core.normalizeRecord({
    ...normalizedInput,
    source_id: normalizedInput.source_id || core.createSequentialId('SRC', now, existing.rows, 'source_id'),
    product_status: normalizedInput.product_status || 'candidate',
    currency: normalizedInput.currency || 'CNY',
    stock_status: normalizedInput.stock_status || 'unknown',
    main_image_folder: normalizedInput.main_image_folder || `.agent/sourcing/downloaded-images/${sku}/raw`,
    openclaw_output_folder: normalizedInput.openclaw_output_folder || `.agent/sourcing/downloaded-images/${sku}/openclaw-output`,
    approved_image_folder: normalizedInput.approved_image_folder || `.agent/sourcing/downloaded-images/${sku}/final`,
    created_at: normalizedInput.created_at || now,
    updated_at: now
  }, core.SOURCE_HEADERS);

  core.appendCsvRow(paths.sourcingMasterCsv, core.SOURCE_HEADERS, record);

  const map = core.readJson(paths.productSourceMap, {});
  map[sku] = {
    source_id: record.source_id,
    supplier_product_url: record.supplier_product_url,
    supplier_name: record.supplier_name,
    supplier_price: record.supplier_price_min || record.supplier_price_max || '',
    main_image_folder: record.main_image_folder,
    approved_image_folder: record.approved_image_folder,
    listing_draft_path: record.listing_draft_path,
    status: record.product_status
  };
  core.writeJson(paths.productSourceMap, map);

  const suppliers = core.readJson(paths.suppliersJson, { suppliers: [] });
  const knownSupplier = suppliers.suppliers.find((supplier) => supplier.supplier_name === record.supplier_name);
  if (!knownSupplier) {
    suppliers.suppliers.push({
      supplier_name: record.supplier_name,
      supplier_store_url: record.supplier_store_url,
      domestic_platform: record.domestic_platform,
      created_at: now,
      updated_at: now
    });
    core.writeJson(paths.suppliersJson, suppliers);
  }

  core.writeLog(root, 'sourcing', {
    event: 'source_record_created',
    source_id: record.source_id,
    yaopulife_sku: sku,
    timestamp: now
  });

  return { record, mapEntry: map[sku] };
}

function main() {
  const args = core.parseArgs();
  const result = createSourceRecord(args);
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

module.exports = { createSourceRecord };
