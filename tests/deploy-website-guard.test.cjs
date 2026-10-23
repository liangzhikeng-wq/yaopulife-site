const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const test = require('node:test');

const guardPath = path.join(__dirname, '..', 'scripts', 'deploy-guard.cjs');

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function makeRepo() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'yaopu-deploy-guard-'));
  git(cwd, 'init', '-b', 'main');
  git(cwd, 'config', 'user.name', 'Deploy Guard Test');
  git(cwd, 'config', 'user.email', 'deploy-guard@example.test');
  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'baseline\n');
  git(cwd, 'add', '--', 'reviewed.txt');
  git(cwd, 'commit', '-m', 'baseline');
  return cwd;
}

test('stages only explicitly approved files and leaves 24 unrelated untracked files untouched', () => {
  assert.ok(fs.existsSync(guardPath), 'deploy guard module must exist');
  const { stageApprovedFiles } = require(guardPath);
  const cwd = makeRepo();

  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'reviewed change\n');
  for (let index = 0; index < 24; index += 1) {
    fs.writeFileSync(path.join(cwd, `untracked-${String(index).padStart(2, '0')}.txt`), 'do not stage\n');
  }

  const result = stageApprovedFiles({ cwd, approvedFiles: ['reviewed.txt'] });

  assert.deepEqual(git(cwd, 'diff', '--cached', '--name-only').split('\n'), ['reviewed.txt']);
  assert.equal(git(cwd, 'ls-files', '--others', '--exclude-standard').split('\n').length, 24);
  assert.equal(result.unapprovedUntracked.length, 24);
});

test('rejects dot and directory pathspecs that could recursively stage unreviewed files', () => {
  const { stageApprovedFiles } = require(guardPath);
  const cwd = makeRepo();
  fs.mkdirSync(path.join(cwd, 'reviewed-dir'));
  fs.writeFileSync(path.join(cwd, 'reviewed-dir', 'one.txt'), 'one\n');
  fs.writeFileSync(path.join(cwd, 'reviewed-dir', 'two.txt'), 'two\n');

  assert.throws(
    () => stageApprovedFiles({ cwd, approvedFiles: ['.'] }),
    /individual file path/
  );
  assert.throws(
    () => stageApprovedFiles({ cwd, approvedFiles: ['reviewed-dir'] }),
    /individual file path/
  );
  assert.equal(git(cwd, 'diff', '--cached', '--name-only'), '');
});

test('rejects glob and Git pathspec magic before they can stage multiple files', () => {
  const { stageApprovedFiles } = require(guardPath);
  const cwd = makeRepo();
  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'reviewed change\n');
  fs.writeFileSync(path.join(cwd, 'surprise.txt'), 'do not stage\n');

  assert.throws(
    () => stageApprovedFiles({ cwd, approvedFiles: ['*.txt'] }),
    /literal individual file path/
  );
  assert.throws(
    () => stageApprovedFiles({ cwd, approvedFiles: [':(glob)**'] }),
    /literal individual file path/
  );
  assert.equal(git(cwd, 'diff', '--cached', '--name-only'), '');
});

test('rename detection cannot hide an unapproved deletion behind an approved new path', () => {
  const { stageApprovedFiles } = require(guardPath);
  const cwd = makeRepo();
  fs.writeFileSync(path.join(cwd, 'old.txt'), 'rename me\n');
  git(cwd, 'add', '--', 'old.txt');
  git(cwd, 'commit', '-m', 'add old path');
  git(cwd, 'mv', 'old.txt', 'new.txt');

  assert.throws(
    () => stageApprovedFiles({ cwd, approvedFiles: ['new.txt'] }),
    /unapproved staged files: old\.txt/
  );
});

