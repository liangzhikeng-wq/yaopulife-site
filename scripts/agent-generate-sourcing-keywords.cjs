#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

function slugify(value) {
  return String(value || 'sourcing-keywords')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'sourcing-keywords';
}

function unique(items) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function keywordSet(productIdea) {
  const text = String(productIdea || '').toLowerCase();
  const keywords = [];

  if (text.includes('mug') || text.includes('cup')) {
    keywords.push(
      '照片陶瓷马克杯 定制',
      '宠物照片马克杯 定制',
      '陶瓷杯 定制 照片',
      '热转印马克杯 定制',
      '跨境马克杯 定制',
      '宠物周边杯子定制',
      '马克杯 来图定制 一件代发'
    );
  }
  if (text.includes('blanket')) {
    keywords.push(
      '照片毛毯 定制',
      '宠物照片毯 定制',
      '法兰绒毛毯 来图定制',
      '跨境毛毯 一件代发',
      '热转印毛毯 定制'
    );
  }
  if (text.includes('necklace')) {
    keywords.push(
      '宠物名字项链 定制',
      '名字吊坠 定制',
      '不锈钢项链 刻字 定制',
      '宠物纪念项链 批发',
      '跨境饰品 一件代发'
    );
  }
  if (text.includes('keychain')) {
    keywords.push(
      '亚克力照片钥匙扣 定制',
      '宠物照片钥匙扣 定制',
      'PVC钥匙扣 来图定制',
      '跨境钥匙扣 一件代发',
      '宠物周边钥匙扣 批发'
    );
  }
  if (text.includes('moon lamp') || text.includes('lamp')) {
    keywords.push(
      '照片月球灯 定制',
      '3D打印月球灯 定制',
      '小夜灯 照片定制',
      '跨境月球灯 一件代发',
      'LED小夜灯 来图定制'
    );
  }
  if (text.includes('pet')) {
    keywords.push(
      '宠物纪念礼物 定制',
      '宠物照片定制 礼品',
      '宠物周边 定制 一件代发'
    );
  }
  if (text.includes('wedding')) {
    keywords.push(
      '婚礼纪念礼物 定制',
      '结婚纪念品 定制',
      '婚礼伴手礼 定制'
    );
  }

  if (keywords.length === 0) {
    keywords.push(
      `${productIdea} 定制`,
      `${productIdea} 批发`,
      `${productIdea} 一件代发`,
      `${productIdea} 跨境`
    );
  }

  return unique(keywords);
}

function markdown(record) {
  return `# Sourcing Keywords

SKU: ${record.sku || 'Not assigned'}
Product Idea: ${record.product_idea}
Created At: ${record.created_at}

## Keywords

${record.keywords.map((keyword) => `- ${keyword}`).join('\n')}

## Search Notes

- Start with 1688 for factory and wholesale availability.
- Use Taobao when searching for small studios or artisan customization.
- Prefer suppliers that support one-piece customization and clear product photos.
- Record the final supplier with agent-source-product.cjs only after manual review.
`;
}

function generateSourcingKeywords(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const normalizedInput = core.normalizeAliases(input, ['product_idea', 'sku']);
  core.assertRequired(normalizedInput, ['product_idea']);

  const record = {
    sku: normalizedInput.sku || '',
    product_idea: normalizedInput.product_idea,
    keywords: keywordSet(normalizedInput.product_idea),
    created_at: now,
    updated_at: now
  };

  const dir = path.join(paths.agentRoot, 'research', 'sourcing-keywords');
  core.ensureDir(dir);
  const baseName = `${record.sku ? `${record.sku}-` : ''}${slugify(record.product_idea)}-${now.slice(0, 10)}`;
  const markdownPath = path.join(dir, `${baseName}.md`);
  const jsonPath = path.join(dir, `${baseName}.json`);
  fs.writeFileSync(markdownPath, markdown(record));
  core.writeJson(jsonPath, record);

  core.writeLog(root, 'research', {
    event: 'sourcing_keywords_generated',
    sku: record.sku,
    product_idea: record.product_idea,
    keyword_count: record.keywords.length,
    timestamp: now
  });

  return {
    record,
    markdownPath,
    jsonPath
  };
}

function main() {
  const args = core.parseArgs();
  const result = generateSourcingKeywords(args);
  process.stdout.write(`${JSON.stringify({
    sku: result.record.sku,
    product_idea: result.record.product_idea,
    keywords: result.record.keywords,
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

module.exports = { generateSourcingKeywords };
