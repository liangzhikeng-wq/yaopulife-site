#!/usr/bin/env node
/**
 * QODER Agent Dispatcher v3.0 - AI Powered
 * 33个独立Agent + DeepSeek API驱动
 * 
 * 运行方式:
 *   node scripts/agent-dispatcher.cjs --dry-run           // 预览任务
 *   node scripts/agent-dispatcher.cjs                      // 执行全部AI Agent
 *   node scripts/agent-dispatcher.cjs --agent=S-BLOG     // 单个Agent
 *   node scripts/agent-dispatcher.cjs --parallel          // 并行模式
 */

const fs = require('fs');
const path = require('path');
const DeepSeekClient = require('./deepseek-client.cjs');

// ========== 配置 ==========
const PROJECT_ROOT = path.resolve(__dirname, '..');
const STATE_FILE = path.join(PROJECT_ROOT, 'ops/state/pipeline-state.json');
const DOC_REGISTRY = path.join(PROJECT_ROOT, 'ops/state/document-registry.json');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'ops/reports');
const CONTENT_DIR = path.join(PROJECT_ROOT, 'src/content/blog');
const SOCIAL_DIR = path.join(PROJECT_ROOT, 'content/social/pinterest');
const INSTAGRAM_DIR = path.join(PROJECT_ROOT, 'content/social/instagram');
const EDM_DIR = path.join(PROJECT_ROOT, 'content/edm');

// DeepSeek API Key (从环境变量或 Secrets 读取)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

// ========== 消息类型 ==========
const MSG_TYPES = {
  TASK_ASSIGN: 'TASK_ASSIGN',
  TASK_COMPLETE: 'TASK_COMPLETE',
  TASK_ACCEPT: 'TASK_ACCEPT',
  TASK_REJECT: 'TASK_REJECT',
  TASK_FAIL: 'TASK_FAIL',
  REVIEW_REQUEST: 'REVIEW_REQUEST',
  REVIEW_RESULT: 'REVIEW_RESULT',
  SYNC_NOTIFY: 'SYNC_NOTIFY',
  HEARTBEAT: 'HEARTBEAT'
};

// ========== 消息总线 ==========
class MessageBus {
  constructor() {
    this.messages = [];
  }

  send(from, to, msgType, payload) {
    const msg = {
      msg_id: `MSG_${Date.now()}`,
      timestamp: new Date().toISOString(),
      from, to, msg_type: msgType, payload
    };
    this.messages.push(msg);
    console.log(`  [MSG] ${from} → ${to}: ${msgType}`);
    return msg;
  }
}

// ========== 文档注册表 ==========
class DocRegistry {
  constructor(registryPath) {
    this.path = registryPath;
    this.registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  }

  canRead(docName, agentId) {
    const doc = this.registry.documents[docName];
    if (!doc) return { allowed: false, reason: '文档不存在' };
    return { allowed: true, version: doc.version };
  }

  lockWrite(docName, agentId) {
    const doc = this.registry.documents[docName];
    if (doc) {
      doc.status = 'WRITING';
      doc.write_lock = agentId;
      this.save();
    }
    return { allowed: true };
  }

  unlockWrite(docName, agentId, newVersion) {
    const doc = this.registry.documents[docName];
    if (doc && doc.write_lock === agentId) {
      doc.status = 'STABLE';
      doc.version = newVersion;
      doc.write_lock = null;
      doc.last_modified = new Date().toISOString();
      this.save();
    }
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.registry, null, 2));
  }
}

// ========== 流水线状态 ==========
class PipelineState {
  constructor(stateFile) {
    this.path = stateFile;
    this.state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  }

  getCurrentStage() { return this.state.currentStage || 'S5'; }

  logTask(agentId, status, details) {
    if (!this.state.taskLog) this.state.taskLog = [];
    this.state.taskLog.push({ agent: agentId, status, details, timestamp: new Date().toISOString() });
    this.save();
  }

  logException(type, agentId, description, severity = 'MEDIUM') {
    if (!this.state.exceptions) this.state.exceptions = [];
    this.state.exceptions.push({ exception_id: `EXC_${Date.now()}`, type, agent: agentId, description, severity, timestamp: new Date().toISOString() });
    this.save();
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.state, null, 2));
  }
}

