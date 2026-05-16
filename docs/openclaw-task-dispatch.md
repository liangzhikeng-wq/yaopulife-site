# OpenClaw 任务派发 SOP - yaopulife DIY 独立站产品图生成

## 任务概述

为 yaopulife.com 独立站生成 10 款 DIY 定制产品的商业摄影风格图片。每款产品需要 4 张图（1 主图 + 3 场景图），共计 40 张成品图。

**核心要求：严格遵循本 SOP 的质检标准，不通过质检的图片绝对不输出。**

---

## 一、输出文件夹结构

所有最终成品图统一输出到以下路径：

```
/Users/yaopulife/yaopuqoder/yaopulife-site/public/products/
├── needle-felt/          # 羊毛毡类（SKU-01~03）
│   ├── nf-cat-main.jpg
│   ├── nf-cat-scene-shelf.jpg
│   ├── nf-cat-scene-gift.jpg
│   ├── nf-cat-scene-hand.jpg
│   ├── nf-dog-main.jpg
│   ├── nf-dog-scene-shelf.jpg
│   ├── nf-dog-scene-gift.jpg
│   ├── nf-dog-scene-hand.jpg
│   ├── nf-multi-main.jpg
│   ├── nf-multi-scene-wall.jpg
│   ├── nf-multi-scene-gift.jpg
│   └── nf-multi-scene-shelf.jpg
├── embroidery/           # 刺绣类（SKU-04~06）
│   ├── emb-pet-main.jpg
│   ├── emb-pet-scene-desk.jpg
│   ├── emb-pet-scene-wall.jpg
│   ├── emb-pet-scene-hand.jpg
│   ├── emb-flower-main.jpg
│   ├── emb-flower-scene-desk.jpg
│   ├── emb-flower-scene-wall.jpg
│   ├── emb-flower-scene-gift.jpg
│   ├── emb-wedding-main.jpg
│   ├── emb-wedding-scene-desk.jpg
│   ├── emb-wedding-scene-wall.jpg
│   └── emb-wedding-scene-gift.jpg
├── moon-lamp/            # 月球灯类（SKU-07~08）
│   ├── ml-photo-main.jpg
│   ├── ml-photo-scene-bedroom.jpg
│   ├── ml-photo-scene-dark.jpg
│   ├── ml-photo-scene-gift.jpg
│   ├── ml-text-main.jpg
│   ├── ml-text-scene-bedroom.jpg
│   ├── ml-text-scene-dark.jpg
│   └── ml-text-scene-gift.jpg
├── resin-coaster/        # 滴胶杯垫（SKU-09）
│   ├── rc-ocean-main.jpg
│   ├── rc-ocean-scene-table.jpg
│   ├── rc-ocean-scene-drink.jpg
│   └── rc-ocean-scene-flatlay.jpg
└── wood-sign/            # 木牌（SKU-10）
    ├── ws-name-main.jpg
    ├── ws-name-scene-door.jpg
    ├── ws-name-scene-wall.jpg
    └── ws-name-scene-desk.jpg
```

**命名规则**: `{品类缩写}-{子类}-{main|scene-场景名}.jpg`

---

## 二、全局技术规范

### 2.1 模型配置

| 配置项 | 要求 |
|--------|------|
| Base Model | SDXL 1.0 (首选 Juggernaut XL Lightning) 或 Flux.1-dev |
| VAE | sdxl_vae |
| 默认 Sampler | DPM++ 2M Karras |
| 默认 Steps | 30 |
| 默认 CFG | 7.0 |
| 输出分辨率 | 主图 1024x1024，场景图 1200x800 |

### 2.2 必装 LoRA

| LoRA | 用途 | 来源 |
|------|------|------|
| needle_felt_texture | 羊毛毡质感 | CivitAI 搜 "needle felt" |
| embroidery_style | 刺绣纹理 | CivitAI 搜 "embroidery" |
| resin_art | 树脂/环氧质感 | CivitAI 搜 "resin art" |
| product_photography_v2 | 商拍光影 | CivitAI 搜 "product photo" |
| midjourney_mimic | MJ 风格光影 | CivitAI 搜 "midjourney" |

### 2.3 必装插件

- ComfyUI LayerStyle（抠图、蒙版、图像混合）
- ComfyUI IC-Light（智能打光/重光）
- ControlNet Auxiliary Preprocessors（深度图、边缘检测）
- ComfyUI Image Filters（亮度/对比度/模糊）
- WD14 Tagger（反推提示词）

