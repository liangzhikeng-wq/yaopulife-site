/**
 * yaopulife 产品页生成/更新脚本
 * 基于 AI 生成的产品描述更新产品页
 */

const fs = require('fs');
const path = require('path');

// 产品数据目录
const PRODUCTS_DIR = path.join(__dirname, '../data/products');

// 读取产品数据
function loadProductData() {
  const files = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(PRODUCTS_DIR, f), 'utf-8');
    return JSON.parse(content);
  });
}

// 生成产品页 Markdown
function generateProductPage(product) {
  return `---
title: "${product.title}"
description: "${product.shortDescription}"
price: "${product.price}"
category: "${product.category.toLowerCase().replace(' ', '-')}"
material: "${product.material}"
size: "${product.size}"
time: "${product.productionTime}"
customization: "${product.customization}"
keywords: [${product.keywords.map(k => `"${k}"`).join(', ')}]
image: "/products/placeholder.jpg"
gallery: []
featured: false
---

## ${product.title}

${product.fullDescription}

## 定制选项

${product.customization}

## 常见问题

${product.faq.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

## 配送信息

- 生产周期: ${product.productionTime}
- 全球包邮 (订单满 $50)
- 7天无理由退货 (定制商品除外)

## 护理说明

- 避免阳光直射和潮湿环境
- 用软刷轻轻清洁
- 存放于干燥通风处
`;
}

// 主函数
function main() {
  console.log('读取产品数据...\n');
  const products = loadProductData();
  
  console.log(`找到 ${products.length} 个产品\n`);
  
  for (const product of products) {
    const pageContent = generateProductPage(product);
    const filename = `${product.sku}.md`;
    const filepath = path.join(__dirname, '../src/content/products', filename);
    
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, pageContent);
    
    console.log(`✓ ${product.title} -> ${filename}`);
  }
  
  console.log('\n产品页生成完成！');
}

// 执行
main();
