# yaopulife DIY 独立站运营 SOP — Qoder 执行版 V2.0

## 一、文档信息

| 字段 | 内容 |
|------|------|
| 文档编号 | SOP-YAOPULIFE-OPS-002 |
| 版本号 | V2.0 |
| 生效日期 | 2026-05-14 |
| 适用项目 | yaopulife.com — DIY 定制产品询盘制独立站 |
| 执行平台 | Qoder CLI + OpenClaw (本地 ComfyUI) |

---

## 二、项目现状与技术栈

### 2.1 已完成

- 域名: yaopulife.com (Namecheap 注册, DNS 已切 Cloudflare)
- 网站: Astro v5 + Tailwind v3, 已部署至 Vercel
- 产品: 10 款 SKU 已选品, 40 张 AI 产品图已生成
- 页面: Home / Shop (10产品) / Product Detail (带图库) / How It Works / Contact / About / Privacy / 404
- SEO: Meta/OG/Twitter Card/Schema.org/Sitemap/robots.txt

### 2.2 技术栈

| 层级 | 工具 | 用途 |
|------|------|------|
| 前端框架 | Astro v5 (SSG) | 静态页面生成 |
| 样式 | Tailwind CSS v3 | UI样式 |
| CMS | Sanity (待接入) | 产品/博客内容管理 |
| 部署 | Vercel | 托管 + Edge Functions |
| CDN/DNS | Cloudflare | DNS + 缓存 + 安全 |
| 图床 | Cloudflare R2 (待启用) | 产品图片CDN |
| 邮件(营销) | Klaviyo | EDM + 自动化流 |
| 邮件(事务) | Resend | 表单通知 + 订单确认 |
| 客服 | Tidio | 在线聊天 + FAQ机器人 |
| 表单 | Formspree / Resend | 询盘收集 |
| 支付 | PayPal + Stripe (收款链接) | 按单收款 |
| 生图 | ComfyUI + OpenClaw | 本地AI产品图生成 |
| 分析 | Cloudflare Analytics + Vercel Analytics | 流量监控 |
| 定时任务 | GitHub Actions Scheduled | 自动化脚本 |

### 2.3 商业模式

```
询盘制（非购物车电商）:
用户浏览产品 → 提交定制需求(表单/聊天) → 人工沟通确认方案
→ 发送收款链接(PayPal/Stripe) → 付款 → 1688供应商制作
→ 质检 → 国际物流发货 → 售后跟进
```

---

## 三、职责分工

| 角色 | 执行方 | 职责 |
|------|--------|------|
| 内容生产 | Qoder | SEO文章、产品描述、邮件文案、社媒内容 |
| 产品图生成 | OpenClaw | ComfyUI工作流执行, 按SOP质检输出 |
| 网站开发/部署 | Qoder | 代码修改, build, 部署到Vercel |
| 数据监控 | Qoder + GitHub Actions | 流量/询盘/转化数据采集与报告 |
| 供应链管理 | 人 | 联系供应商, 下单, 质检, 发货 |
| 客户沟通 | 人 (Tidio辅助) | 询盘回复, 方案确认, 售后处理 |
| 策略决策 | 人 | 选品方向, 定价, 预算分配, 营销策略 |
| SEO/广告投放 | Qoder生成 + 人执行 | 内容生产自动化, 投放操作人工执行 |

---

## 四、Phase 0: 基础设施补全

### Step 0-01: Sanity CMS 接入

**目的**: 产品和博客内容从硬编码迁移到 CMS, 实现内容与代码分离