test('a deleted directory cannot recursively stage multiple deletions', () => {
  const { stageApprovedFiles } = require(guardPath);
  const cwd = makeRepo();
  fs.mkdirSync(path.join(cwd, 'reviewed-dir'));
  fs.writeFileSync(path.join(cwd, 'reviewed-dir', 'one.txt'), 'one\n');
  fs.writeFileSync(path.join(cwd, 'reviewed-dir', 'two.txt'), 'two\n');
  git(cwd, 'add', '--', 'reviewed-dir');
  git(cwd, 'commit', '-m', 'add directory');
  fs.rmSync(path.join(cwd, 'reviewed-dir'), { recursive: true });

  assert.throws(
    () => stageApprovedFiles({ cwd, approvedFiles: ['reviewed-dir'] }),
    /individual file path/
  );
  assert.equal(git(cwd, 'diff', '--cached', '--name-only'), '');
});

test('requires the explicit production SHA instead of assuming an old origin/main is production', () => {
  const { assertProductionBaseline } = require(guardPath);
  assert.equal(typeof assertProductionBaseline, 'function');
  const cwd = makeRepo();
  const oldOriginMain = git(cwd, 'rev-parse', 'HEAD');
  git(cwd, 'update-ref', 'refs/remotes/origin/main', oldOriginMain);

  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'production baseline\n');
  git(cwd, 'add', '--', 'reviewed.txt');
  git(cwd, 'commit', '-m', 'production baseline');
  const productionSha = git(cwd, 'rev-parse', 'HEAD');

  const result = assertProductionBaseline({ cwd, expectedProductionSha: productionSha });
  assert.equal(result.currentSha, productionSha);
  assert.equal(result.remoteMainSha, oldOriginMain);
  assert.throws(
    () => assertProductionBaseline({ cwd, expectedProductionSha: oldOriginMain }),
    /HEAD does not match the explicit production baseline/
  );
});

test('post-commit verification catches a hook that injects an unapproved file', () => {
  const { assertCommitMatchesApprovedFiles, stageApprovedFiles } = require(guardPath);
  assert.equal(typeof assertCommitMatchesApprovedFiles, 'function');
  const cwd = makeRepo();
  const baselineSha = git(cwd, 'rev-parse', 'HEAD');
  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'reviewed change\n');
  fs.writeFileSync(path.join(cwd, 'surprise.txt'), 'injected by hook\n');
  const staged = stageApprovedFiles({ cwd, approvedFiles: ['reviewed.txt'] });

  const hook = path.join(cwd, '.git', 'hooks', 'pre-commit');
  fs.writeFileSync(hook, '#!/bin/sh\ngit add -- surprise.txt\n');
  fs.chmodSync(hook, 0o755);
  git(cwd, 'commit', '-m', 'reviewed commit');
  const commitSha = git(cwd, 'rev-parse', 'HEAD');

  assert.throws(
    () => assertCommitMatchesApprovedFiles({
      cwd,
      baselineSha,
      commitSha,
      approvedFiles: ['reviewed.txt'],
      reviewedTreeSha: staged.reviewedTreeSha,
    }),
    /unapproved committed files: surprise\.txt/
  );
});

test('post-commit tree verification catches a hook that rewrites approved content', () => {
  const { assertCommitMatchesApprovedFiles, stageApprovedFiles } = require(guardPath);
  const cwd = makeRepo();
  const baselineSha = git(cwd, 'rev-parse', 'HEAD');
  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'reviewed change\n');
  const staged = stageApprovedFiles({ cwd, approvedFiles: ['reviewed.txt'] });
  assert.match(staged.reviewedTreeSha || '', /^[0-9a-f]{40}$/);

  const hook = path.join(cwd, '.git', 'hooks', 'pre-commit');
  fs.writeFileSync(hook, '#!/bin/sh\nprintf "tampered by hook\\n" > reviewed.txt\ngit add -- reviewed.txt\n');
  fs.chmodSync(hook, 0o755);
  git(cwd, 'commit', '-m', 'reviewed commit');
  const commitSha = git(cwd, 'rev-parse', 'HEAD');

  assert.throws(
    () => assertCommitMatchesApprovedFiles({
      cwd,
      baselineSha,
      commitSha,
      approvedFiles: ['reviewed.txt'],
      reviewedTreeSha: staged.reviewedTreeSha,
    }),
    /committed tree does not match the reviewed index tree/i
  );
});

