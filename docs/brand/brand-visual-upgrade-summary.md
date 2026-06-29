# yaopulife 品牌视觉升级 · 交付总结

> 本次落地的是 **yaopulife.com 视觉生产基础设施**:tokens + 文档 + prompt 库 + JSON/TS 配置 + 首批资产清单。后续所有视觉内容、Claude Design 生图、Yaopu Agent OS 数字员工作画都以此为底层标准。

## 1. 修改的文件
- `public/yaopu.css` — `:root` **追加** `--color-*` 品牌 token + radius/shadow/border(现有 `--paper` 等**一律保留不动**)。
- `tailwind.config.js` — `colors` **新增** `yaopu.*` 品牌色组(旧 `brand.*` 保留)。

## 2. 新增的文件
- `src/styles/tokens.css`(规范 token 源)
- `docs/brand/`:`illustration-system.md` · `claude-design-prompts.md` · `yaopu-agent-illustration-workflow.md` · `illustration-metadata-schema.json` · 本文件
- `prompts/illustration/`:`master-style.md` · `zodiac.md` · `myths.md` · `festivals.md` · `social-card.md` · `knowledge-card.md` · `batch-prompts.md`
- `src/config/`:`illustration-style.ts` · `illustration-prompts.ts`

## 3. 提取到的现有颜色 token(权威=`public/yaopu.css :root`)
`--paper #F4F1E8` · `--surface #FCFAF4` · `--ink #241E17` · `--ink2 #736A5C` · `--ink3 #9C9384` · `--clay #BE5E38` · `--clayd #974428` · `--claybg #F1E1D4` · `--cinnabar #A6362A` · `--gold #B0904D` · `--bd #E7DECC` · `--jade #2F6F5E` · `--jaded #235446` · `--jadebg #E6EFEA`。

## 4. 保留的现有颜色
**全部保留**。现网这套暖宣纸+陶土橙+朱砂+玉绿+暗金已上线稳定、构成品牌识别(尊重现网稳定识别优先级)。本次不改任何现有色值,避免线上视觉漂移。

## 5. 新增的品牌 token(`--color-*`,生产系统规范)
| token | hex | ≈ 现网对应 |
|---|---|---|
| `--color-paper` | #F7F1E8 | --paper #F4F1E8 |
| `--color-warm-paper` | #EFE6D8 | (新)暖米白 |
| `--color-mist` | #D8CEC0 | (新)浅雾灰 |
| `--color-ink-light` | #8C8377 | --ink3/--ink2 之间 |
| `--color-ink` | #2F2A26 | --ink #241E17 |
| `--color-deep-ink` | #1D1A17 | (更深) |
| `--color-cinnabar` | #B6432A | --cinnabar #A6362A |
| `--color-vermilion-light` | #C95A3C | --clay #BE5E38 |
| `--color-jade` | #6F8F85 | --jade #2F6F5E(新更柔) |
| `--color-bamboo-green` | #829B6E | (新)竹青 |
| `--color-moon-gold` | #C9A96B | --gold #B0904D |
| 功能色 | success/warning/error/info | (新) |
| radius/shadow/border | card24/btn999/soft 阴影 | (新)结构 token |

两套同源(暖纸/墨/朱砂/玉/月金)。**策略**:现有页面继续用 `--paper` 等;**新组件/新插画统一用 `--color-*`**;未来可做一次对齐 pass 把 `--paper` 等渐进迁到 `--color-*` 值(非本次,避免线上漂移)。

## 6. 插画系统怎么用
读 `docs/brand/illustration-system.md`:定位 / 8 原则 / 5 构图模板 / 线条 / 4 主色 / 符号库(1–3个) / 三类画法。融合画法=东方留白+萌趣角色+水墨笔触+文化符号+情绪叙事+海外可理解。

## 7. Claude Design 怎么调用
`docs/brand/claude-design-prompts.md` 或 `prompts/illustration/master-style.md` 取母版提示词;变量场景用 `social-card.md` / `knowledge-card.md` 的 `{{变量}}` 模板。

## 8. Yaopu Agent OS 怎么调用
`docs/brand/yaopu-agent-illustration-workflow.md` 六步 SOP + `src/config/illustration-style.ts`(JSON 化风格/调色板/构图模板/符号库/avoid)+ `src/config/illustration-prompts.ts`(24 条结构化 prompt)+ `illustration-metadata-schema.json`(落库)。

## 9. 首批 prompt 落地情况
**已完整落地**:12 生肖 + 6 神话 + 6 节日 = 24 条,见 `prompts/illustration/{zodiac,myths,festivals}.md` 与 `src/config/illustration-prompts.ts`。

## 10. 后续如何扩展
新增系列(山海经异兽/二十四节气/汉字/茶/功夫…)= 复制构图模板 + 填符号 + 走 SOP 评分 ≥9 入库;沉淀进 `illustration-prompts.ts` 与 metadata,数字员工即可稳定批量产。

## 验收(自检)
品牌:一眼是 yaopulife 中国文化站 / 海外可理解 / 真实温暖有故事 / 避廉价国潮与 AI 感。
视觉:统一色板 ✓ 统一画法规范 ✓ 构图模板 ✓ 符号限制 ✓ 留白规则 ✓。
系统:design tokens ✓ prompt library ✓ JSON/TS 配置 ✓ metadata schema ✓ 可被数字员工稳定调用 ✓。