### 2.4 统一视觉风格

- 色温：偏暖（+200K）
- 饱和度：微增（+5%）
- 光感：自然窗光为主，柔和漫射
- 背景：干净、不抢眼，衬托产品
- 构图：主体居中，留呼吸空间

### 2.5 通用 Negative Prompt

```
blurry, low quality, cartoon, anime, painting, illustration, digital art, 3d render,
text, watermark, ugly, deformed, oversaturated, harsh shadows, flash photography,
extra objects, artifacts, extra fingers, mutated, disfigured
```

---

## 三、逐 SKU 生图任务

### SKU-01: 羊毛毡猫咪圆框画像

**LoRA**: needle_felt_texture (weight 0.7) + product_photography_v2 (weight 0.4)

**主图** (`nf-cat-main.jpg`, 1024x1024):
```
(best quality, masterpiece:1.2), product photography,
needle felted orange tabby cat portrait in round wooden embroidery hoop,
3D wool felt texture, realistic fur detail, soft shadows,
white linen background fabric, natural wood hoop frame 8 inch,
centered composition, clean white studio background,
professional product shot, 50mm lens, f/2.8, warm natural light
```

**场景A** (`nf-cat-scene-shelf.jpg`, 1200x800):
```
needle felted cat portrait in wooden hoop, displayed on wooden bookshelf,
warm natural daylight from window, cozy home interior,
books and small green plant beside, soft bokeh background,
lifestyle product photography, editorial style, warm tones
```

**场景B** (`nf-cat-scene-gift.jpg`, 1200x800):
```
needle felted cat portrait in hoop, inside kraft paper gift box,
tissue paper wrapping, gift tag with ribbon,
overhead flatlay composition, marble surface,
gift packaging photography, warm soft lighting
```

**场景C** (`nf-cat-scene-hand.jpg`, 1200x800):
```
female hands holding needle felted cat portrait hoop,
blurred living room background, natural window light,
showing scale and detail, warm skin tones,
lifestyle photography, shallow depth of field
```

---

### SKU-02: 羊毛毡狗狗画像

**LoRA**: needle_felt_texture (weight 0.7) + product_photography_v2 (weight 0.4)

**主图** (`nf-dog-main.jpg`, 1024x1024):
```
(best quality, masterpiece:1.2), product photography,
needle felted golden retriever portrait in round wooden embroidery hoop,
3D wool felt texture, realistic golden fur detail, soft shadows,
cream linen background fabric, natural wood hoop frame,
centered composition, clean white studio background,
professional product shot, 50mm lens, f/2.8
```

**场景A** (`nf-dog-scene-shelf.jpg`, 1200x800):
```
needle felted dog portrait in wooden hoop on rustic wooden shelf,
warm afternoon light, family home interior,
photo frame and candle beside, cozy atmosphere,
lifestyle product photography, warm golden tones
```

**场景B** (`nf-dog-scene-gift.jpg`, 1200x800):
```
needle felted dog portrait hoop with kraft paper wrapping,
ribbon bow, on wooden table, gift giving moment,
warm natural light, celebratory atmosphere,
lifestyle photography, soft focus background
```

**场景C** (`nf-dog-scene-hand.jpg`, 1200x800):
```
person holding needle felted golden retriever portrait hoop near window,
natural diffused daylight, showing 3D texture detail,
white wall background, shallow depth of field,
lifestyle product shot, warm tones
```

---

### SKU-03: 羊毛毡多宠组合画像

**LoRA**: needle_felt_texture (weight 0.7) + product_photography_v2 (weight 0.4)

**主图** (`nf-multi-main.jpg`, 1024x1024):
```
(best quality, masterpiece:1.2), product photography,
needle felted two pets portrait (cat and dog together) in large oval wooden frame,
3D wool felt texture, realistic fur details for both animals,
white linen background, premium wooden frame 12 inch,
centered composition, clean white studio background,
professional product shot, warm lighting
```

**场景A** (`nf-multi-scene-wall.jpg`, 1200x800):
```
large needle felted multi-pet portrait frame hung on white wall,
modern minimalist living room, sofa corner visible,
warm natural daylight, gallery wall style,
interior design photography, Scandinavian style
```

**场景B** (`nf-multi-scene-gift.jpg`, 1200x800):
```
needle felted multi-pet portrait in luxury gift box,
velvet lining, premium unboxing experience,
overhead view, dark wood table surface,
luxury product photography, dramatic lighting
```