// ========== 33个Agent定义 ==========
const AGENTS = {
  // Content Agents (内容生产)
  'S-COPY': { name: '文案撰写', group: 'content', priority: 'HIGH', enabled: true },
  'S-BLOG': { name: 'SEO博客', group: 'content', priority: 'HIGH', enabled: true },
  'S-EMAIL': { name: '邮件营销', group: 'content', priority: 'HIGH', enabled: true },
  'S-DESCRIPTION': { name: '产品描述', group: 'content', priority: 'MEDIUM', enabled: true },
  'S-LANDING': { name: '落地页文案', group: 'content', priority: 'MEDIUM', enabled: false },

  // Marketing Agents (社媒运营)
  'M-PINTEREST': { name: 'Pinterest运营', group: 'marketing', priority: 'HIGH', enabled: true },
  'M-INSTAGRAM': { name: 'Instagram运营', group: 'marketing', priority: 'HIGH', enabled: true },
  'M-FACEBOOK': { name: 'Facebook运营', group: 'marketing', priority: 'MEDIUM', enabled: false },
  'M-AD-COPY': { name: '广告文案', group: 'marketing', priority: 'HIGH', enabled: true },
  'M-INFLUENCER': { name: '红人合作', group: 'marketing', priority: 'LOW', enabled: false },

  // Analytics Agents (数据分析)
  'A-DATA': { name: '数据分析', group: 'analytics', priority: 'HIGH', enabled: true },
  'A-SEO': { name: 'SEO监控', group: 'analytics', priority: 'HIGH', enabled: true },
  'A-COMPETITOR': { name: '竞品分析', group: 'analytics', priority: 'MEDIUM', enabled: true },
  'A-CONVERSION': { name: '转化分析', group: 'analytics', priority: 'HIGH', enabled: false },
  'A-TRAFFIC': { name: '流量分析', group: 'analytics', priority: 'MEDIUM', enabled: false },

  // Tech Agents (技术开发)
  'T-DEV': { name: '前端开发', group: 'tech', priority: 'HIGH', enabled: true },
  'T-SEO-TECH': { name: '技术SEO', group: 'tech', priority: 'MEDIUM', enabled: true },
  'T-PERFORMANCE': { name: '性能优化', group: 'tech', priority: 'MEDIUM', enabled: false },
  'T-DEPLOY': { name: '自动化部署', group: 'tech', priority: 'HIGH', enabled: true },

  // Product Agents (产品运营)
  'P-CATALOG': { name: '产品目录', group: 'product', priority: 'MEDIUM', enabled: false },
  'P-RECOMMEND': { name: '产品推荐', group: 'product', priority: 'MEDIUM', enabled: false },
  'P-PRICING': { name: '定价策略', group: 'product', priority: 'LOW', enabled: false },
  'P-SUPPLIER': { name: '供应商管理', group: 'product', priority: 'MEDIUM', enabled: true },

  // Customer Service Agents (客服)
  'CS-FAQ': { name: 'FAQ生成', group: 'cs', priority: 'HIGH', enabled: true },
  'CS-REPLY': { name: '回复模板', group: 'cs', priority: 'MEDIUM', enabled: false },
  'CS-SENTIMENT': { name: '情感分析', group: 'cs', priority: 'LOW', enabled: false },

  // Review Agents (审核)
  'R-CONTENT': { name: '内容审核', group: 'review', priority: 'HIGH', enabled: true },
  'R-TECH': { name: '技术审核', group: 'review', priority: 'MEDIUM', enabled: true },
  'R-COMPLIANCE': { name: '合规审核', group: 'review', priority: 'LOW', enabled: false },

  // Devil's Advocate
  'ED-DEVIL': { name: '对抗性审查', group: 'review', priority: 'HIGH', enabled: true }
};

