#!/usr/bin/env node
/**
 * Upload product images to Cloudflare R2
 * Usage: node scripts/upload-to-r2.js <local-image-path> <r2-key>
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function upload(filePath, key) {
  const file = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  }[ext] || 'application/octet-stream';

  await R2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  }));

  console.log(`Uploaded: ${key}`);
  console.log(`Public URL: ${process.env.R2_PUBLIC_URL}/${key}`);
}

const [,, filePath, key] = process.argv;
if (!filePath || !key) {
  console.error('Usage: node upload-to-r2.js <local-image-path> <r2-key>');
  process.exit(1);
}

upload(filePath, key).catch(console.error);
