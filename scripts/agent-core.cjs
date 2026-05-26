#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const SOURCE_HEADERS = [
  'source_id',
  'product_id',
  'yaopulife_sku',
  'product_status',
  'research_id',
  'overseas_reference_platform',
  'overseas_reference_url',
  'overseas_product_title',
  'overseas_target_keyword',
  'domestic_platform',
  'domestic_search_keyword',
  'supplier_name',
  'supplier_store_url',
  'supplier_product_url',
  'supplier_product_title',
  'supplier_product_id',
  'supplier_price_min',
  'supplier_price_max',
  'currency',
  'moq',
  'supports_dropshipping',
  'supports_customization',
  'material',
  'size',
  'color_options',
  'shipping_origin',
  'domestic_shipping_fee',
  'estimated_weight',
  'supplier_rating',
  'monthly_sales',
  'review_count',
  'image_quality_score',
  'style_match_score',
  'price_score',
  'supplier_reliability_score',
  'overall_source_score',
  'main_image_folder',
  'openclaw_output_folder',
  'approved_image_folder',
  'listing_draft_path',
  'published_product_url',
  'published_date',
  'last_checked_date',
  'stock_status',
  'purchase_notes',
  'risk_notes',
  'backup_supplier_1',
  'backup_supplier_2',
  'created_at',
  'updated_at'
];

const PURCHASE_HEADERS = [
  'purchase_id',
  'order_id',
  'yaopulife_sku',
  'customer_country',
  'customer_order_date',
  'source_id',
  'supplier_name',
  'supplier_product_url',
  'supplier_price_at_listing',
  'supplier_price_at_purchase',
  'price_changed',
  'stock_status',
  'selected_spec',
  'quantity',
  'purchase_status',
  'purchase_date',
  'domestic_tracking_number',
  'international_tracking_number',
  'supplier_order_number',
  'notes',
  'created_at',
  'updated_at'
];

function toCamelCase(key) {
  return String(key).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function parseArgs(argv = process.argv.slice(2)) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;

    const raw = token.slice(2);
    const eqIndex = raw.indexOf('=');
    const key = toCamelCase(eqIndex === -1 ? raw : raw.slice(0, eqIndex));
    let value;

    if (eqIndex !== -1) {
      value = raw.slice(eqIndex + 1);
    } else if (argv[i + 1] && !argv[i + 1].startsWith('--')) {
      value = argv[i + 1];
      i += 1;
    } else {
      value = true;
    }

    if (Object.prototype.hasOwnProperty.call(args, key)) {
      args[key] = Array.isArray(args[key]) ? [...args[key], value] : [args[key], value];
    } else {
      args[key] = value;
    }
  }

  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  const text = fs.readFileSync(file, 'utf8').trim();
  if (!text) return fallback;
  return JSON.parse(text);
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = rows[0];
  const dataRows = rows.slice(1).filter((values) => values.some((value) => value !== ''));

  return {
    headers,
    rows: dataRows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])))
  };
}