// ========== QODER调度器 v3.0 ==========
class QoderDispatcher {
  constructor() {
    this.msgBus = new MessageBus();
    this.docRegistry = new DocRegistry(DOC_REGISTRY);
    this.state = new PipelineState(STATE_FILE);
    this.deepseek = DEEPSEEK_API_KEY ? new DeepSeekClient(DEEPSEEK_API_KEY) : null;
    
    // 统计
    this.stats = { total: 0, success: 0, failed: 0, skipped: 0 };
  }

  // 获取启用的Agent
  getEnabledAgents() {
    return Object.entries(AGENTS)
      .filter(([id, info]) => info.enabled)
      .map(([id, info]) => ({ id, ...info }));
  }

  // AI生成内容
  async aiGenerate(agentId, prompt) {
    if (!this.deepseek) {
      return this.fallbackGenerate(agentId);
    }
    try {
      return await this.deepseek.runAgent(agentId, prompt);
    } catch (err) {
      console.error(`  [AI ERROR] ${agentId}: ${err.message}`);
      this.state.logException('AI_ERROR', agentId, err.message, 'HIGH');
      return null;
    }
  }

  // 降级生成（无API时）
  fallbackGenerate(agentId) {
    return `[FALLBACK] ${agentId} - 请配置 DEEPSEEK_API_KEY`;
  }

  // 执行单个Agent
  async runAgent(agentId) {
    const agentInfo = AGENTS[agentId];
    if (!agentInfo) {
      console.log(`  [SKIP] 未知Agent: ${agentId}`);
      return null;
    }

    console.log(`\n  [${agentId}] ${agentInfo.name} (${agentInfo.group})`);
    this.msgBus.send('QODER', agentId, MSG_TYPES.TASK_ASSIGN, { priority: agentInfo.priority });

    try {
      let result;
      
      switch (agentId) {
        // Content Agents
        case 'S-BLOG':
          result = await this.runBlogAgent();
          break;
        case 'S-COPY':
          result = await this.runCopyAgent();
          break;
        case 'S-EMAIL':
          result = await this.runEmailAgent();
          break;
        case 'S-DESCRIPTION':
          result = await this.runDescriptionAgent();
          break;

        // Marketing Agents
        case 'M-PINTEREST':
          result = await this.runPinterestAgent();
          break;
        case 'M-INSTAGRAM':
          result = await this.runInstagramAgent();
          break;
        case 'M-AD-COPY':
          result = await this.runAdCopyAgent();
          break;

        // Analytics Agents
        case 'A-DATA':
          result = await this.runDataAgent();
          break;
        case 'A-SEO':
          result = await this.runSeoAgent();
          break;
        case 'A-COMPETITOR':
          result = await this.runCompetitorAgent();
          break;

        // Tech Agents
        case 'T-DEV':
          result = await this.runDevAgent();
          break;
        case 'T-SEO-TECH':
          result = await this.runTechSeoAgent();
          break;
        case 'T-DEPLOY':
          result = await this.runDeployAgent();
          break;

        // Product Agents
        case 'P-SUPPLIER':
          result = await this.runSupplierAgent();
          break;

        // Customer Service
        case 'CS-FAQ':
          result = await this.runFaqAgent();
          break;

        // Review Agents
        case 'R-CONTENT':
          result = await this.runContentReviewAgent();
          break;
        case 'R-TECH':
          result = await this.runTechReviewAgent();
          break;

        // Devil's Advocate
        case 'ED-DEVIL':
          result = await this.runDevilsAdvocate();
          break;

        default:
          result = await this.aiGenerate(agentId, `执行${agentInfo.name}任务`);
      }

      this.msgBus.send(agentId, 'QODER', MSG_TYPES.TASK_COMPLETE, { result });
      this.state.logTask(agentId, 'COMPLETE', result);
      this.stats.success++;
      console.log(`    ✓ ${agentId} 完成`);
      return result;

    } catch (err) {
      console.error(`    ✗ ${agentId} 失败: ${err.message}`);
      this.state.logException('AGENT_ERROR', agentId, err.message, 'HIGH');
      this.stats.failed++;
      return null;
    }
  }

  // ========== Agent实现 ==========

