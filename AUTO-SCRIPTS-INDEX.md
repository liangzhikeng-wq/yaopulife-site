# yaopulife 自动化脚本索引

> 全自动运营系统 - 无需人工干预

---

## 脚本列表

| 脚本 | 功能 | 触发方式 |
|------|------|---------|
| `generate-product-content.cjs` | DeepSeek生成产品描述 | 手动 |
| `generate-product-images.cjs` | 生成AI生图Prompt | 手动 |
| `generate-product-pages.cjs` | 生成产品内容页 | 手动 |
| `generate-blog-content.cjs` | 生成SEO博客内容 | 手动 |
| `generate-sitemap.cjs` | 生成sitemap.xml | 手动 |
| `generate-placeholders.cjs` | 生成SVG占位图 | 手动 |
| `auto-product-setup.cjs` | 全自动产品上架 | 手动 |

---

## 执行顺序

```
1. generate-product-content.cjs  → 生成产品描述
2. generate-product-images.cjs    → 生成生图Prompt
3. generate-placeholders.cjs      → 生成占位图
4. generate-product-pages.cjs    → 生成产品页
5. generate-blog-content.cjs     → 生成博客
6. generate-sitemap.cjs          → 生成sitemap
```

---

## 一键执行

```bash
cd yaopulife-site
node scripts/generate-product-content.cjs && \
node scripts/generate-product-images.cjs && \
node scripts/generate-placeholders.cjs && \
node scripts/generate-product-pages.cjs && \
node scripts/generate-blog-content.cjs && \
node scripts/generate-sitemap.cjs && \
git add -A && git commit -m "Auto update" && git push
```

---

## 目录结构

```
yaopulife-site/
├── scripts/                    # 自动化脚本
├── data/products/              # 产品数据(JSON)
├── src/content/
│   ├── products/                # 产品内容页(MD)
│   └── blog/                   # 博客内容(MD)
├── public/
│   ├── images/
│   │   ├── raw/                # 1688原图(待下载)
│   │   └── ai/                 # AI生图终稿
│   │       └── [sku]/
│   │           ├── main.svg    # 主图占位符
│   │           ├── scene.svg   # 场景图占位符
│   │           ├── detail.svg  # 细节图占位符
│   │           └── social.svg # 社交图占位符
│   └── sitemap.xml             # SEO地图
└── PRODUCT-SELECTION-TRACKER.md # 选品追踪表
```

---

## 待办（自动化完成）

- [ ] 下载1688产品原图 → `public/images/raw/`
- [ ] OpenClaw生图 → 替换SVG占位符
- [ ] Git push → Vercel自动部署

---

*此文件由 Qoder AI Agent 维护*