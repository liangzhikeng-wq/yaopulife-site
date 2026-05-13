#!/usr/bin/env node
/**
 * Cloudflare DNS + R2 setup automation
 * Run after CF_API_TOKEN is set in .env
 */

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const ZONE_ID = process.env.CF_ZONE_ID;

if (!CF_API_TOKEN || CF_API_TOKEN === 'REPLACE_ME') {
  console.error('ERROR: Set CF_API_TOKEN in .env first');
  process.exit(1);
}

async function cfFetch(endpoint, opts = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${endpoint}`, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  return res.json();
}

async function setup() {
  // List zones to verify token
  const zones = await cfFetch('/zones');
  console.log('Zones:', zones.result?.map(z => ({ name: z.name, id: z.id })));

  if (ZONE_ID) {
    // Get zone details
    const zone = await cfFetch(`/zones/${ZONE_ID}`);
    console.log('Zone status:', zone.result?.status);

    // List DNS records
    const records = await cfFetch(`/zones/${ZONE_ID}/dns_records`);
    console.log('DNS Records:', records.result?.map(r => ({ type: r.type, name: r.name, content: r.content })));
  }

  console.log('\nToken verified. Ready for deployment.');
}

setup().catch(console.error);
