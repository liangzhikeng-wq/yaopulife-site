# 工笔白描线稿母版系统 · Gongbi Baimiao Lineart Master System

> 这是 yaopulife 视觉一致性的**结构地基**。每个核心人物 / 神兽 / 节日物件，先做**线稿母版**，再上色。线稿锁形（形似），上色锁味（神似），资产库锁稳定（越往后越不跑形）。

## 1. 为什么先做线稿母版
- AI 直接出最终彩图 = 每次形都在变（前面实测：同一角色每张不同、标志物丢失）。
- 线稿是**结构层**：先把轮廓/比例/道具/服饰结构钉死，再设色，就不会跑形。
- 母版进入 `assets/approved/`，成为后续生成的**参考锚点**（img2img / 控型 / 风格参考）。第一次靠生成，第二次靠参考，第三次靠资产库。

## 2. 每个核心对象的母版（至少 3 张）
1. **front** — 正面工笔白描线稿（结构最全，定标准）
2. **three_quarter** — 3/4 角度工笔白描线稿（转面不跑形）
3. **dynamic** — 经典动态姿态线稿（这个角色的"代表动作"）

产出并通过质检（≥90）后，路径回写进该对象 `docs/visual-bible/.../<id>.json` 的 `master_lineart_assets`。

## 3. 工笔白描风格定义（baimiao）
- refined Chinese gongbi-inspired **baimiao** white-outline drawing（白描＝纯线、不皴不染）
- clean contour，线有提按粗细、起收有笔锋，**不是匀速等宽几何线**
- delicate but **breathable**：留白充足，不堆砌密线
- warm hand-drawn ink line，不机械、不像描边滤镜
- **不是**传统名画的直接复制；是基于结构理解的原创白描
- 单色墨线为主，朱砂只用于"画眼"（印 / 关键符号），不铺色

## 4. 与产图引擎的衔接（诚实说明 · 待实测）
- 产图引擎 = 本地 ComfyUI（零成本）。客户端 `~/Documents/多智能体协作系统/tools/comfyui/comfy_client.py`。
- **稳定性现状（必须实测，不预设跑通）**：通用底模 + 通用 LoRA 出"特定角色 + 特定画法"不稳（已在水墨/线描实测验证）。工笔白描线稿的稳定性**待本对象实测**：
  - 路线 A（先试）：现有线稿 LoRA（LineAniRedmondV2 已下）+ img2img 控型 + 本规范 prompt。
  - 路线 B（A 不够稳）：下专门的**工笔/白描风 LoRA**（公共领域数据，合法）。
  - 路线 C（要长期稳定可复用）：训练 yaopulife 专属工笔白描 LoRA（公共领域古画/白描数据，合法；需云 GPU 预算，人审）。
- **铁律**：母版以"真出图 + 质检 ≥90"为准，不得用未生成的占位冒充已完成。

## 5. 命名与存储
```
assets/approved/<category>/<id>/
  <id>-lineart-front.v1.png
  <id>-lineart-3q.v1.png
  <id>-lineart-dynamic.v1.png
  <id>-color-<scene>.v1.png
  <id>-<asset>.meta.json
```
每个资产配 `*.meta.json`（见 `docs/qa/` 质检与资产库规范），记录用到的 story bible / visual bible / prompt / 形似分 / 神似分 / 是否 approved。

## 6. 流水线位置
`Story Bible → Visual Bible → 【本规范】Lineart Master → Color → QA → Approved Asset Library`。
线稿形似不过 → 回本阶段重出；神似不过 → 回 Story Bible / Visual Brief；原创性不足 → 重定设计方向。
