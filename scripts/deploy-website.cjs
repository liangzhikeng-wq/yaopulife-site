/**
 * Publish an explicitly reviewed set of files from a known production baseline.
 *
 * Example:
 * node scripts/deploy-website.cjs \
 *   --expected-production-sha <full-40-character-sha> \
 *   --approved-file src/content/example.md \
 *   --commit-message "content: publish reviewed example"
 */

const { execFileSync } = require('node:child_process');
const {
  assertCommitMatchesApprovedFiles,
  assertNoReleaseHooks,
  assertProductionBaseline,
  pushReviewedCommitOnce,
  stageApprovedFiles,
} = require('./deploy-guard.cjs');

const DEFAULT_SITE_DIR = '/Users/yaopulife/yaopuqoder/yaopulife-site';
const GENERATORS = [
  ['scripts/generate-product-content.cjs', '产品描述'],
  ['scripts/generate-product-images.cjs', 'AI生图Prompt'],
  ['scripts/generate-blog-content.cjs', '博客内容'],
  ['scripts/generate-sitemap.cjs', 'Sitemap'],
];

function parseArgs(argv) {
  const options = { approvedFiles: [], siteDir: DEFAULT_SITE_DIR };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
    if (flag === '--expected-production-sha') options.expectedProductionSha = value;
    else if (flag === '--approved-file') options.approvedFiles.push(value);
    else if (flag === '--commit-message') options.commitMessage = value;
    else if (flag === '--site-dir') options.siteDir = value;
    else throw new Error(`Unknown option: ${flag}`);
    index += 1;
  }
  if (!options.expectedProductionSha) throw new Error('--expected-production-sha is required.');
  if (options.approvedFiles.length === 0) throw new Error('At least one --approved-file is required.');
  if (!options.commitMessage) throw new Error('--commit-message is required.');
  return options;
}

function runGenerators(siteDir, execute = execFileSync) {
  console.log('[1/4] 生成内容（只有显式批准文件可进入提交）...');
  for (const [script, label] of GENERATORS) {
    try {
      execute(process.execPath, [script], { cwd: siteDir, stdio: 'pipe' });
      console.log(`  ✓ ${label}生成完成`);
    } catch (error) {
      const wrapped = new Error(`Generator failed (${label}); release stopped before staging.`);
      wrapped.cause = error;
      throw wrapped;
    }
  }
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  console.log('=== yaopulife 审核文件发布 ===\n');

  console.log('[0/4] 核对显式生产基线...');
  const baseline = assertProductionBaseline({
    cwd: options.siteDir,
    expectedProductionSha: options.expectedProductionSha,
  });
  console.log(`  ✓ HEAD 与显式生产基线一致: ${baseline.currentSha}`);
  if (baseline.remoteMainSha && baseline.remoteMainSha !== baseline.currentSha) {
    console.log(`  ! origin/main 仅作诊断且不是生产基线: ${baseline.remoteMainSha}`);
  }

  runGenerators(options.siteDir);

  console.log('\n[2/4] 仅暂存已审文件...');
  assertNoReleaseHooks({ cwd: options.siteDir, step: 'staging' });
  console.log('  ✓ 本次发布会触发的 Git 钩子与 fsmonitor 均不存在（不绕过、不运行未审程序）');
  const staged = stageApprovedFiles({
    cwd: options.siteDir,
    approvedFiles: options.approvedFiles,
  });
  if (staged.stagedFiles.length === 0) throw new Error('No reviewed file has a staged change; refusing to publish.');
  console.log(`  ✓ 已审文件: ${staged.stagedFiles.join(', ')}`);
  if (staged.unapprovedUntracked.length > 0) {
    console.log(`  ✓ ${staged.unapprovedUntracked.length} 个未审未追踪文件保持未暂存`);
  }

  console.log('\n[3/4] 提交已审文件...');
  assertNoReleaseHooks({ cwd: options.siteDir, step: 'commit' });
  // Automatic maintenance/GC after commit is not a safety check; turning it off keeps
  // configured GC programs from running inside the release.
  execFileSync('git', ['-c', 'maintenance.auto=false', '-c', 'gc.auto=0', 'commit', '-m', options.commitMessage], {
    cwd: options.siteDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const commitSha = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: options.siteDir,
    encoding: 'utf8',
  }).trim();
  assertCommitMatchesApprovedFiles({
    cwd: options.siteDir,
    baselineSha: baseline.currentSha,
    commitSha,
    approvedFiles: staged.stagedFiles,
    reviewedTreeSha: staged.reviewedTreeSha,
  });
  console.log(`  ✓ 提交后文件集合复核通过: ${commitSha}`);

  console.log('\n[4/4] 单次推送已审提交...');
  const push = pushReviewedCommitOnce({ cwd: options.siteDir, commitSha });
  console.log('  ✓ 推送触发已被 Git 接受；Vercel 结果仍需只读查账确认');
  console.log(`  部署状态: ${push.deploymentStatus}；在确认前禁止重跑`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`发布已停止: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { main, parseArgs, runGenerators };
