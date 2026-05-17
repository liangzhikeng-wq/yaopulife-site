/**
 * 1688产品图片自动下载脚本
 * 使用Playwright自动化登录和下载
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 配置
const LOGIN_URL = 'https://login.1688.com_member/challenge/login_1688';
const SEARCH_URL = 'https://s.1688.com/kq/-B4C1B4C1C0D6D1F2C3ABD5B1.html'; // 针毡产品

const CREDENTIALS = {
  username: '蒲仔的爸',
  password: '88888888lzk'
};

const OUTPUT_DIR = path.join(__dirname, '../public/images/raw');

// 产品搜索关键词
const SEARCH_KEYWORDS = [
  '针毡 宠物 肖像 定制',
  '羊毛毡 猫咪 挂件',
  '羊毛毡 狗狗 挂件',
  '定制 刺绣 挂圈',
  '月球灯 3D打印 定制',
  '木质 姓名牌 激光刻字'
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(page) {
  console.log('正在登录1688...');
  
  try {
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    
    // 输入用户名
    const userInput = await page.$('#loginId');
    if (userInput) {
      await userInput.fill(CREDENTIALS.username);
      await sleep(500);
    }
    
    // 输入密码
    const pwdInput = await page.$('#password');
    if (pwdInput) {
      await pwdInput.fill(CREDENTIALS.password);
      await sleep(500);
    }
    
    // 点击登录按钮
    const loginBtn = await page.$('.password-login-btn');
    if (loginBtn) {
      await loginBtn.click();
      await sleep(3000);
    }
    
    console.log('登录完成');
    return true;
  } catch (e) {
    console.log('登录过程:', e.message);
    return false;
  }
}

async function searchProducts(page, keyword) {
  console.log(`搜索: ${keyword}`);
  
  try {
    const searchUrl = `https://s.1688.com/kq/-B5A4B1C8B6A8D7F6.html?keywords=${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    
    // 获取商品列表
    const products = await page.$$eval('.offer-item', items => 
      items.slice(0, 5).map(item => ({
        title: item.querySelector('.offer-title')?.textContent?.trim() || '',
        link: item.querySelector('a')?.href || ''
      }))
    );
    
    return products;
  } catch (e) {
    console.log('搜索失败:', e.message);
    return [];
  }
}

async function downloadProductImages(page, productLink, outputDir) {
  console.log(`下载商品图片: ${productLink.substring(0, 50)}...`);
  
  try {
    await page.goto(productLink, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    
    // 尝试获取产品图片
    const images = await page.$$eval('.main-image img, .offer-detail-main-image img', imgs => 
      imgs.map(img => img.src || img.dataset.src || '').filter(src => src.includes('jpg') || src.includes('png'))
    );
    
    return images;
  } catch (e) {
    console.log('获取图片失败:', e.message);
    return [];
  }
}

async function main() {
  console.log('=== 1688 自动下载系统 ===\n');
  
  // 创建输出目录
  SEARCH_KEYWORDS.forEach(keyword => {
    const dirName = keyword.replace(/\s+/g, '-').substring(0, 20);
    const dir = path.join(OUTPUT_DIR, dirName);
    fs.mkdirSync(dir, { recursive: true });
  });
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 登录
    await login(page);
    
    // 搜索并下载
    for (const keyword of SEARCH_KEYWORDS) {
      const products = await searchProducts(page, keyword);
      console.log(`找到 ${products.length} 个商品`);
      
      for (const product of products) {
        if (product.title) {
          console.log(`  - ${product.title}`);
        }
      }
    }
    
    console.log('\n=== 完成 ===');
    console.log('注意: 1688可能需要验证码，请手动检查并补充图片');
    
  } catch (e) {
    console.error('错误:', e.message);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