  // S-BLOG: SEO博客文章生成
  async runBlogAgent() {
    const weekNum = this.getWeekNumber();
    const topics = this.getNextBlogTopics(weekNum);
    const results = [];

    for (const topic of topics) {
      const prompt = `为 yaopulife.com 撰写一篇 SEO 博客文章：

标题：${topic.title}
Slug：${topic.slug}
分类：${topic.category}
关键词：${topic.keywords.join(', ')}

要求：
- 英文，1500+词
- 结构：引言(100词) + H2段落×4 + 产品推荐 + 结论CTA
- 自然融入关键词
- 内链到产品页和已有博客
- 产品推荐部分插入 yaopulife.com 产品链接

输出完整的 Markdown 格式文章，包含 frontmatter (title, description, pubDate, category, keywords, image)。`;

      const content = await this.aiGenerate('S-BLOG', prompt);
      if (content) {
        const filepath = path.join(CONTENT_DIR, `${topic.slug}.md`);
        fs.writeFileSync(filepath, content);
        results.push({ slug: topic.slug, path: filepath });
        
        // 提交 IndexNow
        this.submitIndexNow(`https://yaopulife.com/blog/${topic.slug}`);
      }
    }
    return results;
  }

  // M-PINTEREST: Pinterest文案生成
  async runPinterestAgent() {
    const weekNum = this.getWeekNumber();
    const themes = this.getPinterestThemes(weekNum);
    
    const prompt = `为 yaopulife.com 生成 10 条 Pinterest Pin 文案。

本周主题：${themes.primary}
副主题：${themes.secondary}

产品线：
- 羊毛毡宠物肖像 ($25-45)
- 月球灯 ($20-35)
- 海洋树脂艺术 ($15-30)
- 木刻名牌 ($12-20)
- 手工刺绣 ($18-35)

格式（每条）：
### Pin [编号]
**标题** (≤60字符，突出礼品/手工/定制)
**描述** (≤500字符，含hook+产品+CTA)
**链接**: https://yaopulife.com/shop
**标签**: #CustomGift #Handmade #PersonalizedGift #[具体品类] #[场景] #GiftForHer #GiftForHim

要求：
- 混合产品展示/Gift Guide/DIY教程/Behind-the-Scenes
- 标题有吸引力，引发点击
- 描述讲好故事（为什么是完美礼品）
- 标签覆盖搜索意图`;

    const content = await this.aiGenerate('M-PINTEREST', prompt);
    if (content) {
      const filepath = path.join(SOCIAL_DIR, `week-${String(weekNum).padStart(2, '0')}.md`);
      fs.writeFileSync(filepath, `# Pinterest Pin 文案 - Week ${weekNum}\n\n## 策略主题\n- 主打：${themes.primary}\n- 配合：${themes.secondary}\n\n${content}\n\n---\nGenerated by M-PINTEREST at ${new Date().toISOString()}\n`);
      return { file: filepath };
    }
    return null;
  }

  // M-INSTAGRAM: Instagram文案生成
  async runInstagramAgent() {
    const weekNum = this.getWeekNumber();
    
    const prompt = `为 yaopulife.com 生成 3 条 Instagram 帖子文案。

产品线：羊毛毡宠物肖像、月球灯、树脂艺术、木刻名牌、刺绣
品牌风格：手工礼品、温暖、个性化、北美市场

格式（每条）：
### Post [编号]
**标题**: 抓眼球的一句话
**Hook**: 首行（引发好奇/共鸣）
**正文**: 产品故事/制作过程/客户故事 (100-150词)
**CTA**: 引导行动
**Hashtags**: #handmade #customgift #personalizedgift #[品类] #[场景] (8-12个)

要求：
- 视觉感强（描述产品美感）
- 情感共鸣（礼品意义）
- 真实感（手工制作故事）
- 适配 Instagram 美学`;

    const content = await this.aiGenerate('M-INSTAGRAM', prompt);
    if (content) {
      const filepath = path.join(INSTAGRAM_DIR, `week-${String(weekNum).padStart(2, '0')}.md`);
      fs.mkdirSync(INSTAGRAM_DIR, { recursive: true });
      fs.writeFileSync(filepath, `# Instagram 帖子文案 - Week ${weekNum}\n\n${content}\n\n---\nGenerated by M-INSTAGRAM at ${new Date().toISOString()}\n`);
      return { file: filepath };
    }
    return null;
  }

