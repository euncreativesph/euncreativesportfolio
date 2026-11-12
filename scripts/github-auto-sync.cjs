const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));

// Only these project files are uploaded automatically.
const files = ['index.html', 'style.css', 'script.js', 'README.txt',
  'scripts/github-auto-sync.cjs', '.vscode/tasks.json',
  'package.json', 'package-lock.json', 'netlify.toml', '.gitignore', 'netlify/functions', 'tests'];
const git = (...args) => execFileSync('git', args, {
  encoding: 'utf8', env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  timeout: 30000, stdio: ['ignore', 'pipe', 'pipe'],
}).trim();
let previous = '';
let changedAt = Date.now();
let retryAt = 0;
let pendingPush = true;
console.log('GitHub auto-sync active. Save a project file to upload it after 5 seconds.');

function tick() {
  try {
    if (git('branch', '--show-current') !== 'main') return;
    const status = git('status', '--porcelain', '--', ...files);
    const diff = git('diff', 'HEAD', '--', ...files);
    const fingerprint = createHash('sha256').update(status + diff).digest('hex');
    if (fingerprint !== previous) {
      previous = fingerprint;
      changedAt = Date.now();
    }
    if (Date.now() < retryAt || Date.now() - changedAt < 5000) return;
    if (status) {
      // Leave manually staged work for the user to commit.
      if (git('diff', '--cached', '--name-only')) return;
      git('add', '--', ...files);
      if (git('diff', '--cached', '--name-only')) {
        git('-c', 'user.name=euncreativesph', '-c', 'user.email=euncreatives@gmail.com',
          'commit', '-m', `Auto-save portfolio ${new Date().toISOString()}`);
        pendingPush = true;
      }
    }
    if (pendingPush) {
      git('push', 'origin', 'main');
      pendingPush = false;
      console.log(`${new Date().toLocaleTimeString()}: Saved to GitHub.`);
    }
  } catch (error) {
    console.error('Sync paused; retrying in 60 seconds:', error.stderr?.toString().trim() || error.message);
    retryAt = Date.now() + 60000;
  }
}
tick();
setInterval(tick, 2000);
