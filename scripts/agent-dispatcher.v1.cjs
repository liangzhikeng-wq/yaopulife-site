#!/usr/bin/env node
/**
 * QODER Agent Dispatcher
 * 读取 pipeline-state.json，执行本周的 Agent 任务
 * 运行方式: node scripts/agent-dispatcher.js [--agent=AGENT_ID] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

// 配置
const PROJECT_ROOT = path.resolve(__dirname, '..');
const STATE_FILE = path.join(PROJECT_ROOT, 'ops/state/pipeline-state.json');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'src/content/blog');
const SOCIAL_DIR = path.join(PROJECT_ROOT, 'content/social/pinterest');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'ops/reports');

// 解析参数
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const specificAgent = args.find(a => a.startsWith('--agent='))?.split('=')[1];

// 读取状态
const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

// Agent 执行函数
const agentFunctions = {
  // S-COPY: 每周写 2 篇博客
  'S-COPY': async () => {
    console.log('[S-COPY] 生成本周博客文章...');
    const weekNum = state.thisWeek.weekNumber + 1;
    const topics = getNextBlogTopics(weekNum);
    const results = [];

    for (const topic of topics) {
      const filename = `${topic.slug}.md`;
      const filepath = path.join(CONTENT_DIR, filename);

      if (fs.existsSync(filepath)) {
        console.log(`  [SKIP] ${filename} 已存在`);
        results.push({ topic: topic.title, status: 'skipped' });
        continue;
      }

      const content = generateBlogContent(topic);
      fs.writeFileSync(filepath, content);
      console.log(`  [CREATED] ${filename}`);
      results.push({ topic: topic.title, status: 'created', path: filename });
    }

    return results;
  },

  // M-SOCIAL: 生成 Pinterest Pin 文案
  'M-SOCIAL': async () => {
    console.log('[M-SOCIAL] 生成 Pinterest 文案...');
    const weekNum = state.thisWeek.weekNumber + 1;
    const filename = `week-${String(weekNum).padStart(2, '0')}.md`;
    const filepath = path.join(SOCIAL_DIR, filename);

    const content = generatePinterestContent(weekNum);
    fs.writeFileSync(filepath, content);
    console.log(`  [CREATED] ${filename}`);

    return { file: filename, status: 'created' };
  },

  // M-EMAIL: 生成 EDM Campaign 文案
  'M-EMAIL': async () => {
    console.log('[M-EMAIL] 生成本周邮件文案...');
    const weekNum = state.thisWeek.weekNumber + 1;
    const filename = `week-${String(weekNum).padStart(2, '0')}.md`;
    const filepath = path.join(PROJECT_ROOT, 'content/edm', filename);

    // 确保目录存在
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    const content = generateEdmContent(weekNum);
    fs.writeFileSync(filepath, content);
    console.log(`  [CREATED] ${filename}`);

    return { file: filename, status: 'created' };
  },

  // A-DATA: 数据报告
  'A-DATA': async () => {
    console.log('[A-DATA] 生成周报...');
    const today = new Date().toISOString().split('T')[0];
    const filename = `${today}_weekly-report.md`;
    const filepath = path.join(REPORTS_DIR, filename);

    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    const content = generateWeeklyReport(state);
    fs.writeFileSync(filepath, content);
    console.log(`  [CREATED] ${filename}`);

    return { file: filename, status: 'created' };
  },

  // R-COMP: 竞品周报
  'R-COMP': async () => {
    console.log('[R-COMP] 生成竞品周报...');
    const today = new Date().toISOString().split('T')[0];
    const filename = `${today}_competitor-report.md`;
    const filepath = path.join(REPORTS_DIR, 'competitor', filename);
    fs.mkdirSync(path.dirname(filepath), { recursive: true });

    const content = generateCompetitorReport();
    fs.writeFileSync(filepath, content);
    console.log(`  [CREATED] ${filename}`);

    return { file: filename, status: 'created' };
  },

  // S-SEO: SEO 检查
  'S-SEO': async () => {
    console.log('[S-SEO] 执行 SEO 健康检查...');
    const issues = await checkSeoHealth();
    console.log(`  发现 ${issues.length} 个问题`);

    if (issues.length > 0) {
      const filename = `${new Date().toISOString().split('T')[0]}_seo-issues.md`;
      const filepath = path.join(REPORTS_DIR, filename);
      fs.writeFileSync(filepath, issues.map(i => `- ${i}`).join('\n'));
    }

    return { issues, status: 'completed' };
  },

  // ED-DEVIL: 对抗性审查
  'ED-DEVIL': async () => {
    console.log('[ED-DEVIL] 执行对抗性审查...');
    const risks = conductDevilsAdvocateReview(state);
    return { risks, status: 'completed' };
  }
};

// 获取下周博客主题
function getNextBlogTopics(weekNum) {
  const cycles = [
    ['custom-gifts-for-graduates-2026', 'gift-guide', 'graduation gift ideas'],
    ['how-to-photograph-pet-portraits-guide', 'diy-inspiration', 'pet photography tips'],
    ['ocean-themed-home-decor-ideas', 'gift-guides', 'coastal home decor'],
    ['custom-jewelry-organizers-handmade', 'product-care', 'jewelry storage'],
    ['handmade-birthday-gift-ideas-2026', 'gift-guides', 'birthday gift guide'],
    ['pet-portrait-storage-display-tips', 'product-care', 'how to display art'],
    ['custom-moon-lamp-personal-stories', 'behind-the-scenes', 'customer stories'],
    ['minimalist-home-decor-2026', 'diy-inspiration', 'minimalist design'],
    ['custom-keychain-gift-ideas', 'gift-guides', 'keychain gifts'],
    ['handmade-wedding-centerpieces', 'behind-the-scenes', 'wedding decor'],
    ['pet-lover-birthday-gift-guide', 'gift-guides', 'pet birthday gifts'],
    ['resin-art-coaster-care-guide', 'product-care', 'resin coaster maintenance']
  ];

  const idx = (weekNum - 1) % cycles.length;
  const currentCycle = cycles[idx];
  const titles = BLOG_TITLES[currentCycle[0]] || [currentCycle[0], currentCycle[0] + ' - Extended Guide'];
  
  return [
    {
      title: titles[0],
      slug: currentCycle[0],
      category: currentCycle[1],
      keywords: currentCycle[2].split(', ')
    },
    {
      title: titles[1],
      slug: `${currentCycle[0]}-extended`,
      category: currentCycle[1],
      keywords: currentCycle[2].split(', ')
    }
  ];
}

// 博客标题库
const BLOG_TITLES = {
  'custom-gifts-for-graduates-2026': [
    'Best Custom Graduation Gifts 2026: Personalized Ideas That Actually Get Used',
    'Why a Custom Portrait Makes the Best Graduation Gift (And How to Order)'
  ],
  'how-to-photograph-pet-portraits-guide': [
    'How to Take the Perfect Pet Photo for a Custom Portrait Order',
    '5 Pet Photo Mistakes That Delay Your Custom Portrait (And How to Fix)'
  ],
  'ocean-themed-home-decor-ideas': [
    '15 Ocean-Themed Home Decor Ideas (Handmade Edition)',
    'The Ultimate Guide to Coastal Farmhouse Decor with Handmade Pieces'
  ]
};

// 生成博客内容（模板）
function generateBlogContent(topic) {
  const now = new Date().toISOString().split('T')[0];
  const kw = topic.keywords[0] || 'custom gift';
  const imageAlt = `Custom handmade ${kw}`;
  
  return `---
title: "${topic.title}"
description: "Discover handcrafted custom ${kw} - unique, personalized pieces made by artisans. Perfect gift for any occasion."
pubDate: ${now}
category: "${topic.category}"
keywords: [${topic.keywords.map(k => `"${k}"`).join(', ')}]
image: "/og-image.jpg"
imageAlt: "${imageAlt}"
---

## Introduction

Looking for something truly special? Handcrafted custom ${topic.keywords[0]} offer a level of personalization and quality that mass-produced items simply can't match.

In this guide, we'll explore everything you need to know about finding, ordering, and enjoying custom handmade pieces.

## Section 1: Understanding ${topic.keywords[0]}

The world of ${topic.keywords[0]} is rich with possibilities. Whether you're shopping for a gift or treating yourself, understanding your options helps you make the best choice.

### Why Choose Custom Over Mass-Produced?

- **Uniqueness**: Every piece is made specifically for you
- **Personal Meaning**: Your story is incorporated into the design
- **Quality Control**: Made by skilled artisans who care about every detail
- **Supporting Small Business**: Your purchase supports independent creators

## Section 2: How to Order

Ordering custom ${topic.keywords[0]} is easier than you might think:

1. **Browse our collection** - Check out our [Shop](/shop) for inspiration
2. **Share your vision** - Use our [Contact](/contact) form to describe what you want
3. **Get a preview** - Receive a free AI design preview within 24 hours
4. **Approve and craft** - We handcraft your piece to perfection
5. **Shipped to your door** - Delivered carefully packaged worldwide

## Section 3: Care and Maintenance

To keep your custom piece looking beautiful for years:

- Keep away from direct sunlight if indicated
- Clean gently with a soft, dry cloth
- Store carefully when not in use

## Ready to Create Something Unique?

Every piece in our collection is made to order by skilled artisans. Share your idea today and get a free design preview within 24 hours.

[Browse All Products →](/shop) | [Contact Us →](/contact)
`;
}

// 生成 Pinterest 文案
function generatePinterestContent(weekNum) {
  const themes = {
    3: { focus: 'Graduation Gifts', products: ['pet-portrait', 'moon-lamp', 'wood-sign'] },
    4: { focus: 'Summer Home Decor', products: ['resin-coaster', 'embroidery', 'moon-lamp'] },
    5: { focus: 'Wedding Season', products: ['wedding-embroidery', 'photo-moon-lamp', 'multi-pet'] },
    6: { focus: 'Father Day Countdown', products: ['text-moon-lamp', 'wood-sign', 'resin-coaster'] }
  };

  const theme = themes[weekNum] || themes[3];

  return `# Pinterest Pin 文案 - Week ${weekNum} (10 Pins)
策略重点: ${theme.focus}

## Pin 1: 产品主图
**标题**: Best Custom ${theme.focus} | Handmade Gift Guide 2026
**描述**: Discover unique handcrafted ${theme.focus.toLowerCase()} - each piece made just for you. From pet portraits to custom moon lamps, find the perfect personalized gift.
**图片**: /products/${theme.products[0]}/main.jpg
**链接**: https://yaopulife.com/shop
**标签**: #CustomGift #HandmadeGift #PersonalizedGift #DIY #GiftGuide #UniqueGift

## Pin 2: 场景图
**标题**: Handmade ${theme.focus} That Look Amazing in Real Homes
**描述**: Skip the generic store-bought gift. Our artisans create one-of-a-kind ${theme.focus.toLowerCase()} that become treasured keepsakes.
**图片**: /products/${theme.products[1]}/scene.jpg
**链接**: https://yaopulife.com/product/1
**标签**: #HomeDecor #HandmadeWithLove #ArtisanCrafted #CozyHome #GiftIdeas

## Pin 3: 博客引流
**标题**: The Complete Guide to ${theme.focus} in 2026
**描述**: Everything you need to know about ${theme.focus.toLowerCase()}. Find the perfect piece for yourself or as a gift.
**图片**: /products/${theme.products[2]}/main.jpg
**链接**: https://yaopulife.com/blog
**标签**: #${theme.focus.replace(' ', '')}Guide #2026Trending #GiftIdeas #Handmade

## Pin 4-10: 产品矩阵
继续覆盖剩余 ${theme.products.join(', ')} 产品线，每条 Pin 包含:
- 产品名 + 核心卖点
- 场景图
- 链接到对应产品页
- 5-8 个相关标签

---
Generated by QODER Agent Dispatcher at ${new Date().toISOString()}
`;
}

// 生成 EDM 文案
function generateEdmContent(weekNum) {
  return `# EDM Campaign 文案 - Week ${weekNum}

## 主题: Weekly Inspiration

## Subject Line Options:
1. "Your custom piece is waiting 🌙"
2. "This week's most popular design..."
3. "Handmade with love, just for you"

## Preview Text:
"See what's trending in custom gifts this week"

## Body:
Hi [Name],

This week, we're excited to share our most popular custom gift designs.

**Featured This Week:**

🔹 Custom Pet Portraits — Starting at $48
Capture your furry friend's personality in a handcrafted portrait they'll treasure forever.

🔹 Photo Moon Lamps — Starting at $42
Turn your favorite memory into a glowing night light. Perfect for bedside tables.

🔹 Ocean Resin Coasters — $28/set
Bring beach vibes to your coffee table. Each set features unique swirling patterns.

[Browse the Collection →](/shop)

Every piece is made to order by skilled artisans. Free design preview within 24 hours.

— The yaopulife Team

---
Sent via yaopulife.com | Unsubscribe
`;
}

// 生成周报
function generateWeeklyReport(state) {
  const today = new Date().toISOString().split('T')[0];
  return `# 周报 - ${today}

## 本周状态总览

| 阶段 | 状态 | 完成度 |
|------|------|--------|
${Object.entries(state.stages).map(([s, info]) => `| ${s} | ${info.status} | ${info.pct}% |`).join('\n')}

## 本周完成内容
${state.thisWeek.completed.blogPosts.map(p => `- 博客: ${p}`).join('\n')}
${state.thisWeek.completed.pinterestPins.map(p => `- Pinterest: ${p}`).join('\n')}

## 下周待办
${state.pendingActions.filter(a => a.priority === 'P0').map(a => `- [ ] ${a.task} (${a.owner})`).join('\n')}

## KPI 追踪

| 指标 | 当前 | 目标 | 状态 |
|------|------|------|------|
| 周访客 | ${state.kpis.weekVisitors.value || 'N/A'} | ${state.kpis.weekVisitors.target} | ${state.kpis.weekVisitors.status} |
| 询盘数 | ${state.kpis.inquiries.value} | ${state.kpis.inquiries.target} | ${state.kpis.inquiries.status} |
| 订单数 | ${state.kpis.orders.value} | ${state.kpis.orders.target} | ${state.kpis.orders.status} |

## 异常告警
${state.alerts.length > 0 ? state.alerts.map(a => `- ${a}`).join('\n') : '无'}

---
Generated by A-DATA agent at ${new Date().toISOString()}
`;
}

// 生成竞品报告
function generateCompetitorReport() {
  return `# 竞品周报 - ${new Date().toISOString().split('T')[0]}

## 本周竞品动态

### 价格监测
暂无自动化价格监测数据。

### 内容监测
- 博客更新频率：无数据（待接入）
- 社媒活跃度：无数据（待接入）

### 差异化机会
1. 我们的优势：定制化程度高、工期透明、人工审核质量
2. 差异化空间：品牌故事内容、用户评价展示、制作过程视频

## 下周观察重点
- 父亲节相关产品促销动态
- 树脂艺术类竞品新品发布
- 定制礼品独立站内容策略

---
Generated by R-COMP agent at ${new Date().toISOString()}
`;
}

// SEO 健康检查
async function checkSeoHealth() {
  const issues = [];
  const siteUrl = 'https://yaopulife.com';

  // 检查 sitemap 是否可访问
  try {
    const sitemapRes = await fetch(`${siteUrl}/sitemap-index.xml`);
    if (!sitemapRes.ok) {
      issues.push(`Sitemap 返回 ${sitemapRes.status}`);
    }
  } catch (e) {
    issues.push(`Sitemap 无法访问: ${e.message}`);
  }

  // 检查 robots.txt
  try {
    const robotsRes = await fetch(`${siteUrl}/robots.txt`);
    if (!robotsRes.ok) {
      issues.push(`robots.txt 返回 ${robotsRes.status}`);
    }
  } catch (e) {
    issues.push(`robots.txt 无法访问: ${e.message}`);
  }

  return issues;
}

// 对抗性审查
function conductDevilsAdvocateReview(state) {
  const risks = [];

  // 检查阻塞项
  if (state.pendingActions.some(a => a.priority === 'P0' && a.owner === 'human')) {
    risks.push({
      severity: 'HIGH',
      item: 'P0 任务由人工执行但未完成',
      detail: 'Pinterest 发布和 GSC 提交未完成，影响流量获取'
    });
  }

  // 检查 KPI
  if (state.kpis.weekVisitors.value === null && state.stages.S5.status === 'in_progress') {
    risks.push({
      severity: 'MEDIUM',
      item: '无流量数据追踪',
      detail: '需要接入 Cloudflare Analytics 或 Google Analytics 4'
    });
  }

  return risks;
}

// 主执行
async function main() {
  console.log('=====================================');
  console.log('QODER Agent Dispatcher');
  console.log(`当前阶段: ${state.currentStage}`);
  console.log(`运行模式: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('=====================================\n');

  if (dryRun) {
    console.log('[DRY RUN] 以下任务将被执行:\n');
  }

  // 确定要执行的 Agent
  const weekTasks = ['S-COPY', 'M-SOCIAL', 'M-EMAIL', 'A-DATA'];
  const monthlyTasks = ['R-COMP', 'S-SEO', 'ED-DEVIL'];

  const toRun = specificAgent
    ? [specificAgent]
    : (state.thisWeek.tasks ? weekTasks : []);

  for (const agentId of toRun) {
    if (!agentFunctions[agentId]) {
      console.log(`[WARN] 未知 Agent: ${agentId}`);
      continue;
    }

    if (dryRun) {
      console.log(`  → ${agentId}`);
    } else {
      console.log(`\n[EXEC] Running ${agentId}...`);
      try {
        const result = await agentFunctions[agentId]();
        console.log(`[OK] ${agentId} completed:`, JSON.stringify(result, null, 2));
      } catch (err) {
        console.error(`[ERROR] ${agentId} failed:`, err.message);
      }
    }
  }

  if (dryRun) {
    console.log('\n运行 --dry-run=false 执行任务');
  }
}

main().catch(console.error);