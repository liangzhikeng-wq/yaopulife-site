const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const core = require('../scripts/agent-core.cjs');

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'yaopu-agent-core-'));
}

test('parseArgs supports flags, values, and repeated keys', () => {
  const args = core.parseArgs([
    '--sku',
    'DIY-PET-020',
    '--dry-run',
    '--image',
    'a.png',
    '--image=b.png'
  ]);

  assert.equal(args.sku, 'DIY-PET-020');
  assert.equal(args.dryRun, true);
  assert.deepEqual(args.image, ['a.png', 'b.png']);
});

test('CSV round-trips commas, quotes, and newlines', () => {
  const rows = [
    {
      sku: 'DIY-PET-020',
      title: 'Custom "Pet" Mug',
      notes: 'line one\nline two, with comma'
    }
  ];

  const csv = core.stringifyCsv(rows, ['sku', 'title', 'notes']);
  const parsed = core.parseCsv(csv);

  assert.deepEqual(parsed.headers, ['sku', 'title', 'notes']);
  assert.deepEqual(parsed.rows, rows);
});

test('readJson returns fallback for missing files and writeJson creates parents', () => {
  const root = tempDir();
  const file = path.join(root, 'nested', 'data.json');

  assert.deepEqual(core.readJson(file, { ok: true }), { ok: true });

  core.writeJson(file, { hello: 'world' });

  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { hello: 'world' });
});

test('createSequentialId uses prefix, date, and next sequence', () => {
  const id = core.createSequentialId('SRC', '2026-05-25T12:00:00.000Z', [
    { source_id: 'SRC-20260525-001' },
    { source_id: 'SRC-20260525-002' }
  ], 'source_id');

  assert.equal(id, 'SRC-20260525-003');
});

test('assertRequired reports all missing fields', () => {
  assert.throws(
    () => core.assertRequired({ sku: 'DIY-PET-020' }, ['sku', 'supplier_product_url', 'supplier_name']),
    /supplier_product_url, supplier_name/
  );
});

test('workspacePaths resolves the expected .agent files', () => {
  const root = tempDir();
  const paths = core.workspacePaths(root);

  assert.equal(paths.root, root);
  assert.equal(paths.agentRoot, path.join(root, '.agent'));
  assert.equal(paths.sourcingMasterCsv, path.join(root, '.agent', 'sourcing', 'sourcing-master.csv'));
  assert.equal(paths.productSourceMap, path.join(root, '.agent', 'sourcing', 'product-source-map.json'));
});

test('ensureWorkspace creates starter CSV and JSON structures', () => {
  const root = tempDir();
  const paths = core.ensureWorkspace(root);

  const sourceCsv = core.readCsv(paths.sourcingMasterCsv);
  const purchaseCsv = core.readCsv(paths.purchaseMasterCsv);

  assert.deepEqual(sourceCsv.headers, core.SOURCE_HEADERS);
  assert.deepEqual(purchaseCsv.headers, core.PURCHASE_HEADERS);
  assert.deepEqual(core.readJson(paths.suppliersJson, {}), { suppliers: [] });
  assert.deepEqual(core.readJson(paths.productSourceMap, null), {});
});
