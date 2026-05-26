#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

function normalizeList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function imageDecision(file, rejectList) {
  const lower = file.toLowerCase();
  const manuallyRejected = rejectList.includes(file);
  const autoRejected = /watermark|1688|taobao|pinduoduo|pdd|chinese|bad|reject/.test(lower);

  if (manuallyRejected || autoRejected) {
    return {
      final_decision: 'reject',
      clarity_score: 0,
      realism_score: 0,
      product_consistency_score: 0,
      material_accuracy_score: 0,
      background_score: 0,
      ai_artifact_score: 0,
      store_fit_score: 0,
      notes: manuallyRejected ? 'Manually rejected by operator.' : 'Filename indicates a reject condition.'
    };
  }

  return {
    final_decision: 'approve',
    clarity_score: 85,
    realism_score: 85,
    product_consistency_score: 85,
    material_accuracy_score: 85,
    background_score: 85,
    ai_artifact_score: 85,
    store_fit_score: 85,
    notes: 'File-level MVP QC approved. Human visual review is still recommended before publishing.'
  };
}

function reportMarkdown(sku, now, results) {
  const approved = results.filter((item) => item.final_decision === 'approve');
  const rejected = results.filter((item) => item.final_decision === 'reject');

  return `# Image QC Report

SKU: ${sku}
Date: ${now}

## Summary

Approved: ${approved.length}
Rejected: ${rejected.length}
Need Review: 0

## Image Results

${results.map((item) => `### Image: ${item.image}
- Clarity Score: ${item.clarity_score}
- Realism Score: ${item.realism_score}
- Product Consistency Score: ${item.product_consistency_score}
- Material Accuracy Score: ${item.material_accuracy_score}
- Background Score: ${item.background_score}
- AI Artifact Score: ${item.ai_artifact_score}
- Store Fit Score: ${item.store_fit_score}
- Final Decision: ${item.final_decision}
- Notes: ${item.notes}
`).join('\n')}
## Approved Images

${approved.map((item) => `- ${item.image}`).join('\n') || '- None'}

## Rejected Images

${rejected.map((item) => `- ${item.image}`).join('\n') || '- None'}

## Human Review Needed

- Human visual review is required before any image is used on the live store.
`;
}

function runImageQc(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);

  core.assertRequired(input, ['sku']);

  const skuImageDir = path.join(paths.downloadedImagesRoot, input.sku);
  const outputDir = path.join(skuImageDir, 'openclaw-output');
  const qcDir = path.join(skuImageDir, 'qc');
  const rejectedDir = path.join(qcDir, 'rejected');
  const approvedDir = path.join(qcDir, 'approved');
  const finalDir = path.join(skuImageDir, 'final');
  [rejectedDir, approvedDir, finalDir].forEach(core.ensureDir);

  const rejectList = normalizeList(input.reject);
  const files = core.listImageFiles(outputDir);
  const results = files.map((file) => ({
    image: file,
    ...imageDecision(file, rejectList)
  }));

  for (const result of results) {
    const source = path.join(outputDir, result.image);
    if (result.final_decision === 'approve') {
      core.copyFile(source, path.join(approvedDir, result.image));
      core.copyFile(source, path.join(finalDir, result.image));
    } else {
      core.copyFile(source, path.join(rejectedDir, result.image));
    }
  }

  const summary = {
    approved: results.filter((item) => item.final_decision === 'approve').length,
    rejected: results.filter((item) => item.final_decision === 'reject').length,
    need_review: 0
  };
  const report = {
    sku: input.sku,
    date: now,
    summary,
    results
  };

  const reportJsonPath = path.join(qcDir, 'qc-report.json');
  const reportMdPath = path.join(qcDir, 'qc-report.md');
  core.writeJson(reportJsonPath, report);
  fs.writeFileSync(reportMdPath, reportMarkdown(input.sku, now, results));

  core.writeLog(root, 'images', {
    event: 'image_qc_completed',
    sku: input.sku,
    summary,
    timestamp: now
  });

  return {
    ...report,
    reportJsonPath,
    reportMdPath
  };
}

function main() {
  const args = core.parseArgs();
  const result = runImageQc(args);
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

module.exports = { runImageQc };
