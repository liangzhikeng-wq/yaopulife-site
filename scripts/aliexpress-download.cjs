/**
 * Aliexpress图片下载脚本
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/images/raw');

// 产品关键词
const PRODUCTS = [
  { keyword: 'needle felted cat portrait', dir: 'pet-cat' },
  { keyword: 'needle felted dog portrait', dir: 'pet-dog' },
  { keyword: 'custom moon lamp photo', dir: 'lamp' },
  { keyword: 'personalized wooden name sign', dir: 'wood-sign' },
  { keyword: 'embroidery hoop pet', dir: 'embroidery-pet' }
];

// 下载图片
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// 使用占位图（因为无法直接下载）
function createPlaceholder(dir, filename, productName) {
  const dirPath = path.join(OUTPUT_DIR, dir);
  fs.mkdirSync(dirPath, { recursive: true });
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
    <rect fill="#F3F4F6" width="800" height="800"/>
    <text x="400" y="380" font-family="Arial" font-size="24" fill="#6B7280" text-anchor="middle">${productName}</text>
    <text x="400" y="420" font-family="Arial" font-size="16" fill="#9CA3AF" text-anchor="middle">Image placeholder</text>
  </svg>`;
  
  fs.writeFileSync(path.join(dirPath, filename), svg);
  console.log(`  ✓ Created placeholder: ${dir}/${filename}`);
}

function main() {
  console.log('=== Aliexpress 图片下载系统 ===\n');
  
  for (const product of PRODUCTS) {
    console.log(`处理: ${product.keyword}`);
    const dir = path.join(OUTPUT_DIR, product.dir);
    fs.mkdirSync(dir, { recursive: true });
    
    // 创建占位图
    createPlaceholder(product.dir, 'main.jpg', product.keyword);
    createPlaceholder(product.dir, 'detail1.jpg', product.keyword);
    createPlaceholder(product.dir, 'detail2.jpg', product.keyword);
  }
  
  console.log('\n=== 完成 ===');
  console.log('注意: 由于1688/Aliexpress反爬机制，使用SVG占位图');
  console.log('后续可用OpenClaw生成真实产品图替换');
}

main();
