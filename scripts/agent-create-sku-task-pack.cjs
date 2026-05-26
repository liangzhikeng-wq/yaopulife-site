#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');
const { runSkuPipeline } = require('./agent-run-sku-pipeline.cjs');
const { createSourceTemplate } = require('./agent-create-source-template.cjs');
const { generateSourcingKeywords } = require('./agent-generate-sourcing-keywords.cjs');

function markdown(pack) {
  return `# SKU Task Pack: ${pack.sku}

Product: ${pack.product_name}
Target Keyword: ${pack.target_keyword || 'Not provided'}
Created At: ${pack.created_at}

## Current Pipeline State

- Status: ${pack.pipeline.status}
- Current Step: ${pack.pipeline.current_step}
- Missing: ${pack.pipeline.missing.join(', ') || 'None'}

## Next Commands

${pack.pipeline.next_commands.map((command) => `\`\`\`bash\n${command}\n\`\`\``).join('\n\n')}

## Source Template

- Markdown: ${pack.source_template.markdown_path}
- JSON: ${pack.source_template.json_path}

## Sourcing Keywords

- Markdown: ${pack.sourcing_keywords.markdown_path}
- JSON: ${pack.sourcing_keywords.json_path}

## Manual Checklist

- [ ] Confirm overseas demand and target keyword.
- [ ] Search domestic platforms with the suggested Chinese keyword.
- [ ] Record supplier URL, price, MOQ, material, size, and customization support.
- [ ] Save supplier reference images locally.
- [ ] Import supplier images into raw with agent-import-supplier-images.cjs.
- [ ] Create OpenClaw brief after raw images exist.
- [ ] Run image QC after OpenClaw output exists.
- [ ] Generate product draft only after QC-approved final images exist.

## Guardrail

This task pack is for manual operating work. It does not publish products, change prices, contact customers, or place supplier orders.
`;
}

function createSkuTaskPack(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const normalizedInput = core.normalizeAliases(input, [
    'sku',
    'product_name',
    'target_keyword',
    'research_id',
    'domestic_search_keyword'
  ]);

  core.assertRequired(normalizedInput, ['sku']);

  const pipeline = runSkuPipeline({
    sku: normalizedInput.sku,
    product_name: normalizedInput.product_name,
    target_keyword: normalizedInput.target_keyword
  }, { root, now });
  const sourceTemplate = createSourceTemplate({
    sku: normalizedInput.sku,
    product_name: normalizedInput.product_name,
    research_id: normalizedInput.research_id,
    domestic_search_keyword: normalizedInput.domestic_search_keyword
  }, { root, now });
  const sourcingKeywords = generateSourcingKeywords({
    sku: normalizedInput.sku,
    product_idea: normalizedInput.product_name || normalizedInput.target_keyword || normalizedInput.sku
  }, { root, now });

  const pack = {
    sku: normalizedInput.sku,
    product_name: normalizedInput.product_name || normalizedInput.sku,
    target_keyword: normalizedInput.target_keyword || '',
    created_at: now,
    pipeline: {
      status: pipeline.status,
      current_step: pipeline.current_step,
      missing: pipeline.missing,
      next_commands: pipeline.next_commands,
      markdown_path: core.relativeAgentPath(root, pipeline.markdownPath),
      json_path: core.relativeAgentPath(root, pipeline.jsonPath)
    },
    source_template: {
      markdown_path: core.relativeAgentPath(root, sourceTemplate.markdownPath),
      json_path: core.relativeAgentPath(root, sourceTemplate.jsonPath)
    },
    sourcing_keywords: {
      markdown_path: core.relativeAgentPath(root, sourcingKeywords.markdownPath),
      json_path: core.relativeAgentPath(root, sourcingKeywords.jsonPath)
    }
  };

  const packDir = path.join(paths.draftsRoot, 'task-packs', normalizedInput.sku);
  core.ensureDir(packDir);
  const date = now.slice(0, 10);
  const markdownPath = path.join(packDir, `task-pack-${date}.md`);
  const jsonPath = path.join(packDir, `task-pack-${date}.json`);
  fs.writeFileSync(markdownPath, markdown(pack));
  core.writeJson(jsonPath, pack);

  core.writeLog(root, 'task-pack', {
    event: 'sku_task_pack_created',
    sku: normalizedInput.sku,
    current_step: pack.pipeline.current_step,
    timestamp: now
  });

  return {
    pack,
    markdownPath,
    jsonPath,
    sourceTemplatePath: sourceTemplate.markdownPath,
    sourcingKeywordsPath: sourcingKeywords.markdownPath
  };
}

function main() {
  const args = core.parseArgs();
  const result = createSkuTaskPack(args);
  process.stdout.write(`${JSON.stringify({
    sku: result.pack.sku,
    current_step: result.pack.pipeline.current_step,
    markdownPath: result.markdownPath,
    jsonPath: result.jsonPath,
    sourceTemplatePath: result.sourceTemplatePath,
    sourcingKeywordsPath: result.sourcingKeywordsPath
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

module.exports = { createSkuTaskPack };
