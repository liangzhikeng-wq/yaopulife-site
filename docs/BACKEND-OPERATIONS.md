# yaopulife.com 后台运维与登录手册

> **项目**: yaopulife DIY 独立站 (询盘制)
> **域名**: https://yaopulife.com
> **当前部署**: codex/agent-mvp-next @ eecb212
> **文档版本**: v1.0 (2026-05-26)
> **维护**: 项目所有后台 + 配置 + Token 状态一览

---

## 0. 项目速览

| 项 | 值 |
|------|---|
| 业务模式 | 询盘制独立站 (Custom DIY Gifts) |
| 支付方式 | PayPal (单渠道, 已决策) |
| 主收款 | PayPal Business |
| 部署平台 | Vercel (aliased to yaopulife.com) |
| 代码托管 | GitHub |
| 域名注册 | Namecheap |
| DNS / CDN | Cloudflare |
| 图床 | Vercel `/public/` (R2 未启用) |
| 数据分析 | GA4 + Google Ads (AW-18170525119) |
| 邮件事务 | Resend (已验证 yaopulife.com) |
| 社媒 | Pinterest Business |
| 内容 | Markdown (`src/content/`) + Sanity 预留 |

---

## 1. 域名与 DNS

### 1.1 Namecheap (域名注册商)

| 项 | 值 |
|------|---|
| 域名 | `yaopulife.com` |
| 控制台 | https://www.namecheap.com/myaccount/login/ |
| 登录方式 | 注册邮箱 + 密码 |
| 续费 | 每年 (注意开启 auto-renew) |
| 当前状态 | NS 记录已切到 Cloudflare，不再在 Namecheap 解析 |

### 1.2 Cloudflare (DNS + CDN)

| 项 | 值 |
|------|---|
| 控制台 | https://dash.cloudflare.com/ |
| 登录方式 | 邮箱 + 密码 + 2FA (必须开) |
| Zone | `yaopulife.com` (active) |
| 自定义 NS | `lara.ns.cloudflare.com`, `greg.ns.cloudflare.com` |
| 用途 | DNS 解析 + CDN + (预留) R2 图床 + (预留) Email Routing |
| API Token 名 | `CF_API_TOKEN` |
| 权限范围 | Zone:Read, Zone Settings:Edit, DNS:Edit |
| Zone ID | `CF_ZONE_ID` |
| Token 存储 | 本地 `.env` / Vercel Environment Variables |

**测试结果 (2026-05-26)**: Zone API 200 OK, 域名 active。

### 1.3 子域名与解析

| 子域名 | 类型 | 用途 | 状态 |
|--------|------|------|------|
| `yaopulife.com` | A / CNAME | 主站 (Vercel) | OK |
| `www.yaopulife.com` | CNAME | www 重定向 | OK |
| `cdn.yaopulife.com` | CNAME → R2 | 图床 | **未启用 (NXDOMAIN)** |

---

## 2. 部署与代码

### 2.1 Vercel (部署平台)

| 项 | 值 |
|------|---|
| 控制台 | https://vercel.com/dashboard |
| 登录方式 | GitHub OAuth (推荐) 或邮箱 |
| 项目名 | `yaopulife-site` |
| Team | `yaopulife-s-projects` |
| 生产域名 | `https://yaopulife.com` |
| 当前 HEAD | `eecb212` (codex/agent-mvp-next) |
| 区域 | `iad1` (美东) |
| Runtime | Node 22 |
| 部署方式 | (a) CLI: `npx vercel --yes --prod` (b) GitHub Actions push to main |

**部署流程**:
1. 在项目根目录执行 `npx vercel --yes --prod`
2. 等待 build + deploy (约 30-50s)
3. 验证: `curl -I https://yaopulife.com` 返回 200

### 2.2 GitHub (代码托管)

| 项 | 值 |
|------|---|
| 登录方式 | 邮箱 + 密码 + 2FA / SSH Key |
| 主分支 | `main` (CI/CD 触发生产部署) |
| 当前开发分支 | `codex/agent-mvp-next` |
| 关键 Secrets | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `DEEPSEEK_API_KEY`, `SANITY_PROJECT_ID`, `SANITY_DATASET` |
| 本地 Token | `GH_TOKEN` 见密码管理器（**禁止明文写入任何文档**；2026-06-13 已撤销旧 token，需新建后再用） |
| 登录验证 (2026-05-26) | HTTP 200, login=`liangzhikeng-wq` |