**场景C** (`nf-multi-scene-shelf.jpg`, 1200x800):
```
needle felted multi-pet portrait on fireplace mantle,
cozy living room with warm light, family photos arrangement,
homey atmosphere, lifestyle editorial photography
```

---

### SKU-04: 刺绣单宠画像

**LoRA**: embroidery_style (weight 0.7) + product_photography_v2 (weight 0.4)

**主图** (`emb-pet-main.jpg`, 1024x1024):
```
(best quality, masterpiece:1.2), product photography,
hand embroidered cat portrait in bamboo embroidery hoop 6 inch,
colorful thread on natural linen fabric, visible stitch texture,
delicate thread details, realistic pet features,
clean white background, soft studio lighting,
product shot, high detail, sharp focus
```

**场景A** (`emb-pet-scene-desk.jpg`, 1200x800):
```
embroidery hoop with pet portrait on wooden desk,
thread spools and scissors nearby, sewing supplies,
warm afternoon light, creative workspace,
editorial lifestyle photography, artistic atmosphere
```

**场景B** (`emb-pet-scene-wall.jpg`, 1200x800):
```
embroidered pet portrait hoop hung on white wall,
minimalist interior, natural daylight,
beside small potted plant, Scandinavian home decor,
interior photography, clean aesthetic
```

**场景C** (`emb-pet-scene-hand.jpg`, 1200x800):
```
hands holding embroidered pet portrait hoop,
natural window light, blurred background,
showing thread texture details, warm skin tones,
lifestyle photography, shallow depth of field
```

---

### SKU-05: 花卉刺绣绣框

**LoRA**: embroidery_style (weight 0.7)

**主图** (`emb-flower-main.jpg`, 1024x1024):
```
(best quality, masterpiece:1.2), product photography,
hand embroidered wildflower bouquet in bamboo hoop,
lavender, daisies, and green leaves, colorful thread on cream linen,
visible stitch texture, delicate thread details,
clean white background, soft studio lighting,
centered composition, product shot
```

**场景A** (`emb-flower-scene-desk.jpg`, 1200x800):
```
flower embroidery hoop on white desk,
small vase with fresh flowers beside, books stacked,
soft morning light from window, feminine workspace,
lifestyle photography, dreamy atmosphere
```

**场景B** (`emb-flower-scene-wall.jpg`, 1200x800):
```
three flower embroidery hoops arranged on white wall,
gallery wall display, minimalist bedroom,
natural daylight, pastel color palette,
interior design photography
```

**场景C** (`emb-flower-scene-gift.jpg`, 1200x800):
```
flower embroidery hoop wrapped in tissue paper,
gift wrapping process, kraft paper and ribbon,
flatlay composition on marble surface,
gift styling photography, soft warm tones
```

---

### SKU-06: 婚礼纪念刺绣

**LoRA**: embroidery_style (weight 0.7)

**主图** (`emb-wedding-main.jpg`, 1024x1024):
```
(best quality, masterpiece:1.2), product photography,
hand embroidered wedding commemorative hoop,
floral wreath with couple names "Emma & James" and date "06.15.2024",
delicate pink and white thread flowers, gold accent thread,
cream linen fabric in bamboo hoop,
clean white background, soft romantic lighting
```

**场景A** (`emb-wedding-scene-desk.jpg`, 1200x800):
```
wedding embroidery hoop on vanity table,
beside pearl jewelry and perfume bottle,
soft golden hour light, romantic feminine atmosphere,
styling product photography, blush pink tones
```

**场景B** (`emb-wedding-scene-wall.jpg`, 1200x800):
```
wedding embroidery hoop on bedroom nightstand,
soft lamp light, photo frame and dried flowers beside,
cozy romantic interior, warm evening light,
lifestyle photography, intimate atmosphere
```

**场景C** (`emb-wedding-scene-gift.jpg`, 1200x800):
```
wedding embroidery hoop in elegant gift box,
white satin lining, wedding invitation beside,
overhead flatlay, white marble surface,
wedding gift photography, elegant minimal style
```

---

### SKU-07: 照片月球灯

**LoRA**: product_photography_v2 (weight 0.4) | CFG: 6.5 | Sampler: Euler a, 25 steps

**主图** (`ml-photo-main.jpg`, 1024x1024):
```
(best quality:1.2), product photography,
3D printed moon lamp with custom photo engraved, glowing warm light,
realistic lunar surface texture, spherical shape 14cm diameter,
wooden base stand, soft warm yellow glow,
dark gradient background, product shot,
studio lighting, high detail, showing photo detail on surface
```