function escapeCsvValue(value) {
  const text = value === undefined || value === null ? '' : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function stringifyCsv(rows, headers) {
  const lines = [headers.map(escapeCsvValue).join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvValue(row[header])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function readCsv(file, fallbackHeaders = []) {
  if (!fs.existsSync(file)) return { headers: fallbackHeaders, rows: [] };
  return parseCsv(fs.readFileSync(file, 'utf8'));
}

function writeCsv(file, headers, rows) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, stringifyCsv(rows, headers));
}

function appendCsvRow(file, headers, row) {
  const existing = readCsv(file, headers);
  const nextHeaders = existing.headers.length ? existing.headers : headers;
  const rows = [...existing.rows, normalizeRecord(row, nextHeaders)];
  writeCsv(file, nextHeaders, rows);
  return rows;
}

function normalizeRecord(input, headers) {
  return Object.fromEntries(headers.map((header) => [header, input[header] === undefined ? '' : String(input[header])]));
}

function snakeToCamel(value) {
  return String(value).replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function normalizeAliases(input, fields) {
  const output = { ...input };
  for (const field of fields) {
    const camel = snakeToCamel(field);
    if ((output[field] === undefined || output[field] === '') && output[camel] !== undefined) {
      output[field] = output[camel];
    }
  }
  return output;
}

function compactDate(isoDate) {
  return new Date(isoDate).toISOString().slice(0, 10).replace(/-/g, '');
}

function createSequentialId(prefix, isoDate, existingRows, idField) {
  const date = compactDate(isoDate);
  const idPrefix = `${prefix}-${date}-`;
  const max = existingRows.reduce((highest, row) => {
    const value = row[idField] || '';
    if (!value.startsWith(idPrefix)) return highest;
    const sequence = Number(value.slice(idPrefix.length));
    return Number.isFinite(sequence) ? Math.max(highest, sequence) : highest;
  }, 0);
  return `${idPrefix}${String(max + 1).padStart(3, '0')}`;
}

function assertRequired(input, fields) {
  const missing = fields.filter((field) => input[field] === undefined || input[field] === null || input[field] === '');
  if (missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`);
}

function workspacePaths(projectRoot = process.cwd()) {
  const root = path.resolve(projectRoot);
  const agentRoot = path.join(root, '.agent');
  const sourcingRoot = path.join(agentRoot, 'sourcing');
  const purchaseRoot = path.join(sourcingRoot, 'purchase-records');

  return {
    root,
    agentRoot,
    configRoot: path.join(agentRoot, 'config'),
    draftsRoot: path.join(agentRoot, 'drafts'),
    reportsRoot: path.join(agentRoot, 'reports'),
    logsRoot: path.join(agentRoot, 'logs'),
    approvalsRoot: path.join(agentRoot, 'approvals'),
    sourcingRoot,
    downloadedImagesRoot: path.join(sourcingRoot, 'downloaded-images'),
    sourcingMasterCsv: path.join(sourcingRoot, 'sourcing-master.csv'),
    suppliersJson: path.join(sourcingRoot, 'suppliers.json'),
    productSourceMap: path.join(sourcingRoot, 'product-source-map.json'),
    purchaseRoot,
    purchaseMasterCsv: path.join(purchaseRoot, 'purchase-master.csv')
  };
}

function ensureFile(file, content) {
  if (fs.existsSync(file)) return;
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
}

function ensureWorkspace(projectRoot = process.cwd()) {
  const paths = workspacePaths(projectRoot);
  [
    paths.configRoot,
    paths.draftsRoot,
    paths.reportsRoot,
    paths.logsRoot,
    paths.approvalsRoot,
    paths.sourcingRoot,
    paths.downloadedImagesRoot,
    paths.purchaseRoot
  ].forEach(ensureDir);

  ensureFile(paths.sourcingMasterCsv, stringifyCsv([], SOURCE_HEADERS));
  ensureFile(paths.purchaseMasterCsv, stringifyCsv([], PURCHASE_HEADERS));
  ensureFile(paths.suppliersJson, '{\n  "suppliers": []\n}\n');
  ensureFile(paths.productSourceMap, '{}\n');

  return paths;
}

function relativeAgentPath(projectRoot, absolutePath) {
  return path.relative(path.resolve(projectRoot), absolutePath).split(path.sep).join('/');
}

function listImageFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => /\.(png|jpe?g|webp)$/i.test(file))
    .sort();
}

function copyFile(source, destination) {
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination);
}

function writeLog(projectRoot, name, payload) {
  const paths = ensureWorkspace(projectRoot);
  const logPath = path.join(paths.logsRoot, `${name}.jsonl`);
  fs.appendFileSync(logPath, `${JSON.stringify(payload)}\n`);
  return logPath;
}

module.exports = {
  SOURCE_HEADERS,
  PURCHASE_HEADERS,
  appendCsvRow,
  assertRequired,
  copyFile,
  createSequentialId,
  ensureDir,
  ensureWorkspace,
  listImageFiles,
  normalizeAliases,
  normalizeRecord,
  parseArgs,
  parseCsv,
  readCsv,
  readJson,
  relativeAgentPath,
  stringifyCsv,
  workspacePaths,
  writeCsv,
  writeJson,
  writeLog
};