  // S-EMAIL: EDM邮件生成
  async runEmailAgent() {
    const weekNum = this.getWeekNumber();
    
    const prompt = `为 yaopulife.com 生成本周 EDM 邮件。

目标：提升询盘转化
产品：手工定制礼品
风格：亲切、专业、转化导向

输出格式：
### Email 1: 欢迎/产品推荐
- Subject Line (3个选项)
- Preview Text
- Body (HTML格式，简洁段落 + CTA按钮)

### Email 2: 限时促销/紧迫感
- Subject Line (3个选项，带紧迫感)
- Body (突出价值 + 限时优惠 + CTA)

要求：
- 每封邮件都有明确的 CTA（引导到 contact 表单）
- 适应邮件客户端（手机友好）
- 避免垃圾邮件词汇`;

    const content = await this.aiGenerate('S-EMAIL', prompt);
    if (content) {
      const filepath = path.join(EDM_DIR, `week-${String(weekNum).padStart(2, '0')}.md`);
      fs.mkdirSync(EDM_DIR, { recursive: true });
      fs.writeFileSync(filepath, `# EDM Campaign - Week ${weekNum}\n\n${content}\n\n---\nGenerated by S-EMAIL at ${new Date().toISOString()}\n`);
      return { file: filepath };
    }
    return null;
  }

  // A-DATA: 数据分析报告
  async runDataAgent() {
    const today = new Date().toISOString().split('T')[0];
    const state = this.state.state;
    
    const prompt = `生成 yaopulife.com 周报数据分析。

当前数据（从 pipeline-state.json）：
- 周访客：${state.kpis?.weekVisitors?.value || 'N/A'}
- 询盘数：${state.kpis?.inquiries?.value || 0}
- 异常记录：${(state.exceptions || []).length} 条
- 流水线阶段：${state.currentStage}

输出：
## 周报 - ${today}

### 1. 关键指标
| 指标 | 本周 | 上周 | 变化 |
|------|------|------|------|
| 访客数 | - | - | - |
| 页面浏览 | - | - | - |
| 跳出率 | - | - | - |
| 询盘数 | - | - | - |

### 2. 内容产出
- 博客文章：X 篇
- Pinterest 文案：X 条
- EDM：X 封

### 3. SEO 健康度
- 收录页面：X
- 关键词排名：X
- 异常问题：X

### 4. 本周行动
1. ...
2. ...

### 5. 下周计划
1. ...`;

    const content = await this.aiGenerate('A-DATA', prompt);
    if (content) {
      const filepath = path.join(REPORTS_DIR, `${today}_weekly-report.md`);
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
      fs.writeFileSync(filepath, content);
      return { file: filepath };
    }
    return null;
  }

  // A-SEO: SEO监控报告
  async runSeoAgent() {
    const prompt = `为 yaopulife.com 生成 SEO 健康报告。

检查项：
1. Sitemap 可访问性
2. Robots.txt 配置
3. 结构化数据（Schema.org Product）
4. OG 标签完整性
5. 图片 Alt 标签
6. 页面加载速度
7. 移动端友好
8. 死链检查

输出：
## yaopulife.com SEO 健康报告 - ${new Date().toISOString().split('T')[0]}

### 通过项
- ...

### 问题项
- ...

### 优化建议
1. ...
2. ...`;

    const content = await this.aiGenerate('A-SEO', prompt);
    if (content) {
      const today = new Date().toISOString().split('T')[0];
      const filepath = path.join(REPORTS_DIR, `${today}_seo-report.md`);
      fs.writeFileSync(filepath, content);
      return { file: filepath };
    }
    return null;
  }

