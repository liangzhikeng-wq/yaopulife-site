/**
 * yaopulife AI生图生成器
 * 使用 DeepSeek 生成 AI 生图 Prompt，然后生成占位图片
 * 
 * 说明: OpenClaw 生图需要手动在客户端执行，此脚本生成 prompt 供使用
 */

const fs = require('fs');
const path = require('path');

// 图片目录
const RAW_DIR = path.join(__dirname, '../public/images/raw');
const AI_DIR = path.join(__dirname, '../public/images/ai');

// 产品生图配置
const imageConfigs = [
  {
    sku: 'DIY-PET-001',
    product: 'Needle Felted Cat Portrait',
    images: [
      { type: 'main', prompt: 'Product photo of a custom needle felted cat portrait in 8-inch wooden hoop, realistic cat face with glass eyes, soft fur texture, natural lighting, white background, studio photography, high detail, 4K' },
      { type: 'scene', prompt: 'Lifestyle photo of needle felted cat portrait displayed on a rustic wooden shelf in a cozy living room, warm ambient lighting, Scandinavian interior design, bokeh background with plants and books' },
      { type: 'detail', prompt: 'Close-up detail of needle felted cat fur texture, individual wool fibers visible, glass eyes catching light, macro photography, shallow depth of field' },
      { type: 'gift', prompt: 'Needle felted cat portrait beautifully wrapped in kraft paper with twine, surrounded by dried flowers, gift opening scenario, warm golden light' }
    ]
  },
  {
    sku: 'DIY-PET-002',
    product: 'Needle Felted Dog Portrait',
    images: [
      { type: 'main', prompt: 'Product photo of a custom needle felted dog portrait in 8-inch wooden hoop, golden retriever style with glass eyes, realistic fur texture, natural lighting, white background, studio photography, high detail, 4K' },
      { type: 'scene', prompt: 'Lifestyle photo of needle felted dog portrait hanging on a modern white wall in a sunlit living room, minimalist Scandinavian design, dog bed in foreground' },
      { type: 'detail', prompt: 'Close-up detail of needle felted dog fur texture, individual wool fibers visible, glass eyes with warm brown color, macro photography' },
      { type: 'gift', prompt: 'Needle felted dog portrait in elegant gift box with cream ribbon, memorial gift presentation, soft natural light' }
    ]
  },
  {
    sku: 'DIY-GIFT-002',
    product: 'Custom Photo Moon Lamp',
    images: [
      { type: 'main', prompt: 'Product photo of 3D printed moon lamp with custom photo texture on surface, warm LED glow, wooden base, pure white background, studio lighting, high detail, 4K' },
      { type: 'scene', prompt: 'Lifestyle photo of moon lamp on bedside table in cozy bedroom, warm amber glow illuminating surrounding area, books and plant on nightstand, evening ambiance' },
      { type: 'glow', prompt: 'Close-up of moon lamp glowing in dark room, realistic lunar surface texture, warm ambient light, romantic atmosphere, long exposure photography' },
      { type: 'gift', prompt: 'Moon lamp in elegant gift box with LED ribbon, unboxing moment, soft blue and warm amber lighting, gift for anniversary' }
    ]
  },
  {
    sku: 'DIY-HOME-003',
    product: 'Personalized Family Name Sign',
    images: [
      { type: 'main', prompt: 'Product photo of laser engraved wooden family name sign, elegant cursive font reading "The Smith Family", natural wood grain visible, non-toxic finish, white background, studio photography' },
      { type: 'scene', prompt: 'Lifestyle photo of wooden family name sign hanging on front door of modern American home, wreath decoration, welcoming atmosphere, natural daylight' },
      { type: 'detail', prompt: 'Close-up detail of laser engraved text on wood, smooth edges, precise lettering, natural wood texture around text, macro photography' },
      { type: 'gift', prompt: 'Family name sign in kraft paper with twine, wooden gift tag attached, housewarming gift presentation on wooden table' }
    ]
  }
];

// 生成生图提示词文件
function generatePromptFiles() {
  console.log('生成 AI 生图 Prompt 文件...\n');
  
  for (const config of imageConfigs) {
    const promptsDir = path.join(AI_DIR, config.sku.toLowerCase());
    fs.mkdirSync(promptsDir, { recursive: true });
    
    const promptData = {
      sku: config.sku,
      product: config.product,
      prompts: config.images.map(img => ({
        filename: `${img.type}.webp`,
        prompt: img.prompt,
        type: img.type
      })),
      generatedAt: new Date().toISOString()
    };
    
    const filePath = path.join(promptsDir, 'prompts.json');
    fs.writeFileSync(filePath, JSON.stringify(promptData, null, 2));
    
    console.log(`✓ ${config.product} prompts generated`);
  }
  
  console.log('\n生图 Prompt 文件生成完成！');
  console.log(`\n目录: ${AI_DIR}`);
  console.log('\n使用说明:');
  console.log('1. 打开每个产品的 prompts.json 文件');
  console.log('2. 将 prompt 复制到 OpenClaw 生成图片');
  console.log('3. 将生成的图片保存到对应目录');
  console.log('4. 运行 scripts/generate-product-pages.cjs 更新产品页');
}

// 执行
generatePromptFiles();
