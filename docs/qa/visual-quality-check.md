# 神似 / 形似双重质检 · Visual Quality Check

> 每张图生成后按 100 分质检，回写进资产 `*.meta.json`。不合格不入库。

## 形似分（50）
| 项 | 分 | 看什么 |
|---|---|---|
| Silhouette accuracy 轮廓 | 10 | 剪影是否对（如悟空必须是猴非人非兽战士） |
| Structure accuracy 结构 | 10 | 比例/骨架/透视是否准 |
| Facial / feature consistency 五官 | 10 | 面部与视觉圣经 facial_anchors 一致 |
| Costume / object accuracy 服饰道具 | 10 | 服饰/道具结构对（如龙舟非西船、月饼非西饼） |
| Signature symbol accuracy 标志符号 | 10 | signature_symbols 在且画对（金箍棒/混天绫等） |

## 神似分（50）
| 项 | 分 | 看什么 |
|---|---|---|
| Emotional accuracy 情绪 | 10 | 情绪与 story bible emotional_tone 一致 |
| Personality accuracy 性格 | 10 | 气质对（悟空defiant、嫦娥distant longing） |
| Narrative alignment 叙事 | 10 | 切合文章/visual brief 的那一幕 |
| Cultural authenticity 文化 | 10 | 中国语境正确，无误读 |
| Atmospheric consistency 气质 | 10 | 与 yaopulife 品牌气质一致 |

## 通过标准
```
90-100  → approved asset（入库）
80-89   → minor revision（小修）
70-79   → regenerate from same brief（同简报重出）
< 70    → rewrite visual brief or visual bible（回上游）
```

## 不合格的回退路线（关键）
- **形似低** → 回**线稿阶段**（重出 lineart master，先锁形）。
- **神似低** → 回 **Story Bible / Visual Brief**（内核没抓对）。
- **品牌不一致** → 回**配色 / 构图**。
- **原创性不足** → 重做**设计方向**（见 `originality-policy.md`）。

## 回写
每次质检结果写入对应 `assets/approved/.../<asset>.meta.json` 的 `shape_score`/`spirit_score`/`brand_score`/`approved`/`notes`。
