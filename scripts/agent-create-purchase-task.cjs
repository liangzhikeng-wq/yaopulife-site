#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

function purchaseTaskMarkdown(record) {
  return `# Purchase Task ${record.purchase_id}

Order ID: ${record.order_id}
SKU: ${record.yaopulife_sku}
Customer Country: ${record.customer_country}
Quantity: ${record.quantity}
Selected Spec: ${record.selected_spec}

## Supplier

- Source ID: ${record.source_id}
- Supplier: ${record.supplier_name}
- Supplier URL: ${record.supplier_product_url}
- Listing Price: ${record.supplier_price_at_listing}
- Stock Status: ${record.stock_status}

## Manual Steps

1. Open the supplier URL.
2. Confirm current price, stock, customization support, and selected spec.
3. Update supplier price at purchase if it changed.
4. Place the supplier order manually only after confirmation.
5. Add supplier order number and tracking numbers to purchase records.
`;
}

function createPurchaseTask(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const normalizedInput = core.normalizeAliases(input, core.PURCHASE_HEADERS);

  core.assertRequired(normalizedInput, ['order_id', 'yaopulife_sku']);

  const sku = normalizedInput.yaopulife_sku;
  const map = core.readJson(paths.productSourceMap, {});
  const mapEntry = map[sku];
  if (!mapEntry) throw new Error(`No product-source-map entry for SKU: ${sku}`);

  const sourceRows = core.readCsv(paths.sourcingMasterCsv, core.SOURCE_HEADERS).rows;
  const source = sourceRows.find((row) => row.source_id === mapEntry.source_id || row.yaopulife_sku === sku) || {};
  const existingPurchases = core.readCsv(paths.purchaseMasterCsv, core.PURCHASE_HEADERS);
  const record = core.normalizeRecord({
    purchase_id: core.createSequentialId('PUR', now, existingPurchases.rows, 'purchase_id'),
    order_id: normalizedInput.order_id,
    yaopulife_sku: sku,
    customer_country: normalizedInput.customer_country || '',
    customer_order_date: normalizedInput.customer_order_date || now.slice(0, 10),
    source_id: mapEntry.source_id,
    supplier_name: source.supplier_name || mapEntry.supplier_name,
    supplier_product_url: source.supplier_product_url || mapEntry.supplier_product_url,
    supplier_price_at_listing: source.supplier_price_min || mapEntry.supplier_price,
    supplier_price_at_purchase: normalizedInput.supplier_price_at_purchase || '',
    price_changed: normalizedInput.price_changed || 'unknown',
    stock_status: source.stock_status || 'unknown',
    selected_spec: normalizedInput.selected_spec || '',
    quantity: normalizedInput.quantity || '1',
    purchase_status: normalizedInput.purchase_status || 'pending',
    purchase_date: normalizedInput.purchase_date || '',
    domestic_tracking_number: '',
    international_tracking_number: '',
    supplier_order_number: '',
    notes: normalizedInput.notes || '',
    created_at: now,
    updated_at: now
  }, core.PURCHASE_HEADERS);

  core.appendCsvRow(paths.purchaseMasterCsv, core.PURCHASE_HEADERS, record);

  const taskPath = path.join(paths.purchaseRoot, `${record.purchase_id}.md`);
  fs.writeFileSync(taskPath, purchaseTaskMarkdown(record));

  core.writeLog(root, 'purchase', {
    event: 'purchase_task_created',
    purchase_id: record.purchase_id,
    order_id: record.order_id,
    yaopulife_sku: sku,
    timestamp: now
  });

  return { record, taskPath };
}

function main() {
  const args = core.parseArgs();
  const result = createPurchaseTask(args);
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

module.exports = { createPurchaseTask };