**执行内容**:
1. 创建 Sanity 项目, 获取 Project ID + Dataset
2. 安装 `@sanity/client` 到 Astro 项目
3. 将现有 10 款产品数据迁移到 Sanity schemas (product.js 已定义)
4. 修改 `shop.astro` 和 `product/[id].astro` 从 Sanity 拉数据
5. 创建 blog schema, 支持后续 SEO 文章发布
6. 配置 Vercel 环境变量: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_TOKEN`

**已有 Schema 定义**: `yaopulife-site/sanity/schemas/` (product.js, category.js, blogPost.js, testimonial.js)

**人工操作**: 注册 Sanity 账号, 提供 Project ID 和 Token

### Step 0-02: 邮件系统配置

**Resend (事务邮件)**:
1. 注册 Resend, 验证 yaopulife.com 域名 (添加 DNS 记录)
2. 获取 API Key
3. 创建 Vercel Edge Function: `/api/contact` 处理表单提交
4. 表单提交 → Resend 发送通知邮件到你的邮箱 + 自动回复给客户

**Klaviyo (营销邮件)**:
1. 注册 Klaviyo, 连接域名
2. 创建注册弹窗 (首次访问10%折扣)
3. 配置自动化 Flow:
   - Welcome Series (注册后 Day 0/3/7 三封)
   - Inquiry Follow-up (提交表单后 24h 无回复自动跟进)
   - Win-back (30天无互动唤醒)

**人工操作**: 注册账号, 提供 API Keys

### Step 0-03: 客服系统配置

**Tidio 配置**:
1. 安装 Tidio 脚本 (Layout.astro 中已预留位置)
2. 配置 FAQ 自动回复 (20个常见问题)
3. 设置工作时间和离线自动回复
4. 配置询盘表单字段 (产品兴趣/定制需求/预算范围)

**FAQ 知识库** (Qoder 生成):
- 订单流程 (5个): 如何下单/定制流程/工期/修改需求/取消
- 支付相关 (3个): 支付方式/货币/安全性
- 物流相关 (4个): 运费/时效/追踪/关税
- 产品相关 (5个): 材质/尺寸/定制范围/能否退货/质量保证
- 其他 (3个): 批量订购/合作/联系方式

### Step 0-04: 分析与追踪

**Cloudflare Analytics** (已默认启用):
- Web Analytics: 页面浏览, 访客数, 来源
- 无需额外配置

**Vercel Analytics**:
1. 在 Astro 中安装 `@vercel/analytics`
2. 自动追踪 Web Vitals (LCP/FID/CLS)

**Google Analytics 4** (后期添加):
- 初期 Cloudflare + Vercel 已够用
- 日均访客 >100 后再接入 GA4 做深度分析

**事件追踪** (Vercel Edge Function):
- 表单提交事件
- 聊天发起事件
- 产品页停留时长

---

## 五、Phase 1: 内容营销 (SEO 驱动)

这是询盘制独立站的核心获客方式。通过高质量内容获取自然搜索流量, 将访客转化为询盘。

### Step 1-01: 关键词研究

**执行方式**: Qoder 每月执行一次

**任务**:
1. 搜索以下品类的长尾关键词:
   - `custom needle felt pet portrait`
   - `personalized embroidery hoop gift`
   - `custom moon lamp with photo`
   - `handmade resin ocean coasters`
   - `personalized wooden name sign`
2. 按搜索意图分类:
   - 信息型 (how to/what is) → 博客文章
   - 商业型 (best/review/vs) → 产品对比文章
   - 交易型 (buy/custom/order) → 产品页 SEO 优化
3. 输出关键词表: `data/keywords.csv`
   - 字段: keyword, monthly_volume, difficulty, intent, target_page, priority

**工具**: WebSearch + 竞品页面分析

### Step 1-02: SEO 博客文章生产

**频率**: 每周 2 篇

**文章结构**:
```
---
title: [含核心关键词, 50-60字符]
slug: [小写+连字符]
meta_description: [150-160字符, 含关键词+卖点]
keywords: [核心词, 长尾词1, 长尾词2]
category: [gift-guides / diy-inspiration / product-care / behind-the-scenes]
---

## 引言 (100词, 提出问题/痛点)
## H2 段落 x 3-5 (各300-400词)
## 产品推荐 (自然嵌入2-3个产品链接)
## 结论 + CTA (100词)

