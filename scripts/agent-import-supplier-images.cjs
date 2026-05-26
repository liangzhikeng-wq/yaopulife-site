#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extensionFor(file) {
  const ext = path.extname(file).toLowerCase();
  return ext || '.jpg';
}

function nextImageName(rawDir, ext) {
  const existing = core.listImageFiles(rawDir)
    .map((file) => {
      const match = file.match(/^supplier-(\d+)\./);
      return match ? Number(match[1]) : 0;
    })
    .filter(Boolean);
  const next = existing.length ? Math.max(...existing) + 1 : 1;
  return `supplier-${String(next).padStart(2, '0')}${ext}`;
}

function validateImagePath(file) {
  if (!fs.existsSync(file)) throw new Error(`Image file does not exist: ${file}`);
  if (!/\.(png|jpe?g|webp)$/i.test(file)) throw new Error(`Unsupported image type: ${file}`);
}

function importSupplierImages(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const normalizedInput = core.normalizeAliases(input, ['sku', 'source_url']);

  core.assertRequired(normalizedInput, ['sku']);

  const images = asArray(normalizedInput.image || normalizedInput.images);
  if (images.length === 0) throw new Error('Missing required fields: image');

  const skuImageDir = path.join(paths.downloadedImagesRoot, normalizedInput.sku);
  const rawDir = path.join(skuImageDir, 'raw');
  core.ensureDir(rawDir);

  const metadataPath = path.join(rawDir, 'image-source.json');
  const metadata = core.readJson(metadataPath, {
    sku: normalizedInput.sku,
    created_at: now,
    updated_at: now,
    images: []
  });

  const imported = [];
  for (const image of images) {
    const absoluteSource = path.resolve(root, image);
    validateImagePath(absoluteSource);
    const filename = nextImageName(rawDir, extensionFor(absoluteSource));
    const destination = path.join(rawDir, filename);
    core.copyFile(absoluteSource, destination);

    const entry = {
      filename,
      raw_path: core.relativeAgentPath(root, destination),
      original_path: absoluteSource,
      source_url: normalizedInput.source_url || normalizedInput.sourceUrl || '',
      note: normalizedInput.note || '',
      imported_at: now
    };
    metadata.images.push(entry);
    imported.push(entry);
  }

  metadata.updated_at = now;
  core.writeJson(metadataPath, metadata);

  const map = core.readJson(paths.productSourceMap, {});
  if (map[normalizedInput.sku]) {
    map[normalizedInput.sku].main_image_folder = core.relativeAgentPath(root, rawDir);
    core.writeJson(paths.productSourceMap, map);
  }

  core.writeLog(root, 'images', {
    event: 'supplier_images_imported',
    sku: normalizedInput.sku,
    count: imported.length,
    timestamp: now
  });

  return {
    sku: normalizedInput.sku,
    rawDir,
    metadataPath,
    imported
  };
}

function main() {
  const args = core.parseArgs();
  const result = importSupplierImages(args);
  process.stdout.write(`${JSON.stringify({
    sku: result.sku,
    imported: result.imported.length,
    rawDir: result.rawDir,
    metadataPath: result.metadataPath
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

module.exports = { importSupplierImages };