### 2.3 本地开发

```bash
# 克隆代码
cd /Users/yaopulife/yaopuqoder/yaopulife-site

# 安装依赖
npm install

# 本地预览
npm run dev
# → http://localhost:4321

# 构建测试
npm run build

# 部署
npx vercel --yes --prod
```

---

## 3. 支付与收款

### 3.1 PayPal Business (唯一支付方式)

| 项 | 值 |
|------|---|
| 商家后台 | https://www.paypal.com/businessmanager |
| 登录方式 | 商家邮箱 + 密码 |
| API 凭据名 | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` |
| API 端点 | `https://api-m.paypal.com/v1/oauth2/token` (生产) |
| 收款币种 | USD |
| 凭据存储 | Vercel Environment Variables (本地 .env **没有**) |

**关键代码**: `api/payment-gateway.js` 调用 `/v1/oauth2/token` + `/v2/checkout/orders` 创建 PayPal Order

**支付流程**:
1. 用户在 `/product/{id}` 点击 "Pay Now - $XX"
2. 前端 POST `/api/payment-gateway` (gateway=paypal)
3. Server 用 Client Credentials 拿 access token
4. 创建 PayPal Order，返回 approval URL
5. 浏览器跳转到 PayPal 完成支付
6. 跳回 `/order/success` 或 `/order/cancel`

**测试结果 (2026-05-26)**: 401 `invalid_client` - **凭据无效或 Vercel 上未配置**。需登录 Vercel Dashboard 检查 `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` 是否设置。

### 3.2 Vercel 上需配置的 PayPal 环境变量

| Name | Value | 备注 |
|------|-------|------|
| `PAYPAL_CLIENT_ID` | (从 PayPal Business 后台获取) | 公开可看 |
| `PAYPAL_CLIENT_SECRET` | (从 PayPal Business 后台获取) | 私密 |
| `SITE_URL` | `https://yaopulife.com` | 用于回调 URL |

