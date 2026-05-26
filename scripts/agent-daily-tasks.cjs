#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

function countFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countFiles(full, predicate);
    else if (predicate(full)) count += 1;
  }
  return count;
}

function readProjectScan(paths) {
  return core.readJson(path.join(paths.reportsRoot, 'project-scan.json'), {
    tech_stack: { framework: 'Unknown' },
    pages: [],
    blog_posts: [],
    product_content: [],
    product_data: [],
    scripts: [],
    docs: []
  });
}

function researchRecords(paths) {
  const dir = path.join(paths.agentRoot, 'research', 'overseas');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      try {
        return core.readJson(path.join(dir, file), {});
      } catch (_error) {
        return {};
      }
    })
    .filter((record) => record.research_id);
}

function imageSkuDirs(paths) {
  if (!fs.existsSync(paths.downloadedImagesRoot)) return [];
  return fs.readdirSync(paths.downloadedImagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'));
}

function qcStatus(paths) {
  return imageSkuDirs(paths).map((sku) => {
    const base = path.join(paths.downloadedImagesRoot, sku);
    return {
      sku,
      openclaw_output_images: core.listImageFiles(path.join(base, 'openclaw-output')).length,
      final_images: core.listImageFiles(path.join(base, 'final')).length,
      has_qc_report: fs.existsSync(path.join(base, 'qc', 'qc-report.md'))
    };
  });
}

function buildTasks(summary) {
  const tasks = [];

  if (!summary.has_project_scan) {
    tasks.push('Run project scan: node scripts/agent-scan.cjs --write-docs true');
  }
  if (summary.research_records === 0) {
    tasks.push('Create at least one product research record before sourcing.');
  }
  if (summary.sourcing_records === 0) {
    tasks.push('Add a supplier source record for the highest-priority product idea.');
  }
  if (summary.sourcing_records > 0 && summary.product_source_map_entries < summary.sourcing_records) {
    tasks.push('Review product-source-map.json for missing SKU to source mappings.');
  }
  if (summary.sourcing_records > 0) {
    tasks.push('Run listing readiness checks for sourced SKUs.');
  }
  if (summary.image_skus_with_output > summary.image_skus_with_qc) {
    tasks.push('Run image QC for SKUs with OpenClaw output but no QC report.');
  }
  if (summary.product_drafts === 0 && summary.image_skus_with_final > 0) {
    tasks.push('Generate product drafts for SKUs with QC-approved final images.');
  }
  if (summary.purchase_records > 0) {
    tasks.push('Review pending purchase records and update supplier/order status.');
  }
  if (tasks.length === 0) {
    tasks.push('No urgent local-agent tasks detected. Continue with the next sourced SKU.');
  }

  return tasks;
}

function markdown(report) {
  return `# Daily Agent Tasks

Date: ${report.date}

## Project Snapshot

- Framework: ${report.summary.framework}
- Pages: ${report.summary.pages}
- Blog Posts: ${report.summary.blog_posts}
- Product Content Files: ${report.summary.product_content}
- Product Data Files: ${report.summary.product_data}

## Agent Data

- Research Records: ${report.summary.research_records}
- Sourcing Records: ${report.summary.sourcing_records}
- SKU Source Map Entries: ${report.summary.product_source_map_entries}
- Product Drafts: ${report.summary.product_drafts}
- Purchase Records: ${report.summary.purchase_records}
- Image SKU Folders: ${report.summary.image_sku_folders}
- Image SKU Folders With OpenClaw Output: ${report.summary.image_skus_with_output}
- Image SKU Folders With QC: ${report.summary.image_skus_with_qc}
- Image SKU Folders With Final Images: ${report.summary.image_skus_with_final}

## Recommended Tasks

${report.tasks.map((task, index) => `${index + 1}. ${task}`).join('\n')}

## QC Detail

${report.qc_status.map((item) => `- ${item.sku}: output=${item.openclaw_output_images}, final=${item.final_images}, qc=${item.has_qc_report ? 'yes' : 'no'}`).join('\n') || '- No image SKU folders yet.'}
`;
}

function generateDailyTasks(input = {}, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const scan = readProjectScan(paths);
  const research = researchRecords(paths);
  const sourceRows = core.readCsv(paths.sourcingMasterCsv, core.SOURCE_HEADERS).rows;
  const purchaseRows = core.readCsv(paths.purchaseMasterCsv, core.PURCHASE_HEADERS).rows;
  const map = core.readJson(paths.productSourceMap, {});
  const qc = qcStatus(paths);
  const date = now.slice(0, 10);
  const dailyDir = path.join(paths.reportsRoot, 'daily');
  core.ensureDir(dailyDir);

  const summary = {
    framework: scan.tech_stack?.framework || 'Unknown',
    has_project_scan: fs.existsSync(path.join(paths.reportsRoot, 'project-scan.json')),
    pages: scan.pages?.length || 0,
    blog_posts: scan.blog_posts?.length || 0,
    product_content: scan.product_content?.length || 0,
    product_data: scan.product_data?.length || 0,
    research_records: research.length,
    sourcing_records: sourceRows.length,
    product_source_map_entries: Object.keys(map).length,
    product_drafts: countFiles(path.join(paths.draftsRoot, 'products'), (file) => file.endsWith('.md')),
    purchase_records: purchaseRows.length,
    image_sku_folders: qc.length,
    image_skus_with_output: qc.filter((item) => item.openclaw_output_images > 0).length,
    image_skus_with_qc: qc.filter((item) => item.has_qc_report).length,
    image_skus_with_final: qc.filter((item) => item.final_images > 0).length
  };

  const report = {
    date: now,
    summary,
    tasks: buildTasks(summary),
    qc_status: qc
  };
  const jsonPath = path.join(dailyDir, `daily-tasks-${date}.json`);
  const markdownPath = path.join(dailyDir, `daily-tasks-${date}.md`);
  core.writeJson(jsonPath, report);
  fs.writeFileSync(markdownPath, markdown(report));

  core.writeLog(root, 'daily', {
    event: 'daily_tasks_generated',
    task_count: report.tasks.length,
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
  const result = generateDailyTasks(args);
  process.stdout.write(`${JSON.stringify({
    date: result.date,
    task_count: result.tasks.length,
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

module.exports = { generateDailyTasks };