**场景A** (`ml-photo-scene-bedroom.jpg`, 1200x800):
```
moon lamp on bedside table, glowing warm light,
dark cozy bedroom, soft ambient lighting,
nightstand with book and plant,
moody atmosphere, cinematic lighting, romantic
```

**场景B** (`ml-photo-scene-dark.jpg`, 1200x800):
```
moon lamp floating in dark room, only light source,
dramatic glow illuminating surroundings,
hands reaching toward it, magical atmosphere,
dark photography, single light source, ethereal
```

**场景C** (`ml-photo-scene-gift.jpg`, 1200x800):
```
moon lamp in gift box with LED lights decoration,
unboxing moment, dark background with warm glow,
gift packaging with ribbon, celebratory feeling,
product gift photography, warm ambient light
```

---

### SKU-08: 刻字月球灯

**LoRA**: product_photography_v2 (weight 0.4) | CFG: 6.5 | Sampler: Euler a, 25 steps

**主图** (`ml-text-main.jpg`, 1024x1024):
```
(best quality:1.2), product photography,
3D printed moon lamp with engraved text "I Love You to the Moon and Back",
glowing warm light, realistic lunar surface texture,
wooden base stand, soft warm glow, text clearly visible,
dark gradient background, product shot, studio lighting
```

**场景A** (`ml-text-scene-bedroom.jpg`, 1200x800):
```
engraved moon lamp glowing on desk,
study room setting, books and stationery around,
warm desk lamp light, cozy study atmosphere,
lifestyle photography, warm golden tones
```

**场景B** (`ml-text-scene-dark.jpg`, 1200x800):
```
moon lamp with text glowing in complete darkness,
text illuminated clearly, romantic atmosphere,
couple silhouette in background, love and romance theme,
dark moody photography, warm light only from lamp
```

**场景C** (`ml-text-scene-gift.jpg`, 1200x800):
```
text moon lamp as graduation gift on desk,
graduation cap and diploma beside, celebratory setup,
warm natural light mixed with lamp glow,
milestone celebration photography
```

---

### SKU-09: 海洋波浪杯垫套装

**LoRA**: resin_art (weight 0.7) + product_photography_v2 (weight 0.4)

**主图** (`rc-ocean-main.jpg`, 1024x1024):
```
(best quality:1.2), product photography,
set of 4 handmade resin ocean coasters arranged in diamond pattern,
blue and white epoxy resin, realistic ocean wave pattern,
embedded seashells and sand, translucent layers, depth effect,
white marble surface, overhead flatlay view,
natural light, product shot, high detail
```

**场景A** (`rc-ocean-scene-table.jpg`, 1200x800):
```
single ocean resin coaster on wooden coffee table,
living room setting with sofa in background,
natural afternoon light through window,
lifestyle photography, warm cozy interior
```

**场景B** (`rc-ocean-scene-drink.jpg`, 1200x800):
```
iced coffee glass on ocean resin coaster,
summer drink on wooden table, poolside or patio setting,
bright natural sunlight, refreshing summer atmosphere,
food and drink styling photography
```

**场景C** (`rc-ocean-scene-flatlay.jpg`, 1200x800):
```
four ocean resin coasters flatlay on white marble,
seashells and dried starfish scattered around,
beach themed styling, natural soft light,
product photography, coastal aesthetic
```

---

### SKU-10: 家庭姓名门牌

**LoRA**: product_photography_v2 (weight 0.5) | ControlNet: Canny (weight 0.5, 文字控制)

**主图** (`ws-name-main.jpg`, 1024x1024):
```
(best quality:1.2), product photography,
personalized family name wooden sign "The Johnsons",
laser engraved cursive text on natural light basswood,
rustic farmhouse style, clean smooth edges, oval shape,
white clean background, product shot, centered,
warm wood tones, professional studio photography
```

**场景A** (`ws-name-scene-door.jpg`, 1200x800):
```
wooden family name sign mounted beside front door,
white door frame, welcome home setting,
green plant in pot nearby, warm porch light,
residential exterior photography, inviting entrance
```

**场景B** (`ws-name-scene-wall.jpg`, 1200x800):
```
wooden name sign on white interior wall,
entryway console table below with keys and plant,
natural daylight from nearby window, clean interior,
interior design photography, modern farmhouse style
```

**场景C** (`ws-name-scene-desk.jpg`, 1200x800):
```
wooden name sign on craft workshop desk,
laser cutter and wood pieces in background,
showing handmade process, workshop atmosphere,
behind the scenes photography, artisan craft
```

