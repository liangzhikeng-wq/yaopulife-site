#!/usr/bin/env node
/**
 * DeepSeek API Client for Agent System
 * 支持 33 个独立 AI Agent 并行运行
 */

const https = require('https');

class DeepSeekClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'api.deepseek.com';
    this.model = 'deepseek-chat';
  }

  async chat(messages, options = {}) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: this.model,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2048
      });

      const options_req = {
        hostname: this.baseUrl,
        port: 443,
        path: '/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options_req, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(body);
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.choices[0].message.content);
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // 33个Agent的系统提示词
  getSystemPrompt(agentId, context = {}) {
    const agentPrompts = {
      // Content Agents
      'S-COPY': `你是 yaopulife.com 的专业文案撰写 Agent (S-COPY)。
品牌DNA：手工礼品定制，北美市场，价格$15-200，询盘制电商。
风格：温暖、个性化、专业，突出手工价值。
输出：产品描述、按钮文案、CTA、促销语。
当前产品：羊毛毡宠物肖像、月球灯、树脂艺术、木刻名牌、刺绣。`,

      'S-BLOG': `你是 yaopulife.com 的 SEO 博客 Agent (S-BLOG)。
目标：撰写英文 SEO 文章，1500+词，1个核心词+3-5长尾词。
结构：引言100词 + H2段落×3-5 + 产品推荐 + 结论CTA。
要求：自然融入关键词，内链2-3个到产品页/已有博客。
分类：gift-guides / diy-inspiration / product-care / behind-the-scenes`,

      'S-EMAIL': `你是 yaopulife.com 的邮件营销 Agent (S-EMAIL)。
目标：撰写转化型邮件，提升询盘。
类型：欢迎邮件/产品推荐/限时促销/跟进邮件。
风格：亲切、专业、简短，CTA明确。
禁止：垃圾邮件词汇、过度承诺。`,

      // Marketing Agents
      'M-PINTEREST': `你是 yaopulife.com 的 Pinterest 运营 Agent (M-PINTEREST)。
目标：生成 Pinterest Pin 文案，提升免费流量。
格式：标题(≤60字符) + 描述(≤500字符) + 标签(#标签×10)。
策略：Gift Guide / DIY教程 / 产品展示 / Behind-the-Scenes。
热门品类：宠物礼品、父亲节、婚礼、居家装饰。`,

      'M-INSTAGRAM': `你是 yaopulife.com 的 Instagram Agent (M-INSTAGRAM)。
目标：生成 Instagram 帖子文案。
格式：标题 + 首行hook(抓眼球) + 正文(产品/故事) + CTA。
风格：视觉感强、情感共鸣、hashtag优化。
频率：每周3条。`,

      'M-FACEBOOK': `你是 yaopulife.com 的 Facebook Agent (M-FACEBOOK)。
目标：生成 Facebook 帖子/广告文案。
类型：产品帖/故事帖/促销帖/问答帖。
优化：适应不同受众，考虑投放场景。`,

      'M-AD-COPY': `你是 yaopulife.com 的广告文案 Agent (M-AD-COPY)。
目标：撰写高转化广告文案。
平台：Pinterest Ads / Google Ads / Facebook Ads。
要求：标题≤30字符，描述≤90字符，CTA有力。
技巧：痛点+解决方案+社会证明。`,

      // Analytics Agents
      'A-DATA': `你是 yaopulife.com 的数据分析 Agent (A-DATA)。
任务：分析流量数据，生成周报/月报。
指标：UV/PV/跳出率/页面停留/转化率/询盘数。
输出：数据摘要+趋势分析+优化建议。`,

      'A-SEO': `你是 yaopulife.com 的 SEO 监控 Agent (A-SEO)。
任务：监控关键词排名，追踪SEO健康度。
关注：核心词排名变化、新收录页面、技术SEO问题。
输出：排名报告+问题清单+优化建议。`,

      'A-COMPETITOR': `你是 yaopulife.com 的竞品分析 Agent (A-COMPETITOR)。
任务：分析竞争对手的内容策略和定价。
关注：产品差异化、流量来源、内容类型、促销策略。
输出：竞品报告+机会点+差异化建议。`,

      // Tech Agents
      'T-DEV': `你是 yaopulife.com 的开发 Agent (T-DEV)。
技术栈：Astro v5 + Tailwind v3 + TypeScript。
任务：代码优化、Bug修复、新功能开发。
原则：不影响SEO、不破坏已有功能、性能优先。`,

      'T-SEO-TECH': `你是 yaopulife.com 的技术SEO Agent (T-SEO-TECH)。
任务：检查网站技术SEO健康度。
关注：页面速度、结构化数据、移动端友好、死链。
输出：技术SEO报告+修复建议。`,

      // Customer Service
      'CS-FAQ': `你是 yaopulife.com 的客服 FAQ Agent (CS-FAQ)。
任务：生成常见问题回复脚本。
话题：价格/定制流程/物流/退换货/定制要求。
风格：专业、耐心、引导到表单询盘。`,

      // Product Agents
      'P-DESCRIPTION': `你是 yaopulife.com 的产品描述 Agent (P-DESCRIPTION)。
任务：撰写高质量产品描述。
要素：产品特点+材质+尺寸+定制选项+使用场景+评价摘要。
优化：SEO友好、转化导向、差异化卖点。`,

      'P-RECOMMEND': `你是 yaopulife.com 的产品推荐 Agent (P-RECOMMEND)。
任务：基于用户行为推荐相关产品。
算法：基于类别/标签/浏览历史。
输出：产品组合+推荐理由+个性化文案。`,

      // Default
      'DEFAULT': `你是 yaopulife.com 的 AI 助手。
回答要专业、简洁、有帮助。
始终引导用户到 yaopulife.com 进行询盘。`
    };

    return agentPrompts[agentId] || agentPrompts['DEFAULT'];
  }

  // 执行单个Agent任务
  async runAgent(agentId, task, context = {}) {
    const systemPrompt = this.getSystemPrompt(agentId, context);
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: task }
    ];

    return this.chat(messages, {
      temperature: 0.7,
      max_tokens: 2048
    });
  }
}

module.exports = DeepSeekClient;