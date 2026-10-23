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
    if (args[0] === 'rev-parse') return '/nonexistent-hooks-dir/' + args[2].split('/').pop() + '\n';
    throw new Error('connection closed before acknowledgement');
  };

  assert.throws(
    () => pushReviewedCommitOnce({ cwd: '/unused', commitSha, git: uncertainGit }),
    /outcome is unknown.*reconcile remote main and Vercel before rerunning/i
  );
  assert.deepEqual(calls, [
    ['rev-parse', '--git-path', 'hooks/post-index-change'],
    ['rev-parse', '--git-path', 'hooks/pre-commit'],
    ['rev-parse', '--git-path', 'hooks/prepare-commit-msg'],
    ['rev-parse', '--git-path', 'hooks/commit-msg'],
    ['rev-parse', '--git-path', 'hooks/post-commit'],
    ['rev-parse', '--git-path', 'hooks/pre-auto-gc'],
    ['rev-parse', '--git-path', 'hooks/reference-transaction'],
    ['rev-parse', '--git-path', 'hooks/pre-push'],
    ['config', '--get', 'core.fsmonitor'],
    ['push', 'origin', `${commitSha}:main`],
  ]);
});

function makeRepoWithBareRemote() {
  const cwd = makeRepo();
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'yaopu-deploy-guard-remote-'));
  git(remote, 'init', '--bare', '-b', 'main');
  git(cwd, 'remote', 'add', 'origin', remote);
  git(cwd, 'push', 'origin', 'main');
  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'reviewed change\n');
  git(cwd, 'commit', '-am', 'reviewed commit');
  return { cwd, remote, commitSha: git(cwd, 'rev-parse', 'HEAD') };
}

function recordingGit(calls) {
  return (cwd, args) => {
    calls.push(args);
    return execFileSync('git', args, { cwd, encoding: 'utf8' });
  };
}

function writeHook(file, body = '#!/bin/sh\nexit 0\n', mode = 0o755) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  fs.chmodSync(file, mode);
}

test('the guard never passes --no-verify to git', () => {
  const source = fs.readFileSync(guardPath, 'utf8');
  assert.doesNotMatch(source, /['"]--no-verify['"]/);
});

test('an active pre-push hook stops the release before any push is attempted', () => {
  const { pushReviewedCommitOnce } = require(guardPath);
  const { cwd, remote, commitSha } = makeRepoWithBareRemote();
  const remoteBefore = git(remote, 'rev-parse', 'main');
  writeHook(path.join(cwd, '.git', 'hooks', 'pre-push'));
  const calls = [];

  assert.throws(
    () => pushReviewedCommitOnce({ cwd, commitSha, git: recordingGit(calls) }),
    /Git hook present that this release would run.*pre-push.*Stopped before push/s
  );
  assert.equal(calls.filter(args => args[0] === 'push').length, 0);
  assert.equal(git(remote, 'rev-parse', 'main'), remoteBefore);
});

test('a pre-push hook configured through a relative core.hooksPath is detected', () => {
  const { pushReviewedCommitOnce } = require(guardPath);
  const { cwd, commitSha } = makeRepoWithBareRemote();
  git(cwd, 'config', 'core.hooksPath', '.githooks');
  writeHook(path.join(cwd, '.githooks', 'pre-push'));
  const calls = [];

  assert.throws(
    () => pushReviewedCommitOnce({ cwd, commitSha, git: recordingGit(calls) }),
    /Git hook present that this release would run.*\.githooks.*pre-push/s
  );
  assert.equal(calls.filter(args => args[0] === 'push').length, 0);
});

test('a reference-transaction hook, which --no-verify cannot skip, also stops the release', () => {
  const { pushReviewedCommitOnce } = require(guardPath);
  const { cwd, commitSha } = makeRepoWithBareRemote();
  writeHook(path.join(cwd, '.git', 'hooks', 'reference-transaction'));
  const calls = [];

  assert.throws(
    () => pushReviewedCommitOnce({ cwd, commitSha, git: recordingGit(calls) }),
    /Git hook present that this release would run.*reference-transaction/s
  );
  assert.equal(calls.filter(args => args[0] === 'push').length, 0);
});

test('a hook in a linked worktree common dir is detected', () => {
  const { assertNoReleaseHooks } = require(guardPath);
  const { cwd } = makeRepoWithBareRemote();
  const linked = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'yaopu-deploy-guard-wt-')), 'wt');
  git(cwd, 'worktree', 'add', '-b', 'linked', linked);
  writeHook(path.join(cwd, '.git', 'hooks', 'pre-push'));

  assert.throws(() => assertNoReleaseHooks({ cwd: linked }), /Git hook present that this release would run/);
});

test('sample and non-executable hook files are not treated as active, matching Git', () => {
  const { assertNoReleaseHooks } = require(guardPath);
  const { cwd } = makeRepoWithBareRemote();
  writeHook(path.join(cwd, '.git', 'hooks', 'pre-push.sample'));
  writeHook(path.join(cwd, '.git', 'hooks', 'pre-push'), '#!/bin/sh\nexit 1\n', 0o644);

  assert.deepEqual(assertNoReleaseHooks({ cwd }).checkedHooks, ['post-index-change', 'pre-commit', 'prepare-commit-msg', 'commit-msg', 'post-commit', 'pre-auto-gc', 'reference-transaction', 'pre-push']);
});

