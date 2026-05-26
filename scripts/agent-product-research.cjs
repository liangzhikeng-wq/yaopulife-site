#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

const SCORE_FIELDS = [
  'market_demand_score',
  'gift_attribute_score',
  'visual_appeal_score',
  'seo_potential_score',
  'social_spread_score',
  'supply_availability_score',
  'profit_potential_score',
  'shipping_score',
  'aftersales_risk_score',
  'differentiation_score',
  'brand_fit_score'
];

function asList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(asList);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function score(value) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(10, parsed));
}

function slugify(value) {
  return String(value || 'product-research')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'product-research';
}

function decisionForScore(totalScore) {
  if (totalScore >= 90) return 'priority_source';
  if (totalScore >= 80) return 'worth_testing';
  if (totalScore >= 70) return 'observe';
  return 'do_not_source_yet';
}

function existingResearchRows(researchDir) {
  if (!fs.existsSync(researchDir)) return [];
  return fs.readdirSync(researchDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      try {
        return core.readJson(path.join(researchDir, file), {});
      } catch (_error) {
        return {};
      }
    });
}

function markdown(record) {
  return `# Product Research: ${record.product_idea}

Research ID: ${record.research_id}
Date: ${record.created_at}

## Source

- Platform: ${record.source_platform}
- URL: ${record.source_url || 'Not provided'}
- Target Market: ${record.target_market}
- Main Keyword: ${record.main_keyword}
- Secondary Keywords: ${record.secondary_keywords.join(', ') || 'None'}

## Product Direction

- Estimated Demand: ${record.estimated_demand || 'unknown'}
- Gift Occasions: ${record.gift_occasion.join(', ') || 'None'}
- Visual Style: ${record.visual_style || 'Not specified'}

## Scores

- Market Demand: ${record.market_demand_score}
- Gift Attribute: ${record.gift_attribute_score}
- Visual Appeal: ${record.visual_appeal_score}
- SEO Potential: ${record.seo_potential_score}
- Social Spread: ${record.social_spread_score}
- Supply Availability: ${record.supply_availability_score}
- Profit Potential: ${record.profit_potential_score}
- Shipping: ${record.shipping_score}
- Aftersales Low Risk: ${record.aftersales_risk_score}
- Differentiation: ${record.differentiation_score}
- Brand Fit: ${record.brand_fit_score}

Total Score: ${record.total_score}
Decision: ${record.decision}

## Risk Notes

${record.risk_notes.map((item) => `- ${item}`).join('\n') || '- None recorded'}

## Next Step

${record.decision === 'do_not_source_yet' ? 'Do not enter domestic sourcing until more demand or fit evidence is available.' : 'Enter domestic sourcing and create a supplier record linked to this research_id.'}
`;
}

function createProductResearch(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const researchDir = path.join(paths.agentRoot, 'research', 'overseas');
  core.ensureDir(researchDir);

  const normalizedInput = core.normalizeAliases(input, [
    'product_idea',
    'source_platform',
    'source_url',
    'target_market',
    'main_keyword',
    'secondary_keywords',
    'estimated_demand',
    'gift_occasion',
    'visual_style',
    'risk_notes',
    ...SCORE_FIELDS
  ]);

  core.assertRequired(normalizedInput, ['product_idea', 'main_keyword']);

  const existing = existingResearchRows(researchDir);
  const scores = Object.fromEntries(SCORE_FIELDS.map((field) => [field, score(normalizedInput[field])]));
  const totalScore = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const record = {
    research_id: normalizedInput.research_id || core.createSequentialId('R', now, existing, 'research_id'),
    product_idea: normalizedInput.product_idea,
    source_platform: normalizedInput.source_platform || 'manual_input',
    source_url: normalizedInput.source_url || '',
    target_market: normalizedInput.target_market || 'US',
    main_keyword: normalizedInput.main_keyword,
    secondary_keywords: asList(normalizedInput.secondary_keywords),
    estimated_demand: normalizedInput.estimated_demand || 'unknown',
    gift_occasion: asList(normalizedInput.gift_occasion),
    visual_style: normalizedInput.visual_style || '',
    ...scores,
    total_score: totalScore,
    decision: normalizedInput.decision || decisionForScore(totalScore),
    risk_notes: asList(normalizedInput.risk_notes),
    created_at: now,
    updated_at: now
  };

  const baseName = `${record.research_id}-${slugify(record.main_keyword)}`;
  const markdownPath = path.join(researchDir, `${baseName}.md`);
  const jsonPath = path.join(researchDir, `${baseName}.json`);
  fs.writeFileSync(markdownPath, markdown(record));
  core.writeJson(jsonPath, record);

  core.writeLog(root, 'research', {
    event: 'product_research_created',
    research_id: record.research_id,
    product_idea: record.product_idea,
    decision: record.decision,
    total_score: record.total_score,
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
  const result = createProductResearch(args);
  process.stdout.write(`${JSON.stringify({
    research_id: result.record.research_id,
    total_score: result.record.total_score,
    decision: result.record.decision,
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

module.exports = { createProductResearch };
