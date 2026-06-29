# Prompt Compiler · Visual Brief → Image Prompt

> 把 Visual Brief（`docs/workflows/article-to-visual-brief.md` 产出）+ 对应 Visual Bible，自动编译成 Claude Design / ComfyUI 的产图 prompt。

## 编译规则
Prompt 必须按顺序包含 11 块：
1. brand context
2. story context
3. subject identity（来自 visual bible `identity_summary`）
4. shape anchors（visual bible `shape_anchors`，**必须保留**）
5. spirit anchors（visual bible `spirit_anchors`，**必须保留**）
6. core emotion（visual brief `core_emotion`）
7. cultural symbols（1–3 个，visual brief `cultural_symbols`）
8. composition（visual brief `composition_template`）
9. linework / style（工笔白描，见 `docs/brand/gongbi-lineart-master-system.md`）
10. color palette（yaopulife 品牌色）
11. negative constraints + originality（visual bible `negative_constraints` + 原创政策）

**禁止**：具名在世艺术家的 "in the style of"（见 `originality-policy.md`）。

## 通用模板
```text
Create an original illustration for yaopulife.com.

Brand context:
yaopulife tells authentic Chinese myths, zodiac, festivals and cultural stories for global readers.

Story context:
{{story_context}}

Subject:
{{main_visual_subject}}

Identity:
{{identity_summary}}

Shape anchors that must be preserved:
{{shape_anchors}}

Spirit anchors that must be preserved:
{{spirit_anchors}}

Core emotion:
{{core_emotion}}

Cultural symbols (1-3 only):
{{cultural_symbols}}

Composition:
{{composition_template}}

Style:
New Chinese Gongbi Linework Healing Narrative Illustration.
Refined Chinese gongbi-inspired baimiao linework as the structural drawing layer,
warm rice paper texture, restrained ink, large negative space, yaopulife brand colors.

Palette:
Warm paper background, deep ink linework, cinnabar red accent, optional jade green or muted moon gold.

Originality:
Original design from cultural understanding and the provided visual identity anchors.
Do NOT imitate any existing artist, influencer, film, anime, game, illustration, or online artwork.

Avoid:
{{negative_constraints}}
```

## 两段式产图（工笔流程）
1. **线稿 prompt**：上模板 + 强调 "baimiao white-outline line art only, monochrome ink lines, no color fill"。
2. **设色 prompt**：线稿过形似后，再以线稿为底（img2img 控型）+ "apply yaopulife palette, restrained color, keep the linework"。
- 实现：本地 ComfyUI（专属工笔白描 LoRA 到位后接入；详见 gongbi 规范第 4 节）。