  // A-COMPETITOR: 竞品分析
  async runCompetitorAgent() {
    const prompt = `分析 yaopulife.com 竞争对手的独立站内容策略。

主要竞品关键词：custom pet portrait, personalized gift, handmade moon lamp, custom wooden sign

分析维度：
1. 产品差异化（定价/品质/定制选项）
2. 内容策略（博客主题/社媒频率）
3. SEO 策略（关键词布局/外链）
4. 流量来源（自然搜索/社媒/付费）
5. 促销策略（折扣/节日活动）

输出：
## yaopulife.com 竞品分析报告

### 主要竞品
1. [竞品名] - [定位] - [网址]
...

### 竞品策略分析
| 维度 | 竞品A | 竞品B | yaopulife机会点 |
|------|-------|-------|-----------------|

### 差异化建议
1. ...

### 内容机会
- 博客话题：...
- Pinterest 策略：...`;

    const content = await this.aiGenerate('A-COMPETITOR', prompt);
    if (content) {
      const today = new Date().toISOString().split('T')[0];
      const filepath = path.join(REPORTS_DIR, `${today}_competitor-report.md`);
      fs.writeFileSync(filepath, content);
      return { file: filepath };
    }
    return null;
  }

  // CS-FAQ: FAQ生成
  async runFaqAgent() {
    const prompt = `为 yaopulife.com 生成常见问题 FAQ。

产品：羊毛毡宠物肖像、月球灯、树脂艺术、木刻名牌、手工刺绣
业务模式：询盘制电商（非购物车），定制礼品
物流：国际配送（美国/欧洲/澳洲），5-15天
价格：$15-200

FAQ话题：
1. 产品价格和定制选项
2. 制作周期和交付时间
3. 定制流程（如何下单）
4. 物流和运费
5. 退换货政策
6. 如何提供宠物照片/定制要求
7. 质量问题处理
8. 批量定制/礼品定制

格式：
### [问题]
[回答 - 专业、耐心、引导到 contact 表单询盘]

语气：专业、友好、有耐心
每个回答结尾：如有更多问题，欢迎联系我们 [Contact →](/contact)`;

    const content = await this.aiGenerate('CS-FAQ', prompt);
    if (content) {
      const filepath = path.join(PROJECT_ROOT, 'content/knowledge/faq.md');
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
      fs.writeFileSync(filepath, `# yaopulife.com 常见问题 FAQ\n\n${content}\n\n---\nGenerated by CS-FAQ at ${new Date().toISOString()}\n`);
      return { file: filepath };
    }
    return null;
  }

  // R-CONTENT: 内容审核
  async runContentReviewAgent() {
    const blogFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
    
    const prompt = `审核 yaopulife.com 的博客内容质量。

已发布博客：
${blogFiles.map(f => `- ${f}`).join('\n')}

审核标准：
1. SEO 优化（关键词密度、H标签结构）
2. 可读性（段落长度、句子复杂度）
3. CTA 有效性
4. 内链完整性
5. 图片 Alt 标签

输出：
## yaopulife.com 内容审核报告

### 通过审核
- [文件名]: 质量评分 8/10

### 需优化
- [文件名]: 问题 + 优化建议

### 优先级修复
1. [具体问题和文件]`;

    const content = await this.aiGenerate('R-CONTENT', prompt);
    if (content) {
      const today = new Date().toISOString().split('T')[0];
      const filepath = path.join(REPORTS_DIR, `${today}_content-review.md`);
      fs.writeFileSync(filepath, content);
      return { file: filepath };
    }
    return null;
  }

  // ED-DEVIL: 对抗性审查
  async runDevilsAdvocate() {
    const state = this.state.state;
    const pendingActions = state.pendingActions || [];
    const exceptions = state.exceptions || [];
    
    const prompt = `作为 yaopulife.com 的对抗性审查员，分析当前运营风险。

当前流水线阶段：${state.currentStage}

待执行任务：
${pendingActions.map(a => `- [${a.priority}] ${a.task} (负责人: ${a.owner})`).join('\n')}

最近异常：
${exceptions.slice(-3).map(e => `- [${e.severity}] ${e.description}`).join('\n')}

请识别：
1. P0 阻塞项（影响业务的关键问题）
2. 潜在风险（可能在未来变成问题）
3. 被忽视的机会
4. 资源分配问题

输出：
## yaopulife.com 风险审查报告

### 🔴 高优先级阻塞
1. ...

### 🟡 中优先级风险
1. ...

### 🟢 低优先级机会
1. ...

### 建议行动
1. 立即（本周）：...
2. 本月：...
3. 下季度：...`;

    const content = await this.aiGenerate('ED-DEVIL', prompt);
    if (content) {
      const today = new Date().toISOString().split('T')[0];
      const filepath = path.join(REPORTS_DIR, `${today}_devil-advocate.md`);
      fs.writeFileSync(filepath, content);
      this.state.logTask('ED-DEVIL', 'COMPLETE', { file: filepath });
      return { file: filepath };
    }
    return null;
  }

