#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

function number(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function roundRatio(value) {
  return Math.round(value * 10000) / 10000;
}

function calculateProfit(input) {
  const supplierPrice = number(input.supplier_price || input.supplierPrice);
  const domesticShippingFee = number(input.domestic_shipping_fee || input.domesticShippingFee);
  const internationalShippingEstimate = number(input.international_shipping_estimate || input.internationalShippingEstimate);
  const platformFee = number(input.platform_fee || input.platformFee);
  const paymentFee = number(input.payment_fee || input.paymentFee);
  const packagingCost = number(input.packaging_cost || input.packagingCost);
  const adCostEstimate = number(input.ad_cost_estimate || input.adCostEstimate);
  const targetSellingPrice = number(input.target_selling_price || input.targetSellingPrice);

  const grossCost = supplierPrice + domesticShippingFee + internationalShippingEstimate;
  const totalCost = grossCost + platformFee + paymentFee + packagingCost + adCostEstimate;
  const grossProfit = targetSellingPrice - grossCost;
  const netProfitEstimate = targetSellingPrice - totalCost;
  const grossMargin = targetSellingPrice ? grossProfit / targetSellingPrice : 0;
  const netMarginEstimate = targetSellingPrice ? netProfitEstimate / targetSellingPrice : 0;

  let marginDecision = 'priority';
  if (grossMargin < 0.5) marginDecision = 'caution';
  else if (grossMargin < 0.65) marginDecision = 'testable';

  return {
    supplierPrice,
    domesticShippingFee,
    internationalShippingEstimate,
    platformFee,
    paymentFee,
    packagingCost,
    adCostEstimate,
    targetSellingPrice,
    grossProfit: roundMoney(grossProfit),
    grossMargin: roundRatio(grossMargin),
    totalCost: roundMoney(totalCost),
    netProfitEstimate: roundMoney(netProfitEstimate),
    netMarginEstimate: roundRatio(netMarginEstimate),
    marginDecision
  };
}

function writeProfitReport(input, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const result = calculateProfit(input);
  const sku = input.sku || input.yaopulife_sku || 'unknown-sku';
  const reportsDir = path.join(paths.reportsRoot, 'profit');
  core.ensureDir(reportsDir);
  const reportPath = path.join(reportsDir, `${sku}-${now.slice(0, 10)}.json`);
  core.writeJson(reportPath, { sku, date: now, ...result });
  return { reportPath, result };
}

function main() {
  const args = core.parseArgs();
  const output = args.writeReport ? writeProfitReport(args) : calculateProfit(args);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

module.exports = { calculateProfit, writeProfitReport };
