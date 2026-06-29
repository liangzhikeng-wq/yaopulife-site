# Yaopu Agent OS 稳定产图 SOP

> 数字员工产出 yaopulife 统一风格插画的标准作业流程。配置见 `src/config/illustration-style.ts`,prompt 库见 `prompts/illustration/`,元数据 schema 见 `docs/brand/illustration-metadata-schema.json`。

## Step 1 · Receive Task
识别:`series`(zodiac/myths/festivals/social-card/knowledge-card) · `topic`(具体主题) · `audience` · `emotion`(核心情绪) · `format`(比例+场景) · `language`(中/英/双语)。

## Step 2 · Select Template
从五构图模板选一:`central-character` / `moon-gate` / `one-line-small-world` / `ink-animal-persona` / `editorial-story-cover`。

## Step 3 · Build Image Plan
输出画面计划:
```json
{
  "subject": "",
  "emotion": "",
  "composition": "",
  "symbols": [],
  "palette": [],
  "caption_en": "",
  "caption_zh": "",
  "visual_focus": "",
  "avoid": []
}
```

## Step 4 · Generate Claude Design Prompt
把画面计划转成英文 prompt(母版见 `prompts/illustration/master-style.md`)。必须含:brand context · subject · story theme · emotion · symbols · composition · palette · linework · background · usage · avoid list。

## Step 5 · Quality Check(10 项评分)
1. subject clarity 2. emotional clarity 3. brand consistency 4. cultural authenticity 5. global readability 6. negative space quality 7. palette restraint 8. linework quality 9. series consistency 10. social media usefulness。

**评分规则**:≥9 → approved;8–8.9 → minor revision;<8 → regenerate;<7 → 重做 image plan。

## Step 6 · Record Metadata
按 `illustration-metadata-schema.json` 落库(id/title/series/topic/subject/emotion/symbols/palette/aspect_ratio/prompt/caption/quality_score/status)。

## 红线
- 仅产建议/草图,**上架/对外发布/动钱=人审**(沿用 OS 既有红线)。
- 不模仿具体博主/画师/影视游戏 IP;不堆中国元素;先情绪后文化。