  // 其他Agent的占位实现
  async runCopyAgent() {
    const prompt = `为 yaopulife.com 的产品页生成优化文案。

产品类型：手工定制礼品（宠物肖像、月球灯、树脂艺术、木刻名牌、刺绣）
目标：提升转化率，增加询盘

输出：
### 产品名称
**卖点**: ...
**描述**: 150词，包含材质、工艺、定制选项、使用场景
**CTA**: "Get Your Custom [Product] Today"
**信任元素**: ...

### 按钮文案
- 主CTA: ...
- 次CTA: ...`;

    return await this.aiGenerate('S-COPY', prompt);
  }

  async runDescriptionAgent() {
    return await this.aiGenerate('S-DESCRIPTION', `为 yaopulife.com 生成产品描述优化建议。`);
  }

  async runAdCopyAgent() {
    return await this.aiGenerate('M-AD-COPY', `为 yaopulife.com 生成 Pinterest/Google 广告文案。`);
  }

  async runDevAgent() {
    return { status: 'pending', message: 'T-DEV 需要人工触发具体开发任务' };
  }

  async runTechSeoAgent() {
    return await this.aiGenerate('T-SEO-TECH', `为 yaopulife.com 执行技术 SEO 检查。`);
  }

  async runDeployAgent() {
    return { status: 'pending', message: 'T-DEPLOY 自动部署由 GitHub Actions 处理' };
  }

  async runSupplierAgent() {
    return await this.aiGenerate('P-SUPPLIER', `为 yaopulife.com 整理供应商档案和报价信息。`);
  }

  async runTechReviewAgent() {
    return { status: 'skipped', message: 'R-TECH 需要具体代码或技术问题输入' };
  }

  // ========== 工具函数 ==========

  getWeekNumber() {
    const state = this.state.state;
    return state.thisWeek?.weekNumber || 1;
  }

  getNextBlogTopics(weekNum) {
    const cycles = [
      [
        { slug: 'custom-gifts-for-graduates-2026', title: 'Best Custom Graduation Gifts 2026: Personalized Ideas That Actually Get Used', category: 'gift-guides', keywords: ['graduation gift ideas', 'personalized graduate gift', 'custom gift'] },
        { slug: 'how-to-photograph-pet-portraits', title: 'How to Take the Perfect Pet Photo for a Custom Portrait Order', category: 'diy-inspiration', keywords: ['pet photography tips', 'custom pet portrait', 'pet photo guide'] }
      ],
      [
        { slug: 'ocean-themed-home-decor-ideas', title: '15 Ocean-Themed Home Decor Ideas (Handmade Edition)', category: 'gift-guides', keywords: ['coastal home decor', 'ocean themed decor', 'beach house style'] },
        { slug: 'handmade-birthday-gift-guide-2026', title: 'Handmade Birthday Gift Ideas for Every Personality', category: 'gift-guides', keywords: ['birthday gift guide', 'handmade birthday', 'personalized gift'] }
      ],
      [
        { slug: 'pet-portrait-display-tips', title: 'Where to Display Your Custom Pet Portrait: 10 Creative Ideas', category: 'product-care', keywords: ['how to display art', 'pet portrait display', 'home decor'] },
        { slug: 'moon-lamp-personal-stories', title: 'Custom Moon Lamps: Turning Memories into Glowing Art', category: 'behind-the-scenes', keywords: ['moon lamp gift', 'custom lamp', 'photo lamp'] }
      ],
      [
        { slug: 'minimalist-home-decor-2026', title: 'Minimalist Home Decor: Simple Handmade Pieces', category: 'diy-inspiration', keywords: ['minimalist decor', 'simple home', 'handmade design'] },
        { slug: 'wedding-gift-ideas-2026', title: 'Unique Wedding Gift Ideas: Handmade Custom Presents', category: 'gift-guides', keywords: ['wedding gift', 'custom wedding gift', 'handmade wedding'] }
      ]
    ];
    const idx = (weekNum - 1) % cycles.length;
    return cycles[idx];
  }