test('post-commit verification rejects hidden add-and-revert commits in history', () => {
  const { assertCommitMatchesApprovedFiles, stageApprovedFiles } = require(guardPath);
  const cwd = makeRepo();
  const baselineSha = git(cwd, 'rev-parse', 'HEAD');
  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'reviewed change\n');
  const staged = stageApprovedFiles({ cwd, approvedFiles: ['reviewed.txt'] });
  git(cwd, 'commit', '-m', 'reviewed commit');

  fs.writeFileSync(path.join(cwd, 'secret.txt'), 'must never enter history\n');
  git(cwd, 'add', '--', 'secret.txt');
  git(cwd, 'commit', '-m', 'unapproved secret');
  fs.rmSync(path.join(cwd, 'secret.txt'));
  git(cwd, 'add', '--', 'secret.txt');
  git(cwd, 'commit', '-m', 'remove secret');
  const commitSha = git(cwd, 'rev-parse', 'HEAD');

  assert.throws(
    () => assertCommitMatchesApprovedFiles({
      cwd,
      baselineSha,
      commitSha,
      approvedFiles: ['reviewed.txt'],
      reviewedTreeSha: staged.reviewedTreeSha,
    }),
    /must be the single direct child of the production baseline/
  );
});

test('post-commit verification rejects a multi-parent merge commit', () => {
  const { assertCommitMatchesApprovedFiles, stageApprovedFiles } = require(guardPath);
  const cwd = makeRepo();
  const baselineSha = git(cwd, 'rev-parse', 'HEAD');
  git(cwd, 'switch', '-c', 'side');
  git(cwd, 'commit', '--allow-empty', '-m', 'side history');
  git(cwd, 'switch', 'main');

  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'reviewed change\n');
  const staged = stageApprovedFiles({ cwd, approvedFiles: ['reviewed.txt'] });
  git(cwd, 'commit', '-m', 'reviewed commit');
  git(cwd, 'merge', '--no-ff', 'side', '-m', 'merge side history');
  const commitSha = git(cwd, 'rev-parse', 'HEAD');

  assert.throws(
    () => assertCommitMatchesApprovedFiles({
      cwd,
      baselineSha,
      commitSha,
      approvedFiles: ['reviewed.txt'],
      reviewedTreeSha: staged.reviewedTreeSha,
    }),
    /must be the single direct child of the production baseline/
  );
});

test('an unknown push outcome stops after one trigger and requires reconciliation', () => {
  const { pushReviewedCommitOnce } = require(guardPath);
  assert.equal(typeof pushReviewedCommitOnce, 'function');
  const commitSha = 'a'.repeat(40);
  const calls = [];
  const uncertainGit = (_cwd, args) => {
    calls.push(args);
    throw new Error('connection closed before acknowledgement');
  };

  assert.throws(
    () => pushReviewedCommitOnce({ cwd: '/unused', commitSha, git: uncertainGit }),
    /outcome is unknown.*reconcile remote main and Vercel before rerunning/i
  );
  assert.deepEqual(calls, [['push', '--no-verify', 'origin', `${commitSha}:main`]]);
});

test('the regular deploy script uses reviewed-file guards and contains no add-all fallback', () => {
  const script = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'deploy-website.cjs'), 'utf8');
  assert.doesNotMatch(script, /git add -A/);
  assert.match(script, /--expected-production-sha/);
  assert.match(script, /--approved-file/);
  assert.match(script, /assertProductionBaseline/);
  assert.match(script, /stageApprovedFiles/);
  assert.match(script, /assertCommitMatchesApprovedFiles/);
  assert.match(script, /pushReviewedCommitOnce/);
  assert.ok(
    script.indexOf('assertCommitMatchesApprovedFiles({') < script.indexOf('pushReviewedCommitOnce({'),
    'post-commit verification must happen before the single push'
  );
});

test('generator errors fail closed before staging or push', () => {
  const { runGenerators } = require(path.join(__dirname, '..', 'scripts', 'deploy-website.cjs'));
  let calls = 0;
  const failingGenerator = () => {
    calls += 1;
    throw new Error('partial write then failure');
  };

  assert.throws(
    () => runGenerators('/unused', failingGenerator),
    /generator failed.*stopped before staging/i
  );
  assert.equal(calls, 1);
});
