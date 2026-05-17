/**
 * 生成SVG占位图 - 替代真实产品图
 * 使用AI生成带有产品信息的SVG图片
 */

const fs = require('fs');
const path = require('path');

// SVG模板生成器
function generateProductSVG(product, type) {
  const colors = {
    'Pet Portraits': { bg: '#FEF3C7', accent: '#F59E0B' },
    'Custom Gifts': { bg: '#DBEAFE', accent: '#3B82F6' },
    'Home Decor': { bg: '#D1FAE5', accent: '#10B981' }
  };
  
  const color = colors[product.category] || { bg: '#F3F4F6', accent: '#6B7280' };
  
  const templates = {
    main: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
      <rect fill="${color.bg}" width="800" height="800"/>
      <rect x="100" y="100" width="600" height="600" rx="20" fill="white" stroke="${color.accent}" stroke-width="4"/>
      <text x="400" y="350" font-family="Arial" font-size="28" fill="#1F2937" text-anchor="middle" font-weight="bold">${product.title.split('–')[0].trim()}</text>
      <text x="400" y="400" font-family="Arial" font-size="20" fill="#6B7280" text-anchor="middle">${product.price}</text>
      <rect x="250" y="480" width="300" height="60" rx="10" fill="${color.accent}"/>
      <text x="400" y="520" font-family="Arial" font-size="18" fill="white" text-anchor="middle">yaopulife DIY</text>
    </svg>`,
    
    scene: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <rect fill="#F9FAFB" width="800" height="600"/>
      <ellipse cx="400" cy="500" rx="350" ry="80" fill="#E5E7EB"/>
      <rect x="300" y="200" width="200" height="250" rx="10" fill="white" stroke="${color.accent}" stroke-width="3"/>
      <text x="400" y="300" font-family="Arial" font-size="16" fill="#1F2937" text-anchor="middle">${product.shortDescription.substring(0, 40)}...</text>
      <text x="400" y="340" font-family="Arial" font-size="24" fill="${color.accent}" text-anchor="middle" font-weight="bold">${product.price}</text>
    </svg>`,
    
    detail: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <rect fill="${color.bg}" width="400" height="400"/>
      <circle cx="200" cy="180" r="100" fill="white" stroke="${color.accent}" stroke-width="2"/>
      <text x="200" y="175" font-family="Arial" font-size="14" fill="#1F2937" text-anchor="middle">DETAIL</text>
      <text x="200" y="195" font-family="Arial" font-size="12" fill="#6B7280" text-anchor="middle">${product.material.split(',')[0]}</text>
      <rect x="50" y="320" width="300" height="40" rx="5" fill="${color.accent}" opacity="0.3"/>
      <text x="200" y="345" font-family="Arial" font-size="12" fill="#1F2937" text-anchor="middle">${product.size}</text>
    </svg>`,
    
    social: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">
      <rect fill="${color.bg}" width="1080" height="1080"/>
      <rect x="40" y="40" width="1000" height="1000" rx="20" fill="white"/>
      <text x="540" y="450" font-family="Arial" font-size="36" fill="#1F2937" text-anchor="middle" font-weight="bold">${product.title.split('–')[0].trim()}</text>
      <text x="540" y="520" font-family="Arial" font-size="28" fill="${color.accent}" text-anchor="middle">${product.price}</text>
      <text x="540" y="580" font-family="Arial" font-size="20" fill="#6B7280" text-anchor="middle">Handcrafted with love</text>
      <rect x="340" y="700" width="400" height="60" rx="30" fill="${color.accent}"/>
      <text x="540" y="740" font-family="Arial" font-size="20" fill="white" text-anchor="middle">yaopulife.com</text>
    </svg>`
  };
  
  return templates[type] || templates.main;
}

// 主函数
function main() {
  const productsDir = path.join(__dirname, '../data/products');
  const aiDir = path.join(__dirname, '../public/images/ai');
  
  console.log('生成产品SVG占位图...\n');
  
  const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const product = JSON.parse(fs.readFileSync(path.join(productsDir, file), 'utf-8'));
    const productDir = path.join(aiDir, product.sku.toLowerCase());
    fs.mkdirSync(productDir, { recursive: true });
    
    const types = ['main', 'scene', 'detail', 'social'];
    
    for (const type of types) {
      const svg = generateProductSVG(product, type);
      const filepath = path.join(productDir, `${type}.svg`);
      fs.writeFileSync(filepath, svg);
    }
    
    console.log(`✓ ${product.title}`);
  }
  
  console.log('\n占位图生成完成！');
}

main();