总字数: >= 1500词
内链: 2-3个 (链向产品页或已有博客)
```

**内容方向** (按月轮换):
- Month 1: Gift Guide 类 ("Best Custom Pet Gifts for Dog Lovers", "Unique Wedding Gift Ideas")
- Month 2: How-to/DIY 类 ("How to Choose the Perfect Pet Portrait Style")
- Month 3: Behind-the-scenes 类 ("How Our Needle Felt Portraits Are Made")
- Month 4: Seasonal 类 ("Valentine's Day Custom Gift Guide")

**输出路径**: `yaopulife-site/src/content/blog/[slug].md`

**发布流程**:
1. Qoder 写文章 → `src/content/blog/`
2. 创建对应的 Astro 博客页面路由
3. Build + Deploy 到 Vercel
4. 提交 URL 到 Google Search Console

### Step 1-03: 产品页 SEO 优化

**执行方式**: Qoder 每月检查一次

**优化项**:
1. 每个产品页的 Title/Description 是否包含交易型关键词
2. 产品描述是否 >= 300 词
3. 图片 ALT 标签是否描述性填写
4. Schema.org Product 结构化数据是否正确
5. 内链结构: 相关产品互相链接

**输出**: 直接修改代码 + 部署

---

## 六、Phase 2: 社媒运营

### Step 2-01: Pinterest (最高优先级)

**为什么 Pinterest 优先**: DIY/手工/家居品类, Pinterest 是最精准的免费流量来源。

**频率**: 每周 10 个 Pin

**Pin 内容**:
1. 产品图 Pin (主图, 场景图各一)
2. Idea Pin (制作过程/定制流程)
3. 博客文章配图 Pin

**Pin 格式**:
```
标题: [关键词优化, 如 "Custom Needle Felted Cat Portrait - Personalized Pet Gift"]
描述: [100-150词, 含3-5个关键词, CTA链接到产品页]
图片: 1000x1500 (2:3竖版) 或 1000x1000
链接: https://yaopulife.com/product/[id]
```

**执行方式**: Qoder 批量生成 Pin 描述文案 → 人工在 Pinterest 发布

**输出路径**: `content/social/pinterest/week-[N].md`

### Step 2-02: Instagram

**频率**: 每周 3 帖 + 2 Stories

**内容类型**:
- Feed: 产品美图 + 客户定制成品展示
- Reels: 制作过程延时/开箱/对比 (15-30秒脚本)
- Stories: 日常互动/投票/问答

**执行方式**: Qoder 生成文案和脚本 → 人工拍摄/制作 → 人工发布

### Step 2-03: TikTok

**频率**: 每周 2 个视频

**内容方向**:
- "Watch me make..." 制作过程
- Before/After 对比
- 客户收到产品的反应 (UGC)
- "How to order a custom [product]" 教程

**执行方式**: Qoder 写脚本 → 人工拍摄发布

---

## 七、Phase 3: 邮件营销

### Step 3-01: 邮件列表建设

**获取渠道**:
1. 网站弹窗: 首次访问 5 秒后显示, 10% off 首单折扣换取邮箱
2. 页脚订阅表单: 常驻, "Get DIY inspiration & exclusive offers"
3. 博客内容升级: 文章底部 "Download our free gift guide" 换取邮箱
4. 退出意图弹窗: 离开时显示折扣码

**实现方式**: Klaviyo 嵌入表单 + Vercel Edge Function 处理

### Step 3-02: 自动化邮件流 (Flows)

| Flow | 触发条件 | 邮件数 | 内容 |
|------|----------|--------|------|
| Welcome Series | 新订阅 | 3封 | Day0: 欢迎+折扣码 / Day3: 品牌故事+热门产品 / Day7: 定制流程教程 |
| Inquiry Follow-up | 提交表单 | 2封 | 1h: 确认收到 / 24h: 如未回复提醒 |
| Post-Purchase | 付款完成 | 3封 | Day0: 订单确认+工期 / 发货: 物流追踪 / Day7收货后: 评价邀请 |
| Win-back | 30天无互动 | 2封 | Day30: "We miss you"+新品 / Day45: 最后提醒+折扣 |

**执行方式**: Qoder 撰写所有邮件文案 → 人工在 Klaviyo 配置 Flow

### Step 3-03: Campaign 邮件 (手动发送)

**频率**: 每周 1 封

**轮换主题**:
- Week 1: 新品/新SKU上线
- Week 2: 客户故事/评价展示
- Week 3: 博客精选/DIY灵感
- Week 4: 限时优惠/节日促销

**邮件规范**:
- 主题行: <= 50 字符, 2 个候选版本 (A/B 测试)
- 预览文本: 40-90 字符
- 正文: 简洁直接, 1 个主要 CTA
- 产品推荐: 2-3 个
- 必须包含退订链接 (CAN-SPAM + GDPR)

**输出路径**: `content/edm/[campaign-name].md`

---

## 八、Phase 4: 询盘转化优化

### Step 4-01: 表单优化

**当前表单字段**: name, email, product interest, requirements, file upload

**优化方向**:
1. 添加预算范围选择 (dropdown): Under $50 / $50-100 / $100-200 / $200+
2. 添加紧急程度: Standard (2-3 weeks) / Rush (1 week, +30%)
3. 表单提交后显示 Thank You 页面 + 预期响应时间
4. 自动回复邮件: 确认收到 + 定制流程说明 + FAQ 链接

### Step 4-02: 产品页转化组件

**需要添加的组件**:

1. **信任徽章** (Add to Inquiry 按钮下方):
   - Free Design Preview | Handcrafted | Worldwide Shipping | Satisfaction Guarantee

2. **定制流程时间线** (产品页内):
   - Step 1: Share Your Idea → Step 2: AI Preview (24h) → Step 3: Crafting → Step 4: Delivery

3. **客户评价区** (产品页底部):
   - 接入 Sanity testimonial schema
   - 展示 3-5 条评价 + 星级

4. **相关产品推荐**:
   - 同品类其他产品, "You might also like"

5. **紧迫感元素**:
   - "Current production time: 10-14 days"
   - 节日前: "Order by [date] for Christmas delivery"

**执行方式**: Qoder 开发组件 → Build → Deploy

### Step 4-03: Tidio 聊天优化

**自动化回复脚本**:
```
触发: 用户发送消息
→ 判断关键词:
  - "price/cost/how much" → 回复产品价格范围 + 链接到产品页
  - "shipping/delivery" → 回复物流信息 (7-15天, 免运费满$50)
  - "custom/personalize" → 回复定制流程 + 引导到表单
  - "track/order status" → 请求订单号, 转人工
  - 其他 → 尝试FAQ匹配, 无匹配则转人工
