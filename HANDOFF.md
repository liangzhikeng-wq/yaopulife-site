# yaopulife.com · 接力 HANDOFF（2026-06-27 · 视觉体系 + 体验增强层 + 视觉生产系统）

> 新窗口冷启动先读本文件 + memory（自动加载）。工作目录 `~/yaopuqoder/yaopulife-site`（Astro + Tailwind + Vercel，**别迁 Next**；CLI 已登录 yaopulife-2093，`vercel --prod --yes` 直接部署，无需 token）。站 CSS=`public/yaopu.css`，JS=`public/yaopu.js`。故事页是**独立 HTML .astro**（各自带 `<head>`，不走 Layout.astro）。

## 0. 定位
yaopulife 耀蒲 · `Authentic · by a native` / `China's stories, told the way they're meant to be told`。英文讲中国神话/生肖/节日/文化，面向对中国文化好奇的全球用户。

## 1. 当前线上状态（全部已部署 + 验证）
- **内容**：首页 + 8 篇神话长文（`/wukong` 旗舰、`/changge`、`/nezha`、`/houyi`、`/jingwei`、`/xingtian`、`/whitesnake`、`/shanhaijing`）+ 3 hub（`/myths /zodiac /festivals`）+ about/contact/terms。全 HTTP 200，JSON-LD（Article/Breadcrumb/Organization/WebSite）齐，sitemap.xml 干净。6 篇暗黑奇幻文案按《中国神话海外化 SOP》写。
- **视觉锤系统**（public/yaopu.css + yaopu.js）：SealMark 蒲印盖章 / Living Hanzi 巨幕汉字 / Fate Thread 命运红线进度 / Native Note 玉绿注释卡（`--jade`）/ 旗舰组件（人物卡 charcard / 时间线 / 汉字拼音表 glossary / 互动 quiz）。
- **主视觉 = 立意扁平插画（决策 A：图进站的扁平编辑体系）**：`/wukong`（压顶独峰·渺小猴·朱砂日）+ `/changge`（孤月·飘身奔月·朱砂思念线）的 `.story-hero.illus` 内联 SVG，`fill=var(--品牌色)`，与站**同一视觉体系**；魂靠立意+留白+一点朱砂（非笔触）。
  - ⚠️**待铺**：`/nezha /houyi /jingwei /xingtian /whitesnake` 仍是旧 `living-hanzi` hero，需补**同款立意扁平 hero 插画**（每个的魂见 `docs/visual-soul-principles.md`：哪吒莲花重生 / 后羿空弓对远月 / 精卫苍海一鸟 / 刑天无头舞干戚 / 白蛇塔下烟雨）。
- **体验增强层**（渐进增强，无 JS / `prefers-reduced-motion` 内容全显，零外部库）：① 滚动揭幕（IntersectionObserver）② 销名微互动（`/wukong` 生死簿，点名字朱砂划掉揭 payoff）③ 章节微互动（`/changge` 奔月拖动 · `/houyi` 射日点射熄日 · `/jingwei` 填海点击投石）④ 命运红线脊（桌面竖向红线 + 章节结跳转，随滚动填充）⑤ 古琴点睛（Web Audio 合成拨弦，**默认关**，右下 ♪ 开关，一章一声）。**全部真机点击验证过**。

## 2. 视觉生产系统（本窗新建 · 底层标准）
画法定论 = **New Chinese Healing Narrative Illustration 新中式治愈萌趣叙事插画** = 东方留白 + 萌趣角色 + 水墨笔触 + 文化符号 + 情绪叙事 + 海外可理解。
- **tokens**：`src/styles/tokens.css`（`--color-*` 规范源）+ `public/yaopu.css :root`（增量同步，全站可用）+ `tailwind.config.js`（`yaopu.*` 色组）。**现网 `--paper/--ink/--cinnabar/--jade/--gold` 等一律保留不动**（尊重现网稳定）。
- **docs/brand/**：illustration-system · claude-design-prompts · yaopu-agent-illustration-workflow · illustration-metadata-schema.json · brand-visual-upgrade-summary（交付总结+色板映射表）。
- **prompts/illustration/**：master-style · zodiac(12) · myths(6) · festivals(6) · social-card · knowledge-card · batch-prompts。
- **src/config/**：illustration-style.ts（JSON 化风格）· illustration-prompts.ts（24 条自包含 prompt）。

## 3. 工具栈 / 关键避坑
- **生图 = 本地 ComfyUI**（~/Documents/ComfyUI 在跑 127.0.0.1:8188；客户端 `~/Documents/多智能体协作系统/tools/comfyui/comfy_client.py`：`build_sdxl_txt2img`+`generate`；SDXL base 出水墨/极简，24s/张零成本；无水墨 LoRA）。视觉方向几经反复**最终定 A（扁平 SVG 立意进站体系）**；萌系/写实水墨留作**社媒**非站主视觉。来龙去脉见 `docs/visual-soul-principles.md` + `docs/creative-web-playbook.md`。
- **Astro 陷阱**：模板里 `{` = JS 表达式，JSON-LD 必须 frontmatter `const ld={...}` + `set:html={JSON.stringify(ld)}`，**别在正文写裸 JSON**。
- **手机端**：headless 截图 device-width 默认 = 485（非 390）是**伪影**，真机正常；已修 `.moon`/`.living-hanzi` 负偏移 + `overflow-x:hidden` + `min-width:0` 硬化。
- 部署=对外但**该站用户已授权**；真实收入仍 $0；开号/收款/投稿 = 用户红线。

## 4. 续上候选（用户未拍板，等指令）
1. 用生产系统 + 本地 ComfyUI **真出首批资产**（如 zodiac-tiger / myth-change / festival-mid-autumn）走通「配置→生图→10项评分→入库」全链路样板。
2. 给剩余 5 个故事页补**同款立意扁平 hero 插画**（决策 A，补齐全站 7 故事页统一体系）。
3. 体验增强层节奏再打磨（奔月加月光渐亮/射日加箭矢飞射），或推全站。
4. 用 playbook 做完整 **scrollytelling 体验**（命运红线脊串叙事）。

## 5. 硬性
① 工具调用用正确结构化格式（带 antml 前缀），绝不写裸 call/invoke。② 声称"已部署/已验证"前**必须先看到工具返回结果**。③ 改完 `npm run build` + `vercel --prod --yes` + curl/截图验证（含手机端）。④ 汇报推飞书 `~/Documents/多智能体协作系统` 的 `scripts/feishu/report.py`（`PYTHONPATH=. .venv/bin/python` 调 `send_report`）。⑤ 默认简体中文，产品本体英文。
