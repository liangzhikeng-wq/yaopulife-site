#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

function findSource(paths, sku) {
  return core.readCsv(paths.sourcingMasterCsv, core.SOURCE_HEADERS).rows
    .find((row) => row.yaopulife_sku === sku);
}

function fileExists(file) {
  return Boolean(file && fs.existsSync(file));
}

function rel(root, absolutePath) {
  return core.relativeAgentPath(root, absolutePath);
}

function draftPath(root, source, mapEntry) {
  const value = source?.listing_draft_path || mapEntry?.listing_draft_path || '';
  if (!value) return '';
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function pipelineState(root, sku) {
  const paths = core.ensureWorkspace(root);
  const source = findSource(paths, sku);
  const map = core.readJson(paths.productSourceMap, {});
  const mapEntry = map[sku];
  const skuImageDir = path.join(paths.downloadedImagesRoot, sku);
  const rawDir = path.join(skuImageDir, 'raw');
  const promptPath = path.join(skuImageDir, 'openclaw-input', 'prompt.md');
  const outputDir = path.join(skuImageDir, 'openclaw-output');
  const qcReport = path.join(skuImageDir, 'qc', 'qc-report.md');
  const finalDir = path.join(skuImageDir, 'final');
  const resolvedDraftPath = draftPath(root, source, mapEntry);

  return {
    paths,
    source,
    mapEntry,
    skuImageDir,
    rawDir,
    promptPath,
    outputDir,
    qcReport,
    finalDir,
    draftPath: resolvedDraftPath,
    has_source: Boolean(source),
    has_map_entry: Boolean(mapEntry),
    raw_images: core.listImageFiles(rawDir).length,
    has_openclaw_brief: fileExists(promptPath),
    openclaw_output_images: core.listImageFiles(outputDir).length,
    has_qc_report: fileExists(qcReport),
    final_images: core.listImageFiles(finalDir).length,
    has_product_draft: fileExists(resolvedDraftPath)
  };
}

function commandForStep(step, sku, state, input) {
  const productName = input.product_name || input.productName || state.source?.overseas_product_title || state.source?.supplier_product_title || sku;
  const targetKeyword = input.target_keyword || input.targetKeyword || state.source?.overseas_target_keyword || '';

  if (step === 'source_record') {
    return [
      `node scripts/agent-source-product.cjs --yaopulife-sku ${sku} --supplier-name "Supplier Name" --supplier-product-url "https://detail.1688.com/..." --domestic-platform 1688`
    ];
  }
  if (step === 'openclaw_brief') {
    return [
      `node scripts/agent-create-openclaw-brief.cjs --sku ${sku} --product-name "${productName}"`
    ];
  }
  if (step === 'raw_images') {
    return [
      `node scripts/agent-import-supplier-images.cjs --sku ${sku} --image "/absolute/path/to/supplier-image.jpg"${state.source?.supplier_product_url ? ` --source-url "${state.source.supplier_product_url}"` : ''}`
    ];
  }
  if (step === 'openclaw_output') {
    return [
      `Place generated images into ${rel(state.paths.root, state.outputDir)}/`
    ];
  }
  if (step === 'image_qc') {
    return [
      `node scripts/agent-image-qc.cjs --sku ${sku}`
    ];
  }
  if (step === 'product_draft') {
    return [
      `node scripts/agent-generate-product.cjs --sku ${sku} --product-title "${productName}"${targetKeyword ? ` --target-keyword "${targetKeyword}"` : ''}`
    ];
  }
  if (step === 'readiness_check') {
    return [
      `node scripts/agent-listing-readiness-check.cjs --sku ${sku}`
    ];
  }
  return [
    `node scripts/agent-listing-readiness-check.cjs --sku ${sku}`
  ];
}

function evaluatePipeline(input, state) {
  const missing = [];
  let currentStep = 'ready_for_review';

  if (!state.has_source) {
    missing.push('sourcing_record');
    currentStep = 'source_record';
  } else if (!state.has_map_entry) {
    missing.push('product_source_map');
    currentStep = 'source_record';
  } else if (state.raw_images === 0) {
    missing.push('raw_supplier_images');
    currentStep = 'raw_images';
  } else if (!state.has_openclaw_brief) {
    missing.push('openclaw_brief');
    currentStep = 'openclaw_brief';
  } else if (state.openclaw_output_images === 0) {
    missing.push('openclaw_output_images');
    currentStep = 'openclaw_output';
  } else if (!state.has_qc_report) {
    missing.push('qc_report');
    currentStep = 'image_qc';
  } else if (state.final_images === 0) {
    missing.push('final_images');
    currentStep = 'image_qc';
  } else if (!state.has_product_draft) {
    missing.push('product_draft');
    currentStep = 'product_draft';
  } else {
    currentStep = 'readiness_check';
  }

  return {
    status: currentStep === 'readiness_check' ? 'ready_for_readiness_check' : 'blocked',
    current_step: currentStep,
    missing,
    next_commands: commandForStep(currentStep, input.sku, state, input)
  };
}

function markdown(report) {
  return `# SKU Pipeline Report

SKU: ${report.sku}
Generated At: ${report.generated_at}
Status: ${report.status}
Current Step: ${report.current_step}

## Missing

${report.missing.map((item) => `- ${item}`).join('\n') || '- None'}

## State

- Has Source Record: ${report.state.has_source ? 'yes' : 'no'}
- Has Product Source Map Entry: ${report.state.has_map_entry ? 'yes' : 'no'}
- Raw Supplier Images: ${report.state.raw_images}
- Has OpenClaw Brief: ${report.state.has_openclaw_brief ? 'yes' : 'no'}
- OpenClaw Output Images: ${report.state.openclaw_output_images}
- Has QC Report: ${report.state.has_qc_report ? 'yes' : 'no'}
- Final Images: ${report.state.final_images}
- Has Product Draft: ${report.state.has_product_draft ? 'yes' : 'no'}

## Next Commands

${report.next_commands.map((command) => `\`\`\`bash\n${command}\n\`\`\``).join('\n\n')}

