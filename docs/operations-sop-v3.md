# yaopulife DIY 独立站运营 SOP V3.0
**版本**: 3.0 | **主导引擎**: Qoder | **适用项目**: yaopulife.com | **目标市场**: 北美/欧洲

---

## 一、项目现状总览（截至 2026-05-16）

### 1.1 已完成清单

| 阶段 | 状态 | 详情 |
|------|------|------|
| S1 赛道研究 | **已完成** | 选定 DIY 定制礼品赛道（宠物肖像/手工刺绣/月球灯/树脂艺术/木刻），目标市场北美 |
| S2 选品供应链 | **已完成** | 10 款 SKU 就绪，40 张 AI 产品图生成完毕，1688 供应商待确认 |
| S3 建站体验 | **已完成** | Astro v5 + Tailwind v3，26 页（含 10 产品 + 8 博客），已部署 Vercel |
| S4 营销准备 | **进行中** | Pinterest 账号已建（待发布 Pin），GSC 已验证，IndexNow 已提交 |
| S5 上线运营 | **进行中** | 站点上线，博客 8 篇，Pinterest Week1-2 文案就绪，Edge Function 就绪 |
| 内容日历 | **进行中** | 每周 2 篇博客 + 10 条 Pinterest Pin 已建立节奏 |
| SEO 基础设施 | **已完成** | Schema.org / OG / Sitemap / robots.txt / IndexNow / GSC |
| Pinterest 验证 | **已完成** | HTML meta tag + DNS TXT 记录均已添加 |

### 1.2 关键缺失（需立即补全）

| 缺失项 | 优先级 | 阻塞内容 |
|--------|--------|----------|
| Pinterest Pin 发布 | **P0** | 无法获取 Pinterest 免费流量 |
| Resend 邮件系统 | **P0** | 表单提交无自动回复/通知 |
| Tidio 客服系统 | **P1** | 无实时客服，流失潜在客户 |
| Sanity CMS 接入 | **P2** | 产品/博客内容硬编码，无法协作 |
| Klaviyo 邮件营销 | **P2** | 无法做邮件订阅/自动化流 |
| 供应商确认报价单 | **P1** | 无法给客户准确报价/工期 |
| 物流方案文档 | **P1** | 无法给客户准确运费/时效 |

### 1.3 商业模式

```
询盘制（非购物车电商）:
用户浏览产品 → 提交定制需求(表单/聊天) → 人工沟通确认方案
→ 发送收款链接(PayPal) → 付款 → 1688供应商制作
→ 质检 → 国际物流发货 → 售后跟进

月目标: 5+ 询盘 → 2+ 成交
```

---

## 二、Qoder 角色配置

Qoder 在本项目担任以下角色：

| Qoder 角色 | 职责 | 执行范围 |
|------------|------|----------|
| **内容引擎** | SEO 博客文章、Pinterest Pin 文案、Instagram 文案、EDM 邮件 | 全部内容生产 |
| **技术执行** | 网站开发/部署/SEO 优化/CI/CD | 代码改动 + Vercel 部署 |
| **数据监控** | 周报/月报/排名追踪/流量分析 | GitHub Actions 自动执行 |
| **运营协调** | 派发 OpenClaw 生图任务、提交 IndexNow、监控异常 | 人工触发 |

**Qoder 不可替代的工作（需人工）：**
- 供应商报价谈判
- 客户询盘回复
- 物流发货操作
- Pinterest 账号操作发布
- 广告投放操作

---

## 三、执行阶段与验收标准

### S1-S2：冷启动（已完成，跳过）

> 已完成。10 款 SKU，40 张 AI 产品图，供应链方向明确。

---

### S3：建站（已完成，跳过）

> 已完成。Astro v5，26 页，Vercel 部署完毕。

---

### S4：营销准备

**目标**：Pinterest + SEO + 邮件系统全部就绪

#### S4.01：Pinterest Pin 发布（本周执行）

| 任务 | 执行方 | 说明 |
|------|--------|------|
| 创建 5 个 Board | **人工** | Custom Pet Portraits / Personalized Gifts / Handmade Home Decor / Gift Ideas & Guides / Father's Day Gifts 2026 |
| 发布 Week1 10条 Pin | **人工** | 按 `content/social/pinterest/week-01.md` 执行，图片用网站产品图 |
| 发布 Week2 10条 Pin | **人工** | 按 `content/social/pinterest/week-02.md` 执行 |

