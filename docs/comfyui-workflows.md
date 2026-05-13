# ComfyUI 产品图生成工作流方案

## 总体策略
每款产品需生成 4 张图：1主图(1000x1000) + 3场景图(1200x800)
所有图片统一风格：明亮、温暖、自然光感、商业摄影质感

---

## 工作流一：羊毛毡宠物画像

### 模型配置
- Base Model: SDXL 1.0 / Stable Diffusion 3.5
- LoRA: wool_felt_texture（推荐训练或下载 CivitAI 上的羊毛毡风格LoRA）
- VAE: sdxl_vae
- Sampler: DPM++ 2M Karras, 30 steps, CFG 7.0

### 主图 Prompt（1000x1000）
```
(best quality, masterpiece:1.2), product photography,
needle felted [cat/dog breed] portrait in round wooden embroidery hoop,
3D wool felt texture, realistic fur detail, soft shadows,
white linen background fabric, wooden hoop frame,
centered composition, clean white studio background,
professional product shot, 50mm lens, f/2.8
```

### 场景图 Prompt（1200x800）
**场景A - 书架**:
```
needle felted pet portrait in wooden hoop, displayed on wooden bookshelf,
warm natural daylight from window, cozy home interior,
books and small plant beside, soft bokeh background,
lifestyle product photography, editorial style
```

**场景B - 礼盒**:
```
needle felted pet portrait in hoop, inside kraft paper gift box,
tissue paper wrapping, gift tag with ribbon,
overhead flatlay composition, marble surface,
gift packaging photography, warm lighting
```

**场景C - 手持展示**:
```
female hands holding needle felted pet portrait hoop,
blurred living room background, natural window light,
showing scale and detail, warm skin tones,
lifestyle photography, shallow depth of field
```

### Negative Prompt
```
blurry, low quality, cartoon, anime, painting, illustration, 
digital art, 3d render, text, watermark, ugly, deformed,
oversaturated, harsh shadows, flash photography
```

---

## 工作流二：手工刺绣

### 模型配置
- Base Model: SDXL 1.0
- LoRA: embroidery_thread_texture（刺绣纹理LoRA）
- Sampler: DPM++ 2M Karras, 30 steps, CFG 7.5

### 主图 Prompt
```
(best quality, masterpiece:1.2), product photography,
hand embroidered [pet/flower/wedding] design in bamboo hoop,
colorful thread on natural linen fabric, visible stitch texture,
delicate thread details, centered in round frame,
clean white background, soft studio lighting,
product shot, high detail, sharp focus
```

### 场景图 Prompt
**场景A - 桌面工作区**:
```
embroidery hoop artwork on wooden desk,
thread spools and scissors nearby, sewing supplies,
warm afternoon light, creative workspace,
editorial lifestyle photography
```

**场景B - 墙面装饰**:
```
embroidery hoop hung on white wall,
gallery wall arrangement, minimalist interior,
natural daylight, scandinavian home decor style
```

---

## 工作流三：3D月球灯

### 模型配置
- Base Model: SDXL 1.0
- LoRA: 无需特殊LoRA（产品渲染风格即可）
- Sampler: Euler a, 25 steps, CFG 6.5

### 主图 Prompt
```
(best quality:1.2), product photography,
3D printed moon lamp glowing warm light,
realistic lunar surface texture, spherical shape,
wooden base stand, soft warm glow,
dark gradient background, product shot,
studio lighting, high detail
```

### 场景图 Prompt
**场景A - 卧室氛围**:
```
moon lamp on bedside table, glowing warm light,
dark cozy bedroom, soft ambient lighting,
nightstand with book and plant,
moody atmosphere, cinematic lighting
```

---

## 工作流四：滴胶海洋杯垫

### 模型配置
- Base Model: SDXL 1.0
- LoRA: resin_art（环氧树脂艺术LoRA，CivitAI搜索）
- Sampler: DPM++ 2M Karras, 30 steps, CFG 7.0

### 主图 Prompt
```
(best quality:1.2), product photography,
set of 4 handmade resin ocean coasters,
blue and white epoxy resin, ocean wave pattern,
embedded seashells and sand, translucent layers,
arranged on white marble surface,
overhead flatlay, natural light, product shot
```

### 场景图 Prompt
**场景A - 使用场景**:
```
resin ocean coaster on wooden coffee table,
iced coffee drink on coaster, living room setting,
natural afternoon light, lifestyle photography,
shallow depth of field, warm tones
```

---

## 工作流五：定制姓名木牌

### 模型配置
- Base Model: SDXL 1.0
- Sampler: DPM++ 2M Karras, 25 steps, CFG 7.0
- ControlNet: 可用 Canny 或 Depth 做文字排版控制

### 主图 Prompt
```
(best quality:1.2), product photography,
personalized family name wooden sign "The Smiths",
laser engraved text on natural basswood,
rustic farmhouse style, clean edges,
white background, product shot, centered,
warm wood tones, professional photography
```

### 场景图 Prompt
**场景A - 玄关**:
```
wooden name sign mounted on white wall,
home entryway, coat hooks and shoes below,
warm natural light from door, welcoming entrance,
interior design photography
```

---

## ComfyUI 节点配置建议

### 通用工作流节点图

```
[Load Checkpoint] → [CLIP Text Encode (Positive)] → [KSampler] → [VAE Decode] → [Save Image]
                  → [CLIP Text Encode (Negative)] ↗
                  
附加节点：
[Load LoRA] → 接入 Model 和 CLIP
[ControlNet] → 可选，用于精确控制构图
[Upscale (4x)] → 最终输出1000x1000 / 1200x800
```

### 后期处理节点
1. **Upscale**: 用 4x-UltraSharp 或 RealESRGAN 放大到目标尺寸
2. **Color Correction**: 统一暖色调（色温+200K, 饱和度+5%）
3. **Watermark**: 右下角半透明白色 Logo（20% opacity）
4. **Export**: JPG, quality 92%

### 批量生成设置
- 每个prompt跑4-8张，挑选最佳
- 用 seed 固定后微调prompt获取系列感
- 建议固定 aspect ratio 后用不同 seed 出图

---

## 文件输出命名规范

```
products/needle-felt/nf-cat-main-01.jpg       (主图)
products/needle-felt/nf-cat-scene-shelf-01.jpg (场景图)
products/needle-felt/nf-cat-scene-gift-01.jpg  (场景图)
products/needle-felt/nf-cat-scene-hand-01.jpg  (场景图)
```

---

## 推荐 LoRA 资源

| 品类 | LoRA 名称 | 获取来源 |
|---|---|---|
| 羊毛毡 | needle_felt_texture / wool_felt | CivitAI 搜索 "needle felt" |
| 刺绣 | embroidery_style / thread_art | CivitAI 搜索 "embroidery" |
| 树脂/滴胶 | resin_art / epoxy_ocean | CivitAI 搜索 "resin art" |
| 产品摄影 | product_photography_v2 | CivitAI 搜索 "product photo" |

---

## 执行顺序

1. 下载/安装所需 LoRA 到 ComfyUI models 目录
2. 导入上方工作流节点配置
3. 按品类逐个生成：先跑主图确认风格，再批量出场景图
4. 后期统一调色+加水印
5. 按命名规范导出到 `products/` 目录
6. 上传至 Cloudflare R2 图床