**操作步骤**:
1. 登录 https://www.paypal.com/businessmanager
2. Account Settings → API Access → API Credentials → NVP/SOAP Integration (Classic)
3. 或: Developer Dashboard (https://developer.paypal.com/dashboard/) → My Apps & Credentials → Create App
4. 复制 Client ID 和 Secret 到 Vercel Project → Settings → Environment Variables

---

## 4. 邮件与表单

### 4.1 Resend (事务邮件)

| 项 | 值 |
|------|---|
| 控制台 | https://resend.com/dashboard |
| 登录方式 | GitHub OAuth / 邮箱 |
| API Key 名 | `RESEND_API_KEY` |
| API Key 值 | `RESEND_API_KEY` 见密码管理器（**禁止明文写入任何文档**） |
| 发件邮箱 | `hello@yaopulife.com` |
| 已验证域名 | yaopulife.com (verified) |

**测试结果 (2026-05-26)**: HTTP 200, 域名 verified。
**注意**: 本地 `.env` 中 `RESEND_API_KEY=REPLACE_ME`，但 Vercel 端有真实值。

### 4.2 Formspree (联系表单兜底)

| 项 | 值 |
|------|---|
| 控制台 | https://formspree.io/forms/ |
| Form ID 名 | `FORMSPREE_FORM_ID` |
| 当前状态 | **未配置 (占位符)** |

---

## 5. 营销与社媒

### 5.1 Pinterest Business (引流主渠道)

| 项 | 值 |
|------|---|
| 商业面板 | https://business.pinterest.com/ |
| 主页 | https://www.pinterest.com/yaopulife/ |
| API 控制台 | https://developers.pinterest.com/apps/ |
| API 凭据 | `PINTEREST_ACCESS_TOKEN`, `PINTEREST_CLIENT_ID`, `PINTEREST_CLIENT_SECRET` |
| 已验证域名 | yaopulife.com (HTML + DNS 双重) |
| 当前状态 | Token 已写入 .env, 每周自动发 Pin (CI 触发) |

**测试结果 (2026-05-26)**: 网络层超时 (中国出口 IP 被 Pinterest 限速或 GFW 屏蔽), Token 本身未验证。
**建议**: 部署到美国/香港的 CI runner 上跑 Pinterest 自动化任务。

### 5.2 Klaviyo (邮件营销)

| 项 | 值 |
|------|---|
| 控制台 | https://www.klaviyo.com/account |
| 凭据 | `KLAVIYO_PUBLIC_API_KEY`, `KLAVIYO_PRIVATE_API_KEY` |
| 当前状态 | **未配置 (占位符)** |

### 5.3 Tidio (在线聊天)

| 项 | 值 |
|------|---|
| 控制台 | https://www.tidio.com/panel/ |
| 凭据 | `TIDIO_PUBLIC_KEY` |
| 当前状态 | **未配置 (占位符)** |

---

## 6. 分析与监控

### 6.1 Google Analytics 4 + Google Ads

| 项 | 值 |
|------|---|
| 媒体资源 | https://analytics.google.com/ |
| 登录方式 | Gmail 账号 |
| 跟踪 ID | `AW-18170525119` (Google Ads + GA4 共用) |
| 加载方式 | **Cookie Consent 动态注入** (`window.loadGtag`) |
| 合规 | `localStorage.cookie-consent === "accepted"` 才加载 |
| 文档化 | `src/layouts/Layout.astro` (Cookie Banner + gtag 注入) |

### 6.2 Google Search Console

| 项 | 值 |
|------|---|
| 控制台 | https://search.google.com/search-console/ |
| 登录方式 | Gmail 账号 |
| 验证 | HTML Meta `google-site-verification=gA5Bv-t6AGHXEZd_cPzaJ2qjsYBOMsIshqV5xnASEcM` |
| sitemap | `https://yaopulife.com/sitemap-index.xml` |
| 用途 | 索引监控、关键词排名、手动提交 URL |

### 6.3 IndexNow (必应收录)

| 项 | 值 |
|------|---|
| 提交 | `https://yaopulife.com/api/ping-search-engines` |
| 触发 | 部署完成后自动调用 |

---

## 7. CMS (Sanity, 预留)

| 项 | 值 |
|------|---|
| 控制台 | https://www.sanity.io/manage |
| 凭据 | `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN` |
| 当前状态 | **未启用 (占位符)**, Schema 已建但 Project ID 未配置 |
| 当前内容 | 全部用 Markdown 写在 `src/content/products/` (16 个产品) + `src/content/blog/` (11 篇博客) |

**决策建议**: 短期内不启用 Sanity, Markdown 工作流足够。

---

## 8. 供应链

### 8.1 1688 (供应商采购)

| 项 | 值 |
|------|---|
| 商家中心 | https://work.1688.com/ |
| 登录方式 | 1688 账号 + 阿里 APP 扫码 |
| 运营文档 | `yaopulife-site/1688-SUPPLIER-TRACKER.md` |
| 模式 | 客户下单 → 1688 代发 → 国际物流 → 客户 |

---

## 9. 公司信息 (合规公开)

| 项 | 值 |
|------|---|
| 公司中英文 | 玉林市瑶普商贸有限公司 / Dongguan Yaopu Commercial Co., Ltd. |
| 对外邮箱 | `hello@yaopulife.com` |
| 私人邮箱 | `liangzhikeng@163.com` |
| 公司地址 | No. 267, Yubei Avenue, Yuzhou District, Yulin City, Guangxi |

---

## 10. Token 状态测试报告 (2026-05-26)

| Token / 服务 | 测试方式 | HTTP | 结论 | 备注 |
|--------------|----------|------|------|------|
| Cloudflare Zone (DNS) | `GET /zones/{id}` | 200 | **有效** | yaopulife.com active |
| Cloudflare User API | `GET /user` | 403 | 权限不足 | Token 缺少 user:read, 不影响业务 |
| Resend | `GET /domains` | 200 | **有效** | yaopulife.com verified |
| Pinterest User | `GET /v5/user_account` | timeout | **未验证** | 网络层超时 (GFW), Token 状态未知 |
| Pinterest Boards | `GET /v5/boards` | timeout | **未验证** | 同上 |
| GitHub Token | `GET /user` | 200 | **有效** | login=`liangzhikeng-wq` |
| Vercel Production | `GET /` `/shop` `/privacy` | 200 | **有效** | 全部在线 |
| PayPal (生产) | `POST /oauth2/token` | 401 | **凭据无效** | invalid_client, Vercel 上可能未配或配错 |
| R2 / cdn.yaopulife.com | `GET /` | NXDOMAIN | **未启用** | DNS 未配置, 实际图片走 Vercel |
| Sanity | - | - | **未配置** | Project ID = REPLACE_ME |

### 10.1 紧急修复清单

1. **PayPal 凭据 (高优)**: 登录 Vercel Dashboard → yaopulife-site → Settings → Environment Variables → 检查 `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` 是否设置且有效
2. **Pinterest 网络 (中优)**: Pinterest 自动化任务在 CI 中通过非中国 IP 出口执行
3. **R2 (低优)**: 当前未启用, 不影响业务, 未来需要时再配置 cdn.yaopulife.com CNAME

---

## 11. 公司内部运营文件

| 文档 | 路径 |
|------|------|
| 选品追踪表 | `yaopulife-site/PRODUCT-SELECTION-TRACKER.md` |
| 供应商追踪 | `yaopulife-site/1688-SUPPLIER-TRACKER.md` |
| 选品 SOP | `yaopulife-site/SELECTION-WORKFLOW.md` |
| 关键词库 | `yaopulife-site/SEO-KEYWORDS.md` |
| SEO 执行清单 | `yaopulife-site/SEO-EXECUTION-CHECKLIST.md` |
| 部署指南 | `yaopulife-site/DEPLOY.md` |
| 支付配置 (历史) | `yaopulife-site/docs/PAYMENT-SETUP.md` |
| Agent 注册表 | `yaopulife-site/agents/agent-registry.json` (17 个 Agent) |
| 自动运营 CI | `.github/workflows/qoder-weekly.yml` (每周一 09:00 CST) |
| 博客列表 | `yaopulife-site/src/content/blog/*.md` (11 篇) |
| 产品列表 | `yaopulife-site/src/content/products/*.md` (16 个) |

---

## 12. 完整线上页面 URL 速查

| 路径 | 用途 |
|------|------|
| `/` | 首页 |
| `/shop` | 产品列表 |
| `/product/{1-20}` | 产品详情 |
| `/blog` | 博客列表 |
| `/blog/{slug}` | 博客详情 (11 篇) |
| `/how-it-works` | 定制流程 |
| `/about` | 关于我们 |
| `/contact` | 联系我们 (Formspree 兜底) |
| `/privacy` | 隐私政策 (合规版) |
| `/terms-of-service` | 服务条款 |
| `/shipping-and-returns` | 物流与退换 |
| `/order/success` | 支付成功页 |
| `/order/cancel` | 支付取消页 |
| `/sitemap-index.xml` | Sitemap |
| `/robots.txt` | 爬虫规则 |

---

## 13. 快速排障

| 现象 | 第一步检查 |
|------|-----------|
| 主页 404 | Vercel Dashboard → Deployments → 最新部署状态 |
| 支付按钮 401 | Vercel env 是否有 PayPal 凭据 |
| 邮件没收到 | Resend Dashboard → Logs |
| Pinterest 自动发失败 | 网络层: 改用海外 IP runner 跑 |
| 隐私页没更新 | `git log --oneline -1 src/pages/privacy.astro`, 然后 `npx vercel --yes --prod` |
| 图床 404 | 当前图片走 Vercel `/public/`, R2 未启用, 检查 `public/products/` |

---

## 14. 安全与备份建议

1. **所有 16 个 SaaS 账号必须开 2FA** (Vercel / Cloudflare / GitHub / Namecheap / PayPal / Pinterest / Resend 等)
2. **Token 轮换周期**: PayPal / Resend / Pinterest / GitHub **每季度一次**
3. **不要把 .env 明文传到网盘**; 用 1Password / Bitwarden 加密保存
4. **每周 git push 到 GitHub** = 自动异地备份
5. **Vercel 部署历史保留**, 任何回滚都在 Vercel Dashboard 一键完成

---

## 15. 当前决策记录

- **支付方式**: PayPal 单渠道 (Stripe 已废弃)
- **图片托管**: Vercel `/public/` (R2 暂不启用)
- **CMS**: Markdown (Sanity 长期预留, 短期不启用)
- **追踪代码**: Google Ads `AW-18170525119` + GA4 合规版, Cookie Consent 动态注入
- **Pinterest 自动化**: 每周一 09:00 CST 自动发 Pin

---

> 文档维护: 每次后台或配置变更后, 同步更新本文档对应章节, 并提交到 `codex/agent-mvp-next` 分支。