**Pin 图片 URL 格式**: `https://yaopulife.com/products/[category]/[filename].jpg`

**验收**：发布后截图确认，Qoder 检查 Rich Pin 是否被识别。

#### S4.02：邮件系统（本周执行）

| 任务 | 执行方 | 说明 |
|------|--------|------|
| 注册 Resend | **人工** | resend.com，验证 yaopulife.com 域名 |
| 配置 /api/contact | **Qoder** | Edge Function 处理表单提交，发送通知邮件 |
| 创建询盘确认邮件 | **Qoder** | 自动回复给客户（确认收到 + 定制流程说明） |
| 创建询盘通知邮件 | **Qoder** | 通知到你的邮箱（含客户需求详情） |

**当前表单**（contact.astro）：已有 name / email / message 字段

**下一步优化**：添加 product_interest / requirements / budget 选择字段（Qoder 执行）

#### S4.03：客服系统（本周执行）

| 任务 | 执行方 | 说明 |
|------|--------|------|
| 注册 Tidio | **人工** | tidio.com |
| 安装脚本到网站 | **Qoder** | Layout.astro 已预留位置，填入 Public Key |
| 配置 FAQ 自动回复 | **Qoder** | 生成 20 个常见问题脚本 |
| 设置离线自动回复 | **人工** | Tidio 后台配置 |

**Qoder 生成的 FAQ 知识库**：

```
触发词 → 回复模板
"how much" / "price" / "cost" → 回复产品价格范围 + 产品页链接
"shipping" / "delivery" / "time" → 回复物流信息（5-15 days, $8+）
"custom" / "personalize" → 回复定制流程 + 引导到表单
"return" / "refund" → 回复退换政策 + 联系邮箱
"track" / "order" → 请求订单号 + 转人工
其他 → FAQ 匹配，无匹配则转人工
```

#### S4.04：GSC 站点地图提交

| 任务 | 执行方 | 说明 |
|------|--------|------|
| GSC 提交 sitemap | **人工** | GSC → 站点地图 → 输入 `https://yaopulife.com/sitemap-index.xml` |
| 等待 Google 爬取 | 自动 | 通常 1-3 天 |

**验收**：GSC → 编制索引 → 网页，查看已编入索引页面数增长。

---

### S5：运营启动

**目标**：站点持续产出内容，流量稳步增长，收到首批询盘

#### S5.01：内容节奏（Qoder 执行，人工触发）

| 任务 | 频率 | 产出 |
|------|------|------|
| SEO 博客文章 | **每周 2 篇** | `src/content/blog/[slug].md` |
| Pinterest Pin 文案 | **每周 10 条** | `content/social/pinterest/week-[N].md` |
| Instagram 文案 | **每周 3 条** | `content/social/instagram/week-[N].md` |
| EDM Campaign 文案 | **每周 1 封** | `content/edm/campaigns/week-[N].md` |

**博客文章规范**：
```
结构：引言(100词) + H2段落×3-5(各300-400词) + 产品推荐(2-3个链接) + 结论+CTA
字数：>= 1500词
内链：2-3个（链向产品页或已有博客）
图片：使用产品图或 AI 生成配图
关键词：1个核心词 + 3-5个长尾词
分类：gift-guides / diy-inspiration / product-care / behind-the-scenes
```

**内容方向轮换**（每月）：
- 第1周：Gift Guide（礼品指南）
- 第2周：Comparison（对比评测）
- 第3周：How-to / DIY（教程指南）
- 第4周：Behind the Scenes（幕后故事）

#### S5.02：IndexNow 提交（Qoder 执行）

每次新增页面后，Qoder 自动提交到 IndexNow：
```bash
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{"host":"yaopulife.com","key":"yaopulife2026indexnow","keyLocation":"https://yaopulife.com/yaopulife2026indexnow.txt","urlList":["新URL"]}'
```

**验收**：返回 HTTP 200/202。

#### S5.03：每周运营动作（Qoder 触发节点）

| 时间 | Qoder 动作 |
|------|-----------|
| 每周一 | 生成上周数据报告（流量/访客/页面表现） |
| 每周一 | 提交新增 URL 到 IndexNow |
| 每周三 | 完成 2 篇新博客 + 部署 |
| 每周五 | 生成下周 Pinterest 文案 |
| 每月 1 日 | 月度复盘 + 下月内容计划 |

#### S5.04：数据监控（GitHub Actions 自动）

配置 GitHub Actions 每周自动执行：

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
```

**监控指标**：

| 指标 | 数据源 | 告警阈值 | 行动 |
|------|--------|---------|------|
| 日访客数 | Cloudflare Analytics | 连续3日 < 10 UV | 检查爬虫/死链 |
| 页面加载 | Vercel | LCP > 4s / CLS > 0.1 | 优化图片/CDN |
| 表单提交 | Resend logs | 连续3日 = 0 | 检查表单/邮件配置 |
| 爬虫错误 | GSC | 出现新增错误 | 立即检查修复 |

---

### S6：转化优化

**目标**：访客→询盘转化率提升至 3%+

#### S6.01：产品页转化组件（Qoder 执行）

| 组件 | 状态 | 说明 |
|------|------|------|
| 信任徽章 | 待加 | "Free Design Preview / Handcrafted / Worldwide Shipping / Satisfaction Guarantee" |
| 定制流程时间线 | 待加 | "Share Idea → AI Preview(24h) → Crafting → Delivery" |
| 客户评价区 | 待加 | 接入 Sanity testimonial schema（3-5 条） |
| 相关产品推荐 | 已加 | 产品页底部"Related Articles" |
| 紧迫感元素 | 待加 | 当前工期显示（如"Current production: 10-14 days"） |

#### S6.02：表单优化（Qoder 执行）

**当前字段**：name / email / product_interest / message

**优化目标**：添加字段以提高询盘质量

| 新字段 | 类型 | 用途 |
|--------|------|------|
| 产品偏好 | 下拉多选 | 客户感兴趣的具体产品 |
| 预算范围 | 下拉 | Under $50 / $50-100 / $100-200 / $200+ |
| 紧急程度 | 下拉 | Standard(2-3 weeks) / Rush(+30%, 1 week) |
| 参考图 | 文件上传 | 客户上传参考图片 |

#### S6.03：产品页 FAQ Schema（Qoder 执行）

为产品页添加 FAQ 结构化数据，提升搜索展示：

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does production take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "10-14 days for needle felted portraits, 5-7 days for moon lamps."
      }
    },
    {
      "@type": "Question",
      "name": "Can I customize the design?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Every piece is custom-made. Share your requirements and get a free AI design preview within 24 hours."
      }
    }
  ]
}
```

---

### S7：供应链文档化

**目标**：形成可查的供应商资料和物流方案文档

#### S7.01：供应商档案（人工执行 + Qoder 整理）

| 产品 | 供应商方向 | 预估采购价 | 预估毛利 | 状态 |
|------|-----------|-----------|---------|------|
| 羊毛毡猫/狗肖像 | 1688 淘宝 | $20-25 | 60%+ | 待确认 |
| 多宠羊毛毡肖像 | 1688 | $30-35 | 60%+ | 待确认 |
| 手工刺绣肖像 | 1688 | $15-20 | 55%+ | 待确认 |
| 花卉刺绣 Hoop | 1688 | $12-15 | 55%+ | 待确认 |
| 婚礼刺绣定制 | 1688 | $18-22 | 55%+ | 待确认 |
| 月球灯（照片款） | 1688 | $12-15 | 55%+ | 待确认 |
| 月球灯（文字款） | 1688 | $10-12 | 55%+ | 待确认 |
| 海洋树脂杯垫 | 1688 | $8-10 | 50%+ | 待确认 |
| 木质名牌 | 1688 | $8-10 | 50%+ | 待确认 |
| 木质相框 | 1688 | $15-18 | 50%+ | 待确认 |

**需要补充**：实际采购价、MOQ、打样时间、大货周期、质量评分

#### S7.02：物流方案文档（Qoder 整理）