  getPinterestThemes(weekNum) {
    const themes = [
      { primary: 'Father\'s Day Gifts 2026', secondary: 'Graduation Gifts' },
      { primary: 'Summer Home Decor', secondary: 'Pet Lovers' },
      { primary: 'Wedding Season', secondary: 'Anniversary Gifts' },
      { primary: 'Birthday Gifts', secondary: 'Housewarming' }
    ];
    return themes[(weekNum - 1) % themes.length];
  }

  async submitIndexNow(url) {
    // IndexNow 提交由单独脚本处理
    console.log(`    [INDEXNOW] 待提交: ${url}`);
  }

  // ========== 主运行 ==========

  async run(options = {}) {
    const { specificAgent, parallel, dryRun } = options;
    
    console.log('\n' + '='.repeat(60));
    console.log('QODER Agent Dispatcher v3.0 - AI Powered');
    console.log(`API: ${this.deepseek ? 'DeepSeek Connected' : 'No API (Fallback Mode)'}`);
    console.log(`Mode: ${dryRun ? 'DRY RUN' : (parallel ? 'PARALLEL' : 'SEQUENTIAL')}`);
    console.log('='.repeat(60));

    // 确定要运行的 Agent
    let agentsToRun;
    if (specificAgent) {
      agentsToRun = [specificAgent];
    } else if (dryRun) {
      agentsToRun = Object.entries(AGENTS).filter(([id, info]) => info.enabled).map(([id]) => id);
      console.log('\n[DRY RUN] 以下 Agent 将被执行:\n');
      agentsToRun.forEach(a => console.log(`  → ${a}`));
      return;
    } else {
      // 每周核心任务：内容 + 营销 + 数据
      agentsToRun = ['S-BLOG', 'M-PINTEREST', 'M-INSTAGRAM', 'S-EMAIL', 'A-DATA', 'ED-DEVIL'];
    }

    this.stats.total = agentsToRun.length;

    if (parallel) {
      // 并行运行
      const promises = agentsToRun.map(agentId => this.runAgent(agentId));
      await Promise.all(promises);
    } else {
      // 顺序运行
      for (const agentId of agentsToRun) {
        await this.runAgent(agentId);
      }
    }

    // 输出统计
    console.log('\n' + '='.repeat(60));
    console.log('执行统计');
    console.log(`  Total: ${this.stats.total}`);
    console.log(`  Success: ${this.stats.success}`);
    console.log(`  Failed: ${this.stats.failed}`);
    console.log('='.repeat(60) + '\n');

    return this.stats;
  }

  showStatus() {
    const enabled = this.getEnabledAgents();
    console.log('\n' + '='.repeat(60));
    console.log('QODER Agent System Status');
    console.log(`API: ${this.deepseek ? '✓ DeepSeek Connected' : '✗ No API Key'}`);
    console.log(`Enabled Agents: ${enabled.length}/33`);
    console.log('='.repeat(60));
    
    // 按组分类显示
    const groups = {};
    enabled.forEach(a => {
      if (!groups[a.group]) groups[a.group] = [];
      groups[a.group].push(a.id);
    });
    
    Object.entries(groups).forEach(([group, agents]) => {
      console.log(`\n${group.toUpperCase()} (${agents.length}):`);
      agents.forEach(id => console.log(`  • ${id}`));
    });
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// ========== 主程序 ==========
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const showStatus = args.includes('--status');
const parallel = args.includes('--parallel');
const specificAgent = args.find(a => a.startsWith('--agent='))?.split('=')[1];

const dispatcher = new QoderDispatcher();

if (showStatus) {
  dispatcher.showStatus();
} else {
  dispatcher.run({ specificAgent, parallel, dryRun });
}