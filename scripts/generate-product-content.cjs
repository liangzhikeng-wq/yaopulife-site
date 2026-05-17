/**
 * yaopulife 产品内容生成器
 * 使用 DeepSeek API 生成产品描述、SEO元数据、博客内容
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-c10172c37be24ead9a878f522136aa4f';
const DEEPSEEK_URL = 'api.deepseek.com';

// 产品数据
const products = [
  {
    id: 1,
    sku: 'DIY-PET-001',
    title: 'Needle Felted Cat Portrait',
    category: 'Pet Portraits',
    price: '$65',
    material: '100% wool roving, glass eyes, wooden hoop',
    size: '8 inch round frame',
    productionTime: '14-18 days',
    customization: '文字定制（名字/日期）',
    keywords: ['custom pet portrait', 'cat memorial gift', 'needle felted cat', 'handmade gift']
  },
  {
    id: 2,
    sku: 'DIY-PET-002',
    title: 'Needle Felted Dog Portrait',
    category: 'Pet Portraits',
    price: '$65',
    material: '100% wool roving, glass eyes, wooden hoop',
    size: '8 inch round frame',
    productionTime: '14-18 days',
    customization: '文字定制（名字/日期）',
    keywords: ['custom dog portrait', 'dog memorial gift', 'needle felted dog', 'pet lover gift']
  },
  {
    id: 3,
    sku: 'DIY-PET-003',
    title: 'Multi-Pet Felt Portrait',
    category: 'Pet Portraits',
    price: '$89',
    material: '100% wool roving, glass eyes, premium wooden frame',
    size: '10-12 inch oval frame',
    productionTime: '18-24 days',
    customization: '文字定制（多宠物名字）',
    keywords: ['multi pet portrait', 'family pet gift', 'custom animal portrait']
  },
  {
    id: 4,
    sku: 'DIY-PET-004',
    title: 'Custom Pet Embroidery Hoop',
    category: 'Pet Portraits',
    price: '$48',
    material: 'Cotton thread on linen, bamboo hoop',
    size: '6-8 inch diameter',
    productionTime: '10-14 days',
    customization: '图片定制（宠物照片）',
    keywords: ['pet embroidery', 'custom pet gift', 'hand embroidery portrait']
  },
  {
    id: 5,
    sku: 'DIY-HOME-001',
    title: 'Floral Embroidery Hoop',
    category: 'Home Decor',
    price: '$38',
    material: 'Cotton thread on cream linen, bamboo hoop',
    size: '6 inch diameter',
    productionTime: '7-10 days',
    customization: '文字定制（名字/祝福语）',
    keywords: ['floral embroidery', 'botanical art', 'handmade home decor']
  },
  {
    id: 6,
    sku: 'DIY-GIFT-001',
    title: 'Custom Wedding Embroidery',
    category: 'Custom Gifts',
    price: '$55',
    material: 'Silk and cotton thread, bamboo hoop',
    size: '8-10 inch diameter',
    productionTime: '10-14 days',
    customization: '文字+模板定制（名字/日期/誓言）',
    keywords: ['wedding gift', 'anniversary gift', 'personalized couple gift', 'custom embroidery']
  },
  {
    id: 7,
    sku: 'DIY-GIFT-002',
    title: 'Custom Photo Moon Lamp',
    category: 'Custom Gifts',
    price: '$42',
    material: 'PLA filament, LED module, wooden base',
    size: '5.5 inch (14cm) diameter',
    productionTime: '5-7 days',
    customization: '图片定制（照片/坐标）',
    keywords: ['photo moon lamp', 'custom gift', 'personalized lamp', '3D printed lamp']
  },
  {
    id: 8,
    sku: 'DIY-GIFT-003',
    title: 'Engraved Text Moon Lamp',
    category: 'Custom Gifts',
    price: '$39',
    material: 'PLA filament, LED module, wooden base',
    size: '5.5 inch (14cm) diameter',
    productionTime: '5-7 days',
    customization: '文字定制（名字/日期/誓言）',
    keywords: ['engraved moon lamp', 'text personalized lamp', 'gift for her', 'romantic gift']
  },
  {
    id: 9,
    sku: 'DIY-HOME-002',
    title: 'Ocean Resin Coaster Set',
    category: 'Home Decor',
    price: '$28',
    material: 'Epoxy resin, natural seashells, sand',
    size: '4x4 inches each (set of 4)',
    productionTime: '5-7 days',
    customization: '颜色定制',
    keywords: ['ocean coaster', 'resin art', 'beach home decor', 'coastal gift']
  },
  {
    id: 10,
    sku: 'DIY-HOME-003',
    title: 'Personalized Family Name Sign',
    category: 'Home Decor',
    price: '$35',
    material: 'Natural basswood, non-toxic finish',
    size: '12x8 inches',
    productionTime: '5-7 days',
    customization: '文字定制（家庭名字）',
    keywords: ['family name sign', 'wooden sign', 'personalized home decor', 'laser engraved']
  }
];

// 调用 DeepSeek API
async function callDeepSeek(prompt, systemPrompt = 'You are a professional e-commerce content writer.') {
  const data = JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  });

  const options = {
    hostname: DEEPSEEK_URL,
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.choices[0].message.content);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 生成产品描述
async function generateProductDescriptions() {
  console.log('开始生成产品描述...\n');
  
  for (const product of products) {
    console.log(`生成: ${product.title}...`);
    
    const prompt = `为 "${product.title}" 生成电商产品描述。

产品信息：
- 价格: ${product.price}
- 材质: ${product.material}
- 尺寸: ${product.size}
- 生产周期: ${product.productionTime}
- 定制选项: ${product.customization}
- 核心关键词: ${product.keywords.join(', ')}

要求输出JSON格式：
{
  "title": "SEO优化后的产品标题",
  "metaTitle": "SEO Meta Title (≤60字符)",
  "metaDescription": "SEO Meta Description (≤155字符，含行动号召)",
  "shortDescription": "简短描述（50字以内）",
  "fullDescription": "完整产品描述（150-200词，分段，含情感钩子、定制流程、规格、场景）",
  "altTags": ["图片Alt标签1", "图片Alt标签2", "图片Alt标签3"],
  "faq": ["问题1", "问题2", "问题3"]
}`;

    try {
      const result = await callDeepSeek(prompt);
      const content = JSON.parse(result);
      
      // 保存到文件
      const filePath = path.join(__dirname, '../data/products', `${product.sku}.json`);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify({ ...product, ...content, generatedAt: new Date().toISOString() }, null, 2));
      
      console.log(`  ✓ ${product.title} 完成`);
    } catch (e) {
      console.error(`  ✗ ${product.title} 失败: ${e.message}`);
    }
  }
  
  console.log('\n产品描述生成完成！');
}

// 执行
generateProductDescriptions().catch(console.error);