test('with no push-time hooks the reviewed commit is pushed exactly once without --no-verify', () => {
  const { pushReviewedCommitOnce } = require(guardPath);
  const { cwd, remote, commitSha } = makeRepoWithBareRemote();
  const calls = [];

  const result = pushReviewedCommitOnce({ cwd, commitSha, git: recordingGit(calls) });

  assert.equal(result.triggerAccepted, true);
  assert.equal(result.deploymentStatus, 'unknown');
  assert.deepEqual(calls.filter(args => args[0] === 'push'), [['push', 'origin', `${commitSha}:main`]]);
  assert.equal(git(remote, 'rev-parse', 'main'), commitSha);
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

test('a hooksPath with a leading space is resolved exactly, not trimmed', () => {
  const { assertNoReleaseHooks } = require(guardPath);
  const { cwd } = makeRepoWithBareRemote();
  git(cwd, 'config', 'core.hooksPath', ' hooks');
  writeHook(path.join(cwd, ' hooks', 'pre-push'));
  writeHook(path.join(cwd, 'hooks', 'unrelated-decoy'));

  assert.throws(() => assertNoReleaseHooks({ cwd }), /Git hook present that this release would run.* hooks\/pre-push/s);
});

for (const hook of ['post-index-change', 'pre-commit', 'prepare-commit-msg', 'commit-msg', 'post-commit', 'pre-auto-gc']) {
  test(`a ${hook} hook, which runs before the push step, stops the release`, () => {
    const { assertNoReleaseHooks } = require(guardPath);
    const { cwd } = makeRepoWithBareRemote();
    writeHook(path.join(cwd, '.git', 'hooks', hook));

    assert.throws(
      () => assertNoReleaseHooks({ cwd, step: 'commit' }),
      new RegExp(`Git hook present that this release would run.*${hook}.*Stopped before commit`, 's')
    );
  });
}

test('the release script checks hooks after generators, right before staging, and again before committing', () => {
  const script = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'deploy-website.cjs'), 'utf8');
  const generators = script.indexOf('runGenerators(options.siteDir)');
  const stagingCheck = script.indexOf("assertNoReleaseHooks({ cwd: options.siteDir, step: 'staging' })");
  const staging = script.indexOf('stageApprovedFiles({');
  const commitCheck = script.indexOf("assertNoReleaseHooks({ cwd: options.siteDir, step: 'commit' })");
  assert.ok(generators > 0 && generators < stagingCheck, 'hook check must run after generators');
  assert.ok(stagingCheck > 0 && stagingCheck < staging, 'hook check must precede staging');
  assert.ok(commitCheck > staging && commitCheck < script.indexOf("['commit', '-m'"), 'hook check must precede git commit');
});

test('a path-valued core.fsmonitor stops the release; boolean values do not', () => {
  const { assertNoReleaseHooks } = require(guardPath);
  const { cwd } = makeRepoWithBareRemote();
  git(cwd, 'config', 'core.fsmonitor', 'false');
  assert.deepEqual(assertNoReleaseHooks({ cwd }).checkedHooks.length, 8);
  git(cwd, 'config', 'core.fsmonitor', path.join(cwd, 'fsmon.sh'));
  assert.throws(() => assertNoReleaseHooks({ cwd, step: 'staging' }), /core\.fsmonitor=.*fsmon\.sh.*Stopped before staging/s);
});

test('an approved file with a configured clean filter stops staging before git add runs it', () => {
  const { stageApprovedFiles } = require(guardPath);
  const cwd = makeRepo();
  const marker = path.join(cwd, 'filter-ran.marker');
  fs.writeFileSync(path.join(cwd, '.git', 'info', 'attributes'), 'reviewed.txt filter=probe\n');
  git(cwd, 'config', 'filter.probe.clean', `sh -c 'touch "${marker}"; cat'`);
  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'reviewed change\n');

  assert.throws(
    () => stageApprovedFiles({ cwd, approvedFiles: ['reviewed.txt'] }),
    /Approved files use a Git clean filter.*reviewed\.txt \(filter=probe\).*Stopped before staging/s
  );
  assert.equal(fs.existsSync(marker), false, 'the clean filter must not have run');
  assert.equal(git(cwd, 'diff', '--cached', '--name-only'), '');
});

test('a configured filter driver that no approved file uses does not block staging', () => {
  const { stageApprovedFiles } = require(guardPath);
  const cwd = makeRepo();
  git(cwd, 'config', 'filter.lfs.clean', 'git-lfs clean -- %f');
  git(cwd, 'config', 'filter.lfs.process', 'git-lfs filter-process');
  fs.writeFileSync(path.join(cwd, 'reviewed.txt'), 'reviewed change\n');

  const result = stageApprovedFiles({ cwd, approvedFiles: ['reviewed.txt'] });
  assert.deepEqual(result.stagedFiles, ['reviewed.txt']);
});
