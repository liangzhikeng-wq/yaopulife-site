#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

function createPrompt(input, context) {
  const outputCount = input.output_count || input.outputCount || '5';
  return `# OpenClaw Image Generation Brief

SKU: ${input.sku}
Product: ${input.product_name || input.productName || context.source.overseas_product_title || context.source.supplier_product_title || input.sku}
Target Market: ${input.target_market || input.targetMarket || 'US/EU'}
Reference Images Folder: ${context.rawDir}

Goal:
Generate high-resolution independent-store product images inspired by the reference product, but not identical.

Image Style:
- Premium handmade gift style
- Clean independent store photography
- Warm, emotional, gift-ready presentation
- Soft neutral background
- No supplier watermark
- No Chinese text
- No marketplace UI
- No fake reviews
- No excessive AI fantasy style

Required Outputs:
1. Main product image, clean background
2. Lifestyle scene image
3. Detail close-up image
4. Gift scenario image
5. Size or feature explanation image

Output Count: ${outputCount}

Quality Requirements:
- High resolution
- Natural product shape
- Realistic material texture
- No distorted text
- No broken edges
- No unrealistic shadows
- No obvious AI artifacts
- Do not change the product core structure
- Do not generate functions, parts, or materials not confirmed by supplier
- Suitable for yaopulife.com product pages
`;
}

function findSourceBySku(paths, sku) {
  const sourceRows = core.readCsv(paths.sourcingMasterCsv, core.SOURCE_HEADERS).rows;
  return sourceRows.find((row) => row.yaopulife_sku === sku) || {};
}

function createOpenClawBrief(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);

  core.assertRequired(input, ['sku']);

  const sku = input.sku;
  const skuImageDir = path.join(paths.downloadedImagesRoot, sku);
  const rawDir = path.join(skuImageDir, 'raw');
  const openclawInputDir = path.join(skuImageDir, 'openclaw-input');
  const selectedDir = path.join(openclawInputDir, 'selected-reference-images');
  const openclawOutputDir = path.join(skuImageDir, 'openclaw-output');
  const qcDir = path.join(skuImageDir, 'qc');
  const finalDir = path.join(skuImageDir, 'final');

  [
    rawDir,
    selectedDir,
    openclawOutputDir,
    path.join(qcDir, 'approved'),
    path.join(qcDir, 'rejected'),
    finalDir
  ].forEach(core.ensureDir);

  const source = findSourceBySku(paths, sku);
  const promptPath = path.join(openclawInputDir, 'prompt.md');
  const prompt = createPrompt(input, {
    rawDir,
    source
  });
  fs.writeFileSync(promptPath, prompt);

  const map = core.readJson(paths.productSourceMap, {});
  if (map[sku]) {
    map[sku].main_image_folder = core.relativeAgentPath(root, rawDir);
    map[sku].approved_image_folder = core.relativeAgentPath(root, finalDir);
    core.writeJson(paths.productSourceMap, map);
  }

  core.writeLog(root, 'images', {
    event: 'openclaw_brief_created',
    sku,
    prompt_path: core.relativeAgentPath(root, promptPath),
    timestamp: now
  });

  return {
    sku,
    skuImageDir,
    rawDir,
    openclawInputDir,
    openclawOutputDir,
    qcDir,
    finalDir,
    promptPath
  };
}

function main() {
  const args = core.parseArgs();
  const result = createOpenClawBrief(args);
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

module.exports = { createOpenClawBrief };