## Guardrail

This pipeline report does not publish products, change prices, send customer emails, or place supplier orders.
`;
}

function runSkuPipeline(input = {}, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  core.assertRequired(input, ['sku']);

  const state = pipelineState(root, input.sku);
  const evaluated = evaluatePipeline(input, state);
  const publicState = {
    has_source: state.has_source,
    has_map_entry: state.has_map_entry,
    raw_images: state.raw_images,
    has_openclaw_brief: state.has_openclaw_brief,
    openclaw_output_images: state.openclaw_output_images,
    has_qc_report: state.has_qc_report,
    final_images: state.final_images,
    has_product_draft: state.has_product_draft
  };
  const report = {
    sku: input.sku,
    generated_at: now,
    ...evaluated,
    state: publicState
  };
  const reportDir = path.join(state.paths.reportsRoot, 'pipelines');
  core.ensureDir(reportDir);
  const jsonPath = path.join(reportDir, `${input.sku}.json`);
  const markdownPath = path.join(reportDir, `${input.sku}.md`);
  core.writeJson(jsonPath, report);
  fs.writeFileSync(markdownPath, markdown(report));

  core.writeLog(root, 'pipeline', {
    event: 'sku_pipeline_checked',
    sku: input.sku,
    status: report.status,
    current_step: report.current_step,
    timestamp: now
  });

  return {
    ...report,
    jsonPath,
    markdownPath
  };
}

function main() {
  const args = core.parseArgs();
  const result = runSkuPipeline(args);
  process.stdout.write(`${JSON.stringify({
    sku: result.sku,
    status: result.status,
    current_step: result.current_step,
    missing: result.missing,
    next_commands: result.next_commands,
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

module.exports = { runSkuPipeline };