| 目的地 | 物流商 | 时效 | 估算运费 | 策略 |
|--------|--------|------|---------|------|
| 美国 | 云途/4PX | 7-15 天 | $8-12 | 满 $50 免运费 |
| 英国/欧盟 | 燕文 | 10-20 天 | $10-15 | 满 $80 免运费 |
| 加拿大/澳洲 | 云途 | 10-18 天 | $10-15 | 满 $80 免运费 |
| 其他 | 4PX | 15-30 天 | $15-20 | 实收 |

---

### S8：增长闭环

**触发条件**：周均 ≥ 5 个询盘，ROAS 已验证

#### S8.01：Pinterest 广告测试

- 起步预算：$5/天
- 推广已有高互动 Pin（互动率 > 3%）
- Qoder 职责：分析哪些 Pin 适合推广

#### S8.02：Google Ads（后期）

- 触发条件：自然流量稳定 ≥ 50 UV/天 + 询盘转化率 ≥ 2%
- 关键词：custom pet portrait / personalized gift / custom moon lamp
- 起步预算：$10/天，目标 ROAS ≥ 3

---

## 四、Qoder 指令集

| 指令 | 功能 | 触发 |
|------|------|------|
| `/deploy` | Build + 部署到 Vercel 生产 | 任意代码改动后 |
| `/new_blog [主题]` | 写 2 篇 SEO 博客文章 | 每周内容生产 |
| `/new_pinterest [数量]` | 生成 Pinterest Pin 文案 | 每周社媒生产 |
| `/new_edm [主题]` | 写 EDM Campaign 文案 | 每周邮件生产 |
| `/submit_indexnow [URL]` | 提交 URL 到 IndexNow | 新页面创建后 |
| `/weekly_report` | 生成周报 | 每周一 |
| `/monthly_review` | 月度复盘 | 每月 1 日 |
| `/product_page [id]` | 优化产品页 | 转化率分析后 |
| `/fix_contact` | 修复/优化询盘表单 | 表单异常时 |

---

## 五、流水线状态追踪

当前进度：

```
[S1] 赛道研究     ████████████ 完成
[S2] 选品供应链   ████████████ 完成
[S3] 建站体验     ████████████ 完成
[S4] 营销准备     ████████░░░░ 80% (Pinterest 验证完成，Pin 未发布，邮件待配置)
[S5] 运营启动     ████░░░░░░░░ 40% (站点上线，博客 8 篇，内容节奏建立)
[S6] 转化优化     █░░░░░░░░░░░ 10% (相关产品推荐已完成，其他待加)
[S7] 供应链文档化  █░░░░░░░░░░░ 10% (供应商方向已知，报价待确认)
[S8] 增长闭环     ░░░░░░░░░░░░ 待启动 (需 S4-S7 完成)
```

---

## 六、协作铁律

1. **Qoder 执行，人工决策**：内容生产/技术改动/数据监控由 Qoder 执行，商业决策（定价/选品/广告预算）由人工决定
2. **质量闸门不可绕过**：任何改动必须确保不破坏已有 SEO 排名和转化率
3. **每次修改可追溯**：所有变更记录到 Git 提交信息中
4. **优化不得破坏已有收益**：任何改动后验证关键指标（流量/转化率）
5. **财务安全优先**：广告投放需先验证 ROAS，再考虑加预算
6. **供应链是增长天花板**：任何扩量前必须确认供应商产能和物流方案
7. **内容复利**：每篇博客是长期资产，持续带来自然搜索流量

---

## 七、当前行动清单（按优先级）

| # | 任务 | 执行方 | 状态 |
|---|------|--------|------|
| 1 | Pinterest 发布 Week1-2 Pin | 人工 | **待执行** |
| 2 | GSC 提交 sitemap | 人工 | **待执行** |
| 3 | Resend 注册 + 邮件系统配置 | 人工 + Qoder | 待执行 |
| 4 | Tidio 注册 + FAQ 配置 | 人工 + Qoder | 待执行 |
| 5 | 供应商报价确认 | 人工 | 待执行 |
| 6 | 产品页转化组件（信任徽章/时间线） | Qoder | 待执行 |
| 7 | 表单字段优化（添加预算/紧急程度） | Qoder | 待执行 |
| 8 | 产品页 FAQ Schema | Qoder | 待执行 |