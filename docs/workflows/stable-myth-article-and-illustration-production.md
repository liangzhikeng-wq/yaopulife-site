# 稳定生产主流程 · Stable Myth Article & Illustration Production

> yaopulife 不靠 AI 随机出图，靠这条**固定顺序**的流水线稳定产出原创内容与视觉资产。**关键：不要自由发挥，每次都按序走。**

```
理解神话 → 故事圣经 → 文章 → 视觉简报 → 读视觉圣经 → 线稿 → 上色 → 质检 → 入库 → 复用
```

## 12 步
1. **Select Myth Topic** — 从 `docs/mythology/mythology-ontology.md` 选主题。
2. **Generate Story Bible** — 按 `story-bible-template.md` 生成 `docs/mythology/story-bibles/<id>.json`（类型/冲突/文化意义/情绪/视觉潜力）。
3. **Write Article** — Claude 依 Story Bible 写原创英文文章（不得脱离 Story Bible）。
4. **Generate Visual Brief** — 文章完成后产出 Visual Brief（`article-to-visual-brief.md`），提取最该画的一幕。
5. **Load Visual Bible** — 读 `docs/visual-bible/.../<id>.json` 的 shape/spirit anchors + forbidden。
6. **Generate Lineart Prompt** — 用 compiler 出**工笔白描线稿** prompt。
7. **Generate Master Lineart** — 出线稿，**先检查形似**（QA 形似分）。形似不过 → 重出线稿。
8. **Apply Color Prompt** — 线稿过后，以线稿为底（img2img 控型）按品牌色设色。
9. **Add Scene Symbols** — 加 1–3 个文化符号（不超 3）。
10. **Quality Check** — 神似/形似双重打分（`visual-quality-check.md`）。
11. **Approve & Archive** — ≥90 入 `assets/approved/`，写 `*.meta.json`，回填 visual bible 的 `master_lineart_assets`。
12. **Reuse** — 后续同对象**优先引用 approved assets** 作为生成锚点（控型/参考），越往后越稳。

## 不变铁律
- 每张图只表达**一个核心情绪**；最多 **1–3 个文化符号**。
- 必须保留视觉圣经里的**不可变锚点**（shape/spirit/signature）。
- 任何"已完成"都以**真出图 + 质检通过**为准，不得用占位冒充。
- 产图引擎现状见 `docs/brand/gongbi-lineart-master-system.md` 第 4 节（工笔白描需专属 LoRA，待训练；临时用水墨写意兜底）。

## 最小闭环（先做样板）
先用**孙悟空 1 个对象**走通全 12 步（已建 story bible + visual bible），验证链路与产图地基，再复制到其余 5 个核心对象（嫦娥/哪吒/后羿/白蛇/中国龙），最后扩展到生肖/山海经/节日。
```
```