---

## 四、质检标准（必须严格执行）

### 4.1 自动化技术质检（每张图必过）

| 检测项 | 合格标准 | 不合格处理 |
|--------|----------|------------|
| 分辨率 | 主图 >= 1024x1024, 场景图 >= 1200x800 | ESRGAN 放大 |
| 清晰度 (Laplacian) | >= 100 (产品中心区域) | 提高 steps/降低 denoise |
| 色差 ΔE | <= 5 (与同系列对比) | 调整 ColorAdapter |
| 产品完整性 | 无截断/无缺失/无变形 | 加强 ControlNet 权重 |
| 边缘融合 | 无白边/无硬边 | 增大 GaussianBlur |
| AI 瑕疵 | 无幻觉元素/无纹理变异/无重复图案 | 增加 negative prompt |

### 4.2 自动评分（加权总分 >= 85 才算通过）

| 维度 | 权重 |
|------|------|
| 分辨率合规 | 15% |
| 清晰度 | 20% |
| 产品完整性 | 20% |
| 色差控制 | 15% |
| 光影一致性 | 15% |
| 边缘融合 | 15% |

- >= 85 分：通过
- 70-84 分：标记待人工复核
- < 70 分：不通过，必须调参重跑

### 4.3 不通过时的参数调整速查

| 问题 | 调整方案 |
|------|----------|
| 产品模糊 | 提高 steps >= 30; 降低 denoise 0.5-0.7; ESRGAN 放大 |
| 色偏严重 | 调高 ColorAdapter 0.6-0.8; 检查 AutoAdjust |
| 边缘白边 | 增大 GaussianBlur; 检查 Remove Bg 质量 |
| 光影不匹配 | 调整 IC-Light 亮度方向; 增大 ImageBlur 柔化 |
| 文字损失 | 降低重绘 denoise; 提高 Detail Transfer blend_factor 0.7-0.9 |
| 产品变形 | 加强 ControlNet 权重 0.7-1.0; 降低 denoise |
| AI 幻觉 | 增加 negative prompt; 降低 denoise |

---

## 五、执行流程

### Step 1: 环境检查
1. 确认 ComfyUI 已安装并能正常启动
2. 确认以下模型已下载到 `models/checkpoints/`: Juggernaut XL Lightning 或 SDXL 1.0
3. 确认以上 LoRA 已下载到 `models/loras/`
4. 确认以上插件已安装

### Step 2: 按品类生成
按以下顺序逐品类执行：
1. needle-felt (SKU-01, 02, 03) - 12张
2. embroidery (SKU-04, 05, 06) - 12张
3. moon-lamp (SKU-07, 08) - 8张
4. resin-coaster (SKU-09) - 4张
5. wood-sign (SKU-10) - 4张

**每个 SKU 的执行步骤：**
1. 加载对应 LoRA 和参数配置
2. 先跑主图 prompt，出 4-8 张候选
3. 选最佳主图（通过质检的最高分）
4. 固定 seed 风格，跑 3 张场景图
5. 每张场景图出 4 张候选，选最佳
6. 全部通过质检后，按命名规范保存到输出文件夹

### Step 3: 后处理
对所有成品图统一执行：
1. 色温校正：统一暖色调 (+200K)
2. 饱和度微调：+5%
3. 输出格式：JPG, quality 92%
4. 不加水印（独立站产品图不需要）

### Step 4: 输出确认
- 确认 `public/products/` 下 5 个子目录共 40 张图片
- 文件名严格按照第一节命名规范
- 每张图分辨率达标

---

## 六、交付清单

完成后在以下路径创建交付报告：

```
/Users/yaopulife/yaopuqoder/yaopulife-site/docs/image-generation-report.md
```

报告内容需包含：
- 每张图的文件名、分辨率、自动评分
- 使用的模型/LoRA/参数配置
- 遇到的问题及解决方案
- 不通过被废弃的图片数量及原因统计

---

## 七、注意事项

1. **不通过的图绝对不输出到 products/ 目录** - 宁可重跑也不降级使用
2. **同系列图片保持风格一致** - 用固定 seed + 相近参数确保系列感
3. **每批最多复检 2 轮** - 2 轮后仍不通过则更换 prompt 策略
4. **优先保证产品主体清晰** - 背景可以略虚，但产品细节必须锐利
5. **文件大小控制在 500KB 以内** - web 用图需要兼顾加载速度
