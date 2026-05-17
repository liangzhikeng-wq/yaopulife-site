/**
 * yaopulife 博客内容生成器
 * 使用 DeepSeek 生成 SEO 优化博客内容
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-c10172c37be24ead9a878f522136aa4f';
const DEEPSEEK_URL = 'api.deepseek.com';

// 调用 DeepSeek API
async function callDeepSeek(prompt, systemPrompt = 'You are a professional blog writer for an e-commerce DIY gifts store.') {
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

// 博客内容计划
const blogPosts = [
  {
    slug: 'diy-gift-ideas-2026',
    title: '15 Unique DIY Gift Ideas Perfect for Every Occasion in 2026',
    description: 'Discover 15 heartfelt DIY gift ideas that go beyond ordinary presents. From custom pet portraits to personalized moon lamps, find the perfect handcrafted gift for any occasion.',
    category: 'Gift Guides',
    tags: ['DIY gifts', 'personalized gifts', 'handmade gifts', 'gift ideas', '2026'],
    targetKeyword: 'DIY gift ideas',
    readTime: '8 min'
  },
  {
    slug: 'pet-portrait-memorial-guide',
    title: 'How to Choose the Perfect Pet Memorial Gift: Complete Guide',
    description: 'Everything you need to know about ordering a custom pet portrait as a memorial gift. Compare art styles, learn about customization options, and find the perfect tribute.',
    category: 'Pet Portraits',
    tags: ['pet memorial gift', 'dog memorial', 'cat memorial', 'custom pet portrait'],
    targetKeyword: 'pet memorial gift',
    readTime: '7 min'
  },
  {
    slug: 'wedding-gift-guide-2026',
    title: 'Top 10 Wedding Gifts That Will Be Treasured Forever',
    description: 'Looking for the perfect wedding gift? Discover handcrafted wedding presents that couples will cherish for years. From custom embroidery to personalized decor.',
    category: 'Gift Guides',
    tags: ['wedding gift', 'anniversary gift', 'couple gift', 'wedding present'],
    targetKeyword: 'wedding gift ideas',
    readTime: '6 min'
  },
  {
    slug: 'personalized-home-decor-trends',
    title: '2026 Personalized Home Decor Trends: Make Your Space uniquely Yours',
    description: 'Explore the top personalized home decor trends for 2026. From laser engraved wooden signs to custom art pieces, discover how to add personal touch to your home.',
    category: 'Home Decor',
    tags: ['home decor', 'personalized decor', 'custom home', 'decor trends'],
    targetKeyword: 'personalized home decor',
    readTime: '5 min'
  },
  {
    slug: 'how-to-customize-gifts',
    title: 'How to Customize Gifts: A Step-by-Step Guide',
    description: 'Learn how to order custom gifts like a pro. This guide covers everything from choosing the right product to uploading photos and adding personalization.',
    category: 'Guides',
    tags: ['custom gifts', 'how to', 'personalization', 'custom order'],
    targetKeyword: 'how to customize gifts',
    readTime: '4 min'
  }
];

// 生成博客内容
async function generateBlogContent() {
  console.log('开始生成博客内容...\n');
  
  const blogDir = path.join(__dirname, '../src/content/blog');
  
  for (const post of blogPosts) {
    console.log(`生成: ${post.title}...`);
    
    const prompt = `Write a comprehensive blog post about "${post.title}" for an e-commerce DIY gifts store.

Target keyword: ${post.targetKeyword}
Description: ${post.description}
Target audience: Americans aged 25-45 who love personalized gifts

Requirements:
1. Start with a hook paragraph
2. Use H2 and H3 headings naturally
3. Include product recommendations (link to existing product categories)
4. End with a call-to-action
5. Target 800-1200 words
6. Include FAQ section at the end (3-4 questions)
7. Tone: friendly, informative, not salesy

Output format: Return ONLY the markdown content with frontmatter:

---
title: "${post.title}"
description: "${post.description}"
pubDate: ${new Date().toISOString().split('T')[0]}
author: "yaopulife DIY"
category: "${post.category}"
tags: [${post.tags.map(t => `"${t}"`).join(', ')}]
---

[Blog content in markdown]`;

    try {
      const content = await callDeepSeek(prompt);
      const filepath = path.join(blogDir, `${post.slug}.md`);
      fs.writeFileSync(filepath, content);
      console.log(`  ✓ ${post.slug}.md`);
    } catch (e) {
      console.error(`  ✗ ${post.slug} 失败: ${e.message}`);
    }
  }
  
  console.log('\n博客内容生成完成！');
}

// 执行
generateBlogContent().catch(console.error);
