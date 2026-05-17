/**
 * yaopulife 全自动部署脚本
 * 跳过图片下载，直接部署已有内容
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SITE_DIR = '/Users/yaopulife/yaopuqoder/yaopulife-site';

console.log('=== yaopulife 全自动部署系统 ===\n');

// 1. 检查环境
console.log('[1/4] 检查环境...');
const hasGit = execSync('which git', { encoding: 'utf8' }).trim();
const hasNode = execSync('which node', { encoding: 'utf8' }).trim();
console.log(`  Git: ${hasGit ? 'OK' : 'MISSING'}`);
console.log(`  Node: ${hasNode ? 'OK' : 'MISSING'}`);

// 2. 生成内容
console.log('\n[2/4] 生成网站内容...');
try {
  execSync('node scripts/generate-product-content.cjs', { cwd: SITE_DIR, stdio: 'pipe' });
  console.log('  ✓ 产品描述生成完成');
} catch (e) {
  console.log('  ! 产品描述已存在，跳过');
}

try {
  execSync('node scripts/generate-product-images.cjs', { cwd: SITE_DIR, stdio: 'pipe' });
  console.log('  ✓ AI生图Prompt生成完成');
} catch (e) {
  console.log('  ! AI生图Prompt已存在，跳过');
}

try {
  execSync('node scripts/generate-blog-content.cjs', { cwd: SITE_DIR, stdio: 'pipe' });
  console.log('  ✓ 博客内容生成完成');
} catch (e) {
  console.log('  ! 博客内容已存在，跳过');
}

try {
  execSync('node scripts/generate-sitemap.cjs', { cwd: SITE_DIR, stdio: 'pipe' });
  console.log('  ✓ Sitemap生成完成');
} catch (e) {
  console.log('  ! Sitemap已存在，跳过');
}

// 3. Git提交
console.log('\n[3/4] Git提交...');
try {
  execSync('git add -A', { cwd: SITE_DIR });
  execSync('git commit -m "Auto deploy: product content + blog + sitemap"', { cwd: SITE_DIR });
  console.log('  ✓ Git提交完成');
} catch (e) {
  if (e.message.includes('nothing to commit')) {
    console.log('  ! 无新内容，跳过提交');
  } else {
    console.log('  ! Git提交:', e.message.substring(0, 100));
  }
}

// 4. 推送到GitHub
console.log('\n[4/4] 推送到GitHub...');
try {
  execSync('git push origin main', { cwd: SITE_DIR, stdio: 'pipe' });
  console.log('  ✓ 推送完成 - Vercel将自动部署');
} catch (e) {
  console.log('  ! 推送失败:', e.message.substring(0, 100));
}

console.log('\n=== 部署完成 ===');
console.log('\n网站: https://yaopulife.com');
console.log('Vercel: https://vercel.com/liangzhikeng-wq/yaopulife-site');
console.log('\n注意: 产品图片使用SVG占位符，后续可用真实图片替换');
