const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function runGit(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function splitZero(value) {
  return value.split('\0').filter(Boolean);
}

function normalizeApprovedFiles(approvedFiles) {
  assertNonEmptyArray(approvedFiles, 'At least one --approved-file is required.');
  return [...new Set(approvedFiles.map(file => {
    const normalized = path.posix.normalize(String(file).replaceAll('\\', '/'));
    if (path.posix.isAbsolute(normalized) || normalized === '..' || normalized.startsWith('../')) {
      throw new Error(`Approved file must be repository-relative: ${file}`);
    }
    if (normalized.startsWith(':') || /[*?\[]/.test(normalized)) {
      throw new Error(`Approved entry must be a literal individual file path: ${file}`);
    }
    return normalized;
  }))];
}

function assertNonEmptyArray(value, message) {
  if (!Array.isArray(value) || value.length === 0) throw new Error(message);
}

function stageApprovedFiles({ cwd, approvedFiles, git = runGit }) {
  const approved = normalizeApprovedFiles(approvedFiles);
  for (const file of approved) {
    const absolute = path.resolve(cwd, file);
    if (file === '.' || (fs.existsSync(absolute) && fs.lstatSync(absolute).isDirectory())) {
      throw new Error(`Approved entry must be an individual file path: ${file}`);
    }
    if (!fs.existsSync(absolute)) {
      const trackedMatches = splitZero(git(cwd, ['ls-files', '-z', '--', `:(literal)${file}`]));
      if (trackedMatches.length !== 1 || trackedMatches[0] !== file) {
        throw new Error(`Approved entry must be an individual file path: ${file}`);
      }
    }
  }
  const approvedSet = new Set(approved);
  const alreadyStaged = splitZero(git(cwd, ['diff', '--cached', '--no-renames', '--name-only', '-z']));
  const unapprovedStaged = alreadyStaged.filter(file => !approvedSet.has(file));
  if (unapprovedStaged.length > 0) {
    throw new Error(`Refusing to include unapproved staged files: ${unapprovedStaged.join(', ')}`);
  }

  git(cwd, ['add', '--', ...approved.map(file => `:(literal)${file}`)]);
  const stagedFiles = splitZero(git(cwd, ['diff', '--cached', '--no-renames', '--name-only', '-z']));
  const escaped = stagedFiles.filter(file => !approvedSet.has(file));
  if (escaped.length > 0) {
    throw new Error(`Approved-file boundary was violated: ${escaped.join(', ')}`);
  }

  const untracked = splitZero(git(cwd, ['ls-files', '--others', '--exclude-standard', '-z']));
  return {
    approvedFiles: approved,
    reviewedTreeSha: git(cwd, ['write-tree']).trim(),
    stagedFiles,
    unapprovedUntracked: untracked.filter(file => !approvedSet.has(file)),
  };
}

function assertProductionBaseline({ cwd, expectedProductionSha, git = runGit }) {
  if (!/^[0-9a-f]{40}$/i.test(expectedProductionSha || '')) {
    throw new Error('A full 40-character --expected-production-sha is required.');
  }
  const currentSha = git(cwd, ['rev-parse', 'HEAD']).trim();
  if (currentSha !== expectedProductionSha) {
    throw new Error(`HEAD does not match the explicit production baseline: expected ${expectedProductionSha}, got ${currentSha}.`);
  }

  let remoteMainSha = null;
  try {
    remoteMainSha = git(cwd, ['rev-parse', '--verify', 'refs/remotes/origin/main']).trim();
  } catch {
    // Remote-tracking metadata is diagnostic only and is never a production baseline.
  }
  return { currentSha, remoteMainSha };
}

function assertCommitMatchesApprovedFiles({
  cwd,
  baselineSha,
  commitSha,
  approvedFiles,
  reviewedTreeSha,
  git = runGit,
}) {
  if (!/^[0-9a-f]{40}$/i.test(baselineSha || '') || !/^[0-9a-f]{40}$/i.test(commitSha || '')) {
    throw new Error('Full baseline and commit SHAs are required for post-commit verification.');
  }
  if (!/^[0-9a-f]{40}$/i.test(reviewedTreeSha || '')) {
    throw new Error('A full reviewed index tree SHA is required for post-commit verification.');
  }
  const commitLine = git(cwd, ['rev-list', '--parents', '-n', '1', commitSha]).trim().split(/\s+/);
  if (commitLine.length !== 2 || commitLine[0] !== commitSha || commitLine[1] !== baselineSha) {
    throw new Error(
      'Reviewed commit must be the single direct child of the production baseline.'
    );
  }
  const approved = normalizeApprovedFiles(approvedFiles);
  const approvedSet = new Set(approved);
  const committedFiles = splitZero(
    git(cwd, ['diff', '--no-renames', '--name-only', '-z', baselineSha, commitSha])
  );
  const unapproved = committedFiles.filter(file => !approvedSet.has(file));
  if (unapproved.length > 0) {
    throw new Error(`Refusing to push unapproved committed files: ${unapproved.join(', ')}`);
  }
  const missing = approved.filter(file => !committedFiles.includes(file));
  if (missing.length > 0) {
    throw new Error(`Reviewed files missing from commit: ${missing.join(', ')}`);
  }
  const committedTreeSha = git(cwd, ['rev-parse', `${commitSha}^{tree}`]).trim();
  if (committedTreeSha !== reviewedTreeSha) {
    throw new Error(
      `Committed tree does not match the reviewed index tree: expected ${reviewedTreeSha}, got ${committedTreeSha}.`
    );
  }
  return { approvedFiles: approved, committedFiles, committedTreeSha };
}

// Hooks that Git can run on the client while pushing. `pre-push` is the one
// `--no-verify` would skip; `reference-transaction` runs when the local
// remote-tracking ref is updated and cannot be skipped at all.
const PUSH_TIME_HOOKS = ['pre-push', 'reference-transaction'];

function isExecutableFile(file) {
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile()) return false;
    fs.accessSync(file, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

// Never bypass hooks and never run unreviewed ones: if any push-time hook is
// active (default hooks dir or core.hooksPath, including linked worktrees),
// stop before the push so a human can review what it does.
function assertNoPushTimeHooks({ cwd, git = runGit }) {
  const active = [];
  for (const hook of PUSH_TIME_HOOKS) {
    const resolved = path.resolve(cwd, git(cwd, ['rev-parse', '--git-path', `hooks/${hook}`]).trim());
    if (isExecutableFile(resolved)) active.push(resolved);
  }
  if (active.length > 0) {
    throw new Error(
      `Push-time Git hook present (${active.join(', ')}); review it before release. ` +
      'The guard does not bypass hooks with --no-verify and does not run unreviewed hooks. No push was attempted.'
    );
  }
  return { checkedHooks: [...PUSH_TIME_HOOKS] };
}

function pushReviewedCommitOnce({ cwd, commitSha, git = runGit }) {
  if (!/^[0-9a-f]{40}$/i.test(commitSha || '')) {
    throw new Error('A full reviewed commit SHA is required before push.');
  }
  assertNoPushTimeHooks({ cwd, git });
  try {
    const output = git(cwd, ['push', 'origin', `${commitSha}:main`]);
    return { triggerAccepted: true, deploymentStatus: 'unknown', output: output.trim() };
  } catch (error) {
    const wrapped = new Error(
      'Push outcome is unknown; no retry was attempted. Reconcile remote main and Vercel before rerunning.'
    );
    wrapped.cause = error;
    throw wrapped;
  }
}

module.exports = {
  assertCommitMatchesApprovedFiles,
  assertNoPushTimeHooks,
  assertProductionBaseline,
  pushReviewedCommitOnce,
  stageApprovedFiles,
};