```

**工作时间外自动回复**:
```
"Thanks for reaching out! We're currently offline but will respond within 12 hours.
In the meantime, you can:
- Browse our FAQ: [link]
- Submit a custom order request: [link]
- Email us: hello@yaopulife.com"
```

---

## 九、Phase 5: 产品扩展与图片管理

### Step 5-01: 新品上架流程

当需要添加新 SKU 时:

1. **选品决策** (人):
   - 确定产品类型, 参考价格, 定制点
   - 提供灵感参考图

2. **产品图生成** (OpenClaw):
   - Qoder 更新 `docs/openclaw-task-dispatch.md` 添加新 SKU 的 prompt
   - OpenClaw 按 SOP 生成 4 张图 (1主图+3场景)
   - 输出到 `public/products/[category]/`

3. **页面创建** (Qoder):
   - 在 Sanity 添加产品数据 (或直接修改代码)
   - 更新 shop.astro 产品列表
   - 创建/更新产品详情页
   - Build + Deploy

4. **SEO 配套** (Qoder):
   - 撰写产品描述 (>=300词)
   - 生成对应 Pinterest Pin 文案
   - 规划 1 篇关联博客文章

### Step 5-02: 产品图更新/优化

**触发条件**: 产品图转化率低, 或需要季节性更换场景

**流程**:
1. Qoder 分析哪些产品页询盘率低
2. 更新 OpenClaw 任务派发中的 prompt (更换场景/角度)
3. OpenClaw 重新生成
4. Qoder 替换图片 + 部署

### Step 5-03: Cloudflare R2 图床迁移 (后期)

**触发条件**: 产品图超过 100 张, 或需要 WebP/AVIF 自动转换

**流程**:
1. 创建 R2 Bucket: `yaopulife-images`
2. 配置自定义域: `images.yaopulife.com`
3. 批量上传 `public/products/` 到 R2
4. 配置 Cloudflare Image Resizing (自动 WebP + 缩放)
5. 修改产品页图片 src 指向 R2 CDN URL

---

## 十、Phase 6: 数据监控与优化

### Step 6-01: 周数据检查 (GitHub Actions)

**频率**: 每周一 9:00 自动执行

**监控指标**:
| 指标 | 数据源 | 目标 |
|------|--------|------|
| 周访客数 | Cloudflare Analytics API | 环比增长 |
| 页面浏览量 | Cloudflare Analytics API | Top 10 页面 |
| 表单提交数 | Formspree/Resend 统计 | >= 5/周 |
| 邮件订阅数 | Klaviyo API | >= 10/周 |
| 邮件打开率 | Klaviyo API | >= 25% |
| 跳出率 | Vercel Analytics | <= 60% |

**输出**: `reports/weekly/[date].md`

**GitHub Actions 配置**:
```yaml
# .github/workflows/weekly-report.yml
name: Weekly Report
on:
  schedule:
    - cron: '0 1 * * 1'  # UTC 01:00 Monday = 北京时间 09:00
  workflow_dispatch:

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: node scripts/weekly-report.js
        env:
          CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
          CF_ZONE_ID: ${{ secrets.CF_ZONE_ID }}
          KLAVIYO_API_KEY: ${{ secrets.KLAVIYO_API_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: weekly-report
          path: reports/weekly/
```

### Step 6-02: 月度复盘

**频率**: 每月 1 日

**Qoder 执行内容**:
1. 汇总 4 份周报数据
2. 分析趋势:
   - 流量来源变化 (直接/搜索/社媒/邮件)
   - 高转化页面 vs 高跳出页面
   - 博客文章带来的搜索流量
   - 邮件营销 ROI
3. 输出优化建议:
   - 哪些内容方向继续
   - 哪些产品需要更好的图/描述
   - 下月内容计划建议

**输出**: `reports/monthly/[month].md`

### Step 6-03: SEO 排名追踪

**频率**: 每两周一次

**追踪内容**:
1. 核心关键词在 Google 的排名位置
2. 新增收录页面数 (Google Search Console)
3. 反链增长情况
4. 竞品排名变化

**执行方式**: Qoder 使用 WebSearch 检查排名 + 分析 Search Console 数据

---

## 十一、Phase 7: 付费广告 (后期启动)

**启动条件**: 自然流量稳定 (>=50 UV/天) + 询盘转化率验证 (>=2%)

### Step 7-01: Google Ads

**策略**: 搜索广告, 精准拦截交易型关键词

**关键词组**:
- `custom pet portrait [needle felt/embroidery]`
- `personalized [wedding/anniversary] gift`
- `custom moon lamp with photo`
- `handmade resin coasters`

**预算**: 起步 $10/天, 验证 ROAS >= 3 后逐步加量

**Qoder 职责**: 撰写广告文案 (标题15字符x3 + 描述90字符x2)

### Step 7-02: Pinterest Ads

**策略**: 推广已有高互动的 Pin

**预算**: 起步 $5/天

**Qoder 职责**: 分析哪些 Pin 互动率高, 建议推广候选

### Step 7-03: Meta/Instagram Ads (可选)

**策略**: 兴趣定向 + Lookalike (基于现有询盘客户)

**慎用原因**: DIY定制品的广告ROAS通常低于搜索广告, 建议验证Google Ads效果后再考虑

---

## 十二、供应链管理 (人工主导)

### Step 12-01: 供应商管理

| 品类 | 供应商渠道 | 备选数量 | 关键指标 |
|------|-----------|----------|----------|
| 羊毛毡宠物画 | 淘宝/1688 | 2-3家 | 工期<=14天, 定制还原度>=90% |
| 手工刺绣 | 1688 | 2-3家 | 工期<=14天, 针法细腻 |
| 月球灯 | 1688 | 2家 | 工期<=5天, 照片清晰度高 |
| 滴胶杯垫 | 1688 | 2家 | 工期<=5天, 不起泡不发黄 |
| 木牌刻字 | 1688 | 2家 | 工期<=3天, 雕刻精度高 |

### Step 12-02: 订单处理流程

```
1. 收到询盘 (表单/Tidio)
2. 12h内回复: 确认需求 + 报价 + 工期
3. 客户确认 → 发送 PayPal/Stripe 收款链接
4. 收款确认 → 下单给供应商 (附定制需求)
5. 供应商交付 → 质检拍照
6. 国际物流发货 (云途/燕文/4PX)
7. 提供追踪号 → 邮件通知客户
8. 确认签收 → 发送评价邀请
```

### Step 12-03: 物流方案

| 目的地 | 物流商 | 时效 | 成本 | 运费策略 |
|--------|--------|------|------|----------|
| 美国 | 云途YT/4PX | 7-15天 | $5-8 | 满$50免运费 |
| 英国/欧盟 | 燕文 | 10-20天 | $8-12 | 满$80免运费 |
| 加拿大/澳洲 | 云途YT | 10-18天 | $8-12 | 满$80免运费 |
| 其他 | 4PX | 15-30天 | $12-18 | 实收 |

---

## 十三、定时任务总览

| 任务 | 频率 | 执行方 | 触发方式 |
|------|------|--------|----------|
| SEO博客文章生产 | 每周2篇 | Qoder | 人工触发 |
| Pinterest Pin文案 | 每周10个 | Qoder | 人工触发 |
| Instagram文案 | 每周3帖 | Qoder | 人工触发 |
| EDM Campaign文案 | 每周1封 | Qoder | 人工触发 |
| 周数据报告 | 每周一 | GitHub Actions | 自动 (cron) |
| 月度复盘 | 每月1日 | Qoder | 人工触发 |
| SEO排名检查 | 每两周 | Qoder | 人工触发 |
| 产品图生成/更新 | 按需 | OpenClaw | Qoder派发任务 |
| 网站功能迭代 | 按需 | Qoder | 人工触发 |

---

## 十四、成本预算 (月度)

### 启动期 (Month 1-3)

| 项目 | 月费用 | 备注 |
|------|--------|------|
| 域名 | ~$1/月 | $11.48/年已付 |
| Vercel | $0 | Hobby plan 足够 |
| Cloudflare | $0 | Free plan |
| Sanity | $0 | Free plan (3用户) |
| Klaviyo | $0 | 免费至250联系人 |
| Tidio | $0 | 免费至50对话/月 |
| Resend | $0 | 免费至100封/天 |
| Formspree | $0 | 免费至50提交/月 |
| **总计** | **~$1/月** | 纯工具成本 |

### 增长期 (Month 4+)

| 项目 | 月费用 | 触发条件 |
|------|--------|----------|
| Klaviyo | $20/月 | 订阅超250人 |
| Google Ads | $300/月 | 自然流量验证后 |
| Pinterest Ads | $150/月 | Pin互动率验证后 |
| Vercel Pro | $20/月 | 需要更多带宽/功能 |
| Cloudflare R2 | ~$5/月 | 图片超100张 |
| **总计** | **~$500/月** | 视增长节奏调整 |

---

## 十五、里程碑与验收标准

| 里程碑 | 验收标准 | 预计位置 |
|--------|----------|----------|
| M1: 网站上线 | 10产品+完整页面+可访问 | **已完成** |
| M2: 内容启动 | 8篇博客+20 Pins+邮件系统就绪 | Phase 1-3 完成 |
| M3: 首个询盘 | 收到第一个真实客户询盘 | M2 后 2-4 周 |
| M4: 首单成交 | 完成第一笔付款+交付 | M3 后 1-2 周 |
| M5: 稳定获客 | 周均 >= 5 个询盘 | M4 后 4-8 周 |
| M6: 付费放量 | Google Ads ROAS >= 3 | M5 验证后 |

---

## 十六、Qoder 执行指令快速索引

日常运营中, 直接给 Qoder 以下指令即可触发对应流程:

| 指令 | 触发操作 |
|------|----------|
| "写2篇博客" | Phase 1 Step 1-02, 生成SEO文章 |
| "生成本周Pinterest文案" | Phase 2 Step 2-01 |
| "生成本周Instagram文案" | Phase 2 Step 2-02 |
| "写EDM邮件" | Phase 3 Step 3-03 |
| "新品上架 [产品描述]" | Phase 5 Step 5-01 全流程 |
| "生成周报" | Phase 6 Step 6-01 |
| "月度复盘" | Phase 6 Step 6-02 |
| "优化产品页 [id]" | Phase 4 Step 4-02 |
| "部署" | Build + Vercel deploy |

---

## 十七、核心原则

1. **内容先行, 广告后补**: SEO 和 Pinterest 是免费流量, 先验证产品有人要, 再花钱放量
2. **询盘质量 > 数量**: 宁可少而精的询盘, 不要大量无效流量
3. **复利思维**: 每篇博客文章是长期资产, 持续带来搜索流量
4. **数据驱动**: 每周看数据, 做得好的加倍, 做得差的砍掉
5. **人机分工明确**: Qoder 负责内容生产+技术执行, 人负责决策+客户沟通+供应链
