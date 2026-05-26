#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const core = require('./agent-core.cjs');

const IGNORE_DIRS = new Set([
  '.git',
  '.astro',
  '.next',
  '.vercel',
  'node_modules',
  'dist',
  'build'
]);

function walk(root, dir = root, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(root, full, files);
    } else {
      files.push(path.relative(root, full).split(path.sep).join('/'));
    }
  }
  return files;
}

function readPackageJson(root) {
  const packagePath = path.join(root, 'package.json');
  if (!fs.existsSync(packagePath)) return {};
  return core.readJson(packagePath, {});
}

function detectTechStack(root, packageJson, files) {
  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {})
  };

  let framework = 'Unknown';
  if (dependencies.astro || files.includes('astro.config.mjs')) framework = 'Astro';
  else if (dependencies.next) framework = 'Next.js';
  else if (dependencies.vite || files.some((file) => file.startsWith('vite.config.'))) framework = 'Vite';

  return {
    framework,
    adapter: dependencies['@astrojs/vercel'] ? '@astrojs/vercel' : '',
    styling: dependencies.tailwindcss || dependencies['@astrojs/tailwind'] ? 'Tailwind CSS' : '',
    package_type: packageJson.type || '',
    scripts: packageJson.scripts || {}
  };
}

function classify(files) {
  return {
    pages: files.filter((file) => file.startsWith('src/pages/') && /\.(astro|tsx?|jsx?)$/.test(file)).sort(),
    blog_posts: files.filter((file) => file.startsWith('src/content/blog/') && /\.mdx?$/.test(file)).sort(),
    product_content: files.filter((file) => file.startsWith('src/content/products/') && /\.mdx?$/.test(file)).sort(),
    product_data: files.filter((file) => file.startsWith('data/products/') && /\.json$/.test(file)).sort(),
    components: files.filter((file) => file.startsWith('src/components/') && /\.(astro|tsx?|jsx?)$/.test(file)).sort(),
    layouts: files.filter((file) => file.startsWith('src/layouts/') && /\.(astro|tsx?|jsx?)$/.test(file)).sort(),
    api_routes: files.filter((file) => file.startsWith('api/') || file.startsWith('src/pages/api/')).sort(),
    docs: files.filter((file) => file.startsWith('docs/') && /\.md$/.test(file)).sort(),
    scripts: files.filter((file) => file.startsWith('scripts/') && /\.(cjs|mjs|js|ts)$/.test(file)).sort(),
    seo_files: files.filter((file) => /sitemap|robots|rss|schema|content\.config|content\/config/i.test(file)).sort()
  };
}

function markdown(summary) {
  return `# Agent Project Scan

Generated At: ${summary.generated_at}

## Tech Stack

- Framework: ${summary.tech_stack.framework}
- Adapter: ${summary.tech_stack.adapter || 'Not detected'}
- Styling: ${summary.tech_stack.styling || 'Not detected'}
- Package Type: ${summary.tech_stack.package_type || 'Not detected'}

## Key Counts

- Pages: ${summary.pages.length}
- Blog Posts: ${summary.blog_posts.length}
- Product Content Files: ${summary.product_content.length}
- Product Data Files: ${summary.product_data.length}
- Components: ${summary.components.length}
- API Routes: ${summary.api_routes.length}
- Scripts: ${summary.scripts.length}
- Docs: ${summary.docs.length}

## Pages

${summary.pages.map((file) => `- ${file}`).join('\n') || '- None'}

## Product Content

${summary.product_content.map((file) => `- ${file}`).join('\n') || '- None'}

## Product Data

${summary.product_data.map((file) => `- ${file}`).join('\n') || '- None'}

## Blog Posts

${summary.blog_posts.map((file) => `- ${file}`).join('\n') || '- None'}

## SEO Related Files

${summary.seo_files.map((file) => `- ${file}`).join('\n') || '- None'}

## Scripts

${summary.scripts.map((file) => `- ${file}`).join('\n') || '- None'}

## Notes

- This scan is read-only.
- Current MVP agent tools write to .agent/ only.
- Publishing into live Astro pages is intentionally outside the first MVP.
`;
}

function scanProject(input = {}, options = {}) {
  const root = options.root || process.cwd();
  const now = options.now || new Date().toISOString();
  const paths = core.ensureWorkspace(root);
  const files = walk(root).sort();
  const packageJson = readPackageJson(root);
  const groups = classify(files);
  const summary = {
    generated_at: now,
    project_root: root,
    tech_stack: detectTechStack(root, packageJson, files),
    ...groups
  };

  const jsonPath = path.join(paths.reportsRoot, 'project-scan.json');
  const markdownPath = path.join(paths.reportsRoot, 'project-scan.md');
  core.writeJson(jsonPath, summary);
  fs.writeFileSync(markdownPath, markdown(summary));

  let analysisPath = '';
  const shouldWriteDocs = input.write_docs === true || input.writeDocs === true || input.write_docs === 'true' || input.writeDocs === 'true';
  if (shouldWriteDocs) {
    analysisPath = path.join(root, 'docs', 'AGENT_PROJECT_ANALYSIS.md');
    core.ensureDir(path.dirname(analysisPath));
    fs.writeFileSync(analysisPath, markdown(summary));
  }

  core.writeLog(root, 'scan', {
    event: 'project_scan_completed',
    framework: summary.tech_stack.framework,
    pages: summary.pages.length,
    product_content: summary.product_content.length,
    timestamp: now
  });

  return {
    summary,
    jsonPath,
    markdownPath,
    analysisPath
  };
}

function main() {
  const args = core.parseArgs();
  const result = scanProject(args);
  process.stdout.write(`${JSON.stringify({
    framework: result.summary.tech_stack.framework,
    pages: result.summary.pages.length,
    blog_posts: result.summary.blog_posts.length,
    product_content: result.summary.product_content.length,
    product_data: result.summary.product_data.length,
    jsonPath: result.jsonPath,
    markdownPath: result.markdownPath,
    analysisPath: result.analysisPath
  }, null, 2)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

module.exports = { scanProject };
