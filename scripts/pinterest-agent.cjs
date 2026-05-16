/**
 * Pinterest Auto-Publish Agent - M-PINTEREST v2.0
 * 自动化 Pinterest 内容生成与发布
 * 
 * 注意：Pinterest 原生 API 需要 Business 账号 + OAuth 认证
 * 本 Agent 支持：
 * 1. 内容生成（已实现）
 * 2. 第三方工具集成（Buffer/Hootsuite/Tailwind）
 * 3. 手动发布的最佳时间建议
 */

const fs = require('fs');
const path = require('path');

class PinterestAgent {
  constructor(config = {}) {
    this.apiKey = config.pinterestApiKey || process.env.PINTEREST_API_KEY;
    this.accessToken = config.accessToken || process.env.PINTEREST_ACCESS_TOKEN;
    this.boardId = config.boardId || process.env.PINTEREST_BOARD_ID;
    this.projectRoot = path.resolve(__dirname, '..');
    this.contentDir = path.join(this.projectRoot, 'content/social/pinterest');
    this.reportsDir = path.join(this.projectRoot, 'ops/reports');
    
    // Pinterest 最佳发布时间（美国东部时区）
    this.optimalTimes = [
      { day: 'Friday', hour: 14, score: 5 },
      { day: 'Saturday', hour: 11, score: 5 },
      { day: 'Saturday', hour: 20, score: 4 },
      { day: 'Sunday', hour: 14, score: 4 },
      { day: 'Tuesday', hour: 10, score: 3 },
      { day: 'Thursday', hour: 19, score: 3 }
    ];
  }

  // 生成一周的 Pinterest 内容计划
  async generateWeeklyPlan(weekNum) {
    const themes = this.getWeeklyThemes(weekNum);
    const products = this.getProductCatalog();
    
    const pins = [];
    const days = ['Mon', 'Wed', 'Fri', 'Sat'];
    
    for (let i = 0; i < 10; i++) {
      const product = products[i % products.length];
      const theme = themes[i % themes.length];
      
      pins.push({
        day: days[i % days.length],
        time: this.getOptimalTime(i),
        title: this.generatePinTitle(product, theme),
        description: this.generatePinDescription(product, theme),
        hashtags: this.generateHashtags(product, theme),
        imageUrl: `https://yaopulife.com${product.mainImage}`,
        link: `https://yaopulife.com/shop`,
        category: product.category,
        priority: i < 3 ? 'HIGH' : 'MEDIUM'
      });
    }
    
    return {
      week: weekNum,
      theme: themes,  // array of themes
      primaryTheme: themes[0],  // first theme as string
      pins: pins,
      summary: this.generateSummary(pins)
    };
  }

