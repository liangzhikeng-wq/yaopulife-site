export const config = { runtime: 'edge' };

export default async function handler(req) {
  const sitemap = 'https://yaopulife.com/sitemap-index.xml';
  
  const results = {};
  
  // Ping Google
  try {
    const googleRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`);
    results.google = { status: googleRes.status, ok: googleRes.ok };
  } catch (e) {
    results.google = { error: e.message };
  }
  
  // IndexNow for Bing/Yandex
  try {
    const indexNowRes = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'yaopulife.com',
        key: 'yaopulife2026indexnow',
        keyLocation: 'https://yaopulife.com/yaopulife2026indexnow.txt',
        urlList: [
          'https://yaopulife.com/',
          'https://yaopulife.com/shop',
          'https://yaopulife.com/blog',
        ]
      })
    });
    results.indexnow = { status: indexNowRes.status, ok: indexNowRes.status === 200 || indexNowRes.status === 202 };
  } catch (e) {
    results.indexnow = { error: e.message };
  }
  
  return new Response(JSON.stringify({ submitted: new Date().toISOString(), results }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