  // 生成 Pin 标题
  generatePinTitle(product, theme) {
    const templates = [
      `${product.name} | Handmade Gift Guide`,
      `Custom ${product.category} - Perfect Gift Idea`,
      `${product.name} That Will Make Someone's Day`,
      `Unique Handmade ${product.category} | Free Shipping`,
      `Best ${product.category} for ${theme} 2026`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // 生成 Pin 描述
  generatePinDescription(product, theme) {
    return `Elevate your gift-giving with this stunning ${product.name.toLowerCase()}.

Handcrafted by skilled artisans, this piece features:

✓ Premium quality materials
✓ Unique personalized design
✓ Perfect for ${theme}
✓ Free AI design preview
✓ Worldwide shipping

Shop now and make someone's day special!

#customgift #handmade #personalized #DIYgift #uniquegift #${product.category.toLowerCase().replace(' ', '')} #giftideas #handcrafted #yaopulife`;
  }

  // 生成 Hashtags
  generateHashtags(product, theme) {
    const base = ['customgift', 'handmade', 'personalized', 'giftideas', 'DIY'];
    const productTags = product.tags || [];
    const themeTag = theme.toLowerCase().replace(/\s+/g, '');
    return [...base, ...productTags, themeTag].slice(0, 12);
  }

  // 获取最佳发布时间
  getOptimalTime(index) {
    const times = [
      '2:00 PM EST', // Friday
      '11:00 AM EST', // Saturday
      '8:00 PM EST', // Saturday
      '2:00 PM EST', // Sunday
      '10:00 AM EST', // Tuesday
      '7:00 PM EST', // Thursday
      '2:00 PM EST', // Friday
      '11:00 AM EST', // Saturday
      '2:00 PM EST', // Sunday
      '10:00 AM EST' // Tuesday
    ];
    return times[index % times.length];
  }

  // 获取每周主题
  getWeeklyThemes(weekNum) {
    const themes = [
      ['Father\'s Day Gifts 2026', 'Graduation Season', 'Pet Lovers Month'],
      ['Summer Home Decor', 'Beach House Style', 'Coastal Living'],
      ['Wedding Season', 'Anniversary Gifts', 'Romantic Presents'],
      ['Birthday Gifts', 'Celebration Ideas', 'Party Supplies'],
      ['Pet Portraits', 'Animal Lovers', 'Furry Friends'],
      ['Home Office', 'Workspace Decor', 'Productivity Gifts'],
      ['Kitchen Decor', 'Cooking Lovers', 'Culinary Arts'],
      ['Garden Style', 'Outdoor Living', 'Nature Lovers']
    ];
    return themes[(weekNum - 1) % themes.length];
  }

  // 获取产品目录
  getProductCatalog() {
    return [
      { name: 'Needle Felted Cat Portrait', category: 'Pet Portraits', tags: ['catgift', 'petportrait', 'catlover'], mainImage: '/products/needle-felt/nf-cat-main.jpg' },
      { name: 'Needle Felted Dog Portrait', category: 'Pet Portraits', tags: ['doggift', 'petportrait', 'doglover'], mainImage: '/products/needle-felt/nf-dog-main.jpg' },
      { name: 'Custom Pet Embroidery', category: 'Pet Portraits', tags: ['petart', 'embroidery', 'custompet'], mainImage: '/products/embroidery/emb-pet-main.jpg' },
      { name: 'Photo Moon Lamp', category: 'Custom Gifts', tags: ['moonlamp', 'photoart', 'ledlamp'], mainImage: '/products/moon-lamp/ml-photo-main.jpg' },
      { name: 'Text Moon Lamp', category: 'Custom Gifts', tags: ['personalgift', 'romanticgift', 'customlamp'], mainImage: '/products/moon-lamp/ml-text-main.jpg' },
      { name: 'Ocean Resin Coasters', category: 'Home Decor', tags: ['coastaldecor', 'resinart', 'oceanstyle'], mainImage: '/products/resin-coaster/rc-ocean-main.jpg' },
      { name: 'Family Name Sign', category: 'Home Decor', tags: ['familyname', 'homedecor', 'personalsign'], mainImage: '/products/wood-sign/ws-name-main.jpg' },
      { name: 'Floral Embroidery Hoop', category: 'Home Decor', tags: ['floralart', 'embroidery', 'gardenstyle'], mainImage: '/products/embroidery/emb-flower-main.jpg' },
      { name: 'Wedding Embroidery', category: 'Custom Gifts', tags: ['weddinggift', 'couplegift', 'anniversary'], mainImage: '/products/embroidery/emb-wedding-main.jpg' },
      { name: 'Multi-Pet Portrait', category: 'Pet Portraits', tags: ['multiplepets', 'familypet', 'petart'], mainImage: '/products/needle-felt/nf-multi-main.jpg' }
    ];
  }

  // 生成周报摘要
  generateSummary(pins) {
    return {
      totalPins: pins.length,
      highPriority: pins.filter(p => p.priority === 'HIGH').length,
      categories: [...new Set(pins.map(p => p.category))],
      estimatedReach: pins.length * 500, // 估算
      suggestedPostTimes: this.optimalTimes
    };
  }

  // 保存内容到文件
  saveContent(weekNum, content) {
    const filepath = path.join(this.contentDir, `week-${String(weekNum).padStart(2, '0')}.md`);
    
    let markdown = `# Pinterest 内容计划 - Week ${weekNum}\n\n`;
    markdown += `## 本周主题\n`;
    markdown += content.theme.map(t => `- ${t}`).join('\n') + '\n\n';
    markdown += `## 发布计划\n\n`;
    
    content.pins.forEach((pin, i) => {
      markdown += `### Pin ${i + 1} (${pin.day} ${pin.time})\n`;
      markdown += `**优先级**: ${pin.priority}\n\n`;
      markdown += `**标题**:\n${pin.title}\n\n`;
      markdown += `**描述**:\n${pin.description}\n\n`;
      markdown += `**图片**: ${pin.imageUrl}\n\n`;
      markdown += `**链接**: ${pin.link}\n\n`;
      markdown += `---\n\n`;
    });
    
    markdown += `## 摘要\n`;
    markdown += `- 总 Pin 数: ${content.summary.totalPins}\n`;
    markdown += `- 高优先级: ${content.summary.highPriority}\n`;
    markdown += `- 预估触达: ${content.summary.estimatedReach}+ 用户\n`;
    markdown += `- 分类: ${content.summary.categories.join(', ')}\n\n`;
    
    markdown += `## 最佳发布时间\n`;
    content.summary.suggestedPostTimes.forEach(t => {
      markdown += `- ${t.day} ${t.hour}:00 EST (评分: ${'★'.repeat(t.score)})\n`;
    });
    
    fs.mkdirSync(this.contentDir, { recursive: true });
    fs.writeFileSync(filepath, markdown);
    
    return filepath;
  }

  // 生成 Instagram 内容（补充社交矩阵）
  generateInstagramContent(weekNum) {
    const themes = this.getWeeklyThemes(weekNum);
    
    const posts = [];
    const captions = [
      `Every piece tells a story. This ${themes[0]} special is handcrafted with love, just for you.\n\nWhat memory would you immortalize?\n\n💬 Comment below!`,
      `Behind every handmade gift is hours of love and dedication. Tag someone who deserves a custom gift! 🙌\n\n#handmade #customgift #yaopulife #supportartisans`,
      `Your pet, immortalized in wool.🐾 This needle-felted portrait captures every whisker, every expression.\n\n✨ Swipe to see more!\n\n#petportrait #needlefelt #custompet`
    ];
    
    for (let i = 0; i < 3; i++) {
      posts.push({
        day: ['Mon', 'Wed', 'Fri'][i],
        time: '11:00 AM EST',
        caption: captions[i],
        hashtags: this.generateHashtags({}, themes[0]),
        imageSuggestions: this.getProductCatalog().slice(0, 3).map(p => p.mainImage)
      });
    }
    
    return posts;
  }

  // 主运行方法
  async run(weekNum = null) {
    const today = new Date();
    const currentWeek = weekNum || Math.ceil(today.getDate() / 7);
    
    console.log('============================================================');
    console.log('M-PINTEREST Agent v2.0 - Pinterest 自动化运营');
    console.log(`当前周: ${currentWeek}`);
    console.log(`API 连接: ${this.apiKey ? '已配置' : '未配置（内容生成模式）'}`);
    console.log('============================================================\n');

    // 生成内容
    const pinterestContent = await this.generateWeeklyPlan(currentWeek);
    const instagramContent = this.generateInstagramContent(currentWeek);

    // 保存 Pinterest 内容
    const pinterestFile = this.saveContent(currentWeek, pinterestContent);
    console.log(`✓ Pinterest 内容已保存: ${path.basename(pinterestFile)}`);

    // 保存 Instagram 内容
    const igDir = path.join(this.projectRoot, 'content/social/instagram');
    fs.mkdirSync(igDir, { recursive: true });
    const igFile = path.join(igDir, `week-${String(currentWeek).padStart(2, '0')}.md`);
    
    let igMarkdown = `# Instagram 内容计划 - Week ${currentWeek}\n\n`;
    instagramContent.forEach((post, i) => {
      igMarkdown += `### Post ${i + 1} (${post.day} ${post.time})\n\n`;
      igMarkdown += `**Caption**:\n${post.caption}\n\n`;
      igMarkdown += `**Hashtags**:\n${post.hashtags.map(t => `#${t}`).join(' ')}\n\n`;
      igMarkdown += `---\n\n`;
    });
    
    fs.writeFileSync(igFile, igMarkdown);
    console.log(`✓ Instagram 内容已保存: week-${String(currentWeek).padStart(2, '0')}.md`);

    // 生成报告
    const report = this.generateReport(currentWeek, pinterestContent);
    const reportFile = path.join(this.reportsDir, `${today.toISOString().split('T')[0]}_social-report.md`);
    fs.mkdirSync(this.reportsDir, { recursive: true });
    fs.writeFileSync(reportFile, report);
    console.log(`✓ 社交报告已保存: ${path.basename(reportFile)}`);

    console.log('\n============================================================');
    console.log('执行完成');
    console.log(`本周计划: ${pinterestContent.summary.totalPins} 条 Pin, ${instagramContent.length} 条 IG`);
    console.log('============================================================\n');

    return {
      pinterest: pinterestContent,
      instagram: instagramContent,
      files: [pinterestFile, igFile, reportFile]
    };
  }

  // 生成报告
  generateReport(weekNum, content) {
    const today = new Date().toISOString().split('T')[0];
    
    return `# 社交媒体运营报告 - ${today}

## 本周 Pinterest 内容计划

### 主题
${content.theme.map(t => `- ${t}`).join('\n')}

### 发布计划

| Day | Time | Priority | Category | Title |
|-----|------|----------|----------|-------|
${content.pins.map(p => `| ${p.day} | ${p.time} | ${p.priority} | ${p.category} | ${p.title.slice(0, 40)}... |`).join('\n')}

### 预期效果
- 发布 Pin 数: ${content.summary.totalPins}
- 高优先级内容: ${content.summary.highPriority}
- 预估触达: ${content.summary.estimatedReach}+ 用户
- 覆盖分类: ${content.summary.categories.join(', ')}

### 最佳发布时间建议
${content.summary.suggestedPostTimes.map(t => `- ${t.day} ${t.hour}:00 EST (评分: ${'★'.repeat(t.score)})`).join('\n')}

---

## 操作建议

1. **使用 Tailwind 或 Later**: 导入本目录下的内容到 scheduling 工具
2. **图片优化**: 建议 1000x1500px，文本覆盖 < 20%
3. **定时发布**: 按上述最佳时间设置自动发布
4. **监控数据**: 每周检查 Pin 表现，调整策略

---

Generated by M-PINTEREST Agent v2.0
${today}`;
  }
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const weekNum = args.find(a => a.startsWith('--week='))?.split('=')[1];
  
  const agent = new PinterestAgent();
  agent.run(weekNum ? parseInt(weekNum) : null)
    .then(result => {
      console.log('\n📊 生成文件:', result.files);
      process.exit(0);
    })
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}

module.exports = PinterestAgent;