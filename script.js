/* ════════════════════════════════════════════════
   GITCLUB — SCRIPT.JS
   Progress tracking, quizzes, activities, mascot
════════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
let state = loadState() || {
  xp: 0,
  level: 1,
  streak: 0,
  lastVisit: null,
  modulesCompleted: [],
  quizzesCompleted: {},
  badgesEarned: [],
  leaderboard: [],
  currentUser: null
};

const LEVELS = [
  { name: 'Newbie',       min: 0   },
  { name: 'Git Starter',  min: 100 },
  { name: 'Committer',    min: 250 },
  { name: 'Brancher',     min: 450 },
  { name: 'Merger',       min: 700 },
  { name: 'PR Hero',      min: 1000},
  { name: 'Collaborator', min: 1400},
  { name: 'Open Sourcer', min: 1900},
  { name: 'Git Master',   min: 2500},
  { name: 'Octocat 🐱',   min: 3200}
];

const MASCOT_TIPS = [
  "Hey! I'm <b>Gitto</b> 🐱 Your GitHub guide! Let's start your journey!",
  "Git was created by <b>Linus Torvalds</b> in 2005 — the same person who made Linux! 🐧",
  "Every commit is like a <b>save point</b> in a video game. You can always go back! 🎮",
  "Branches are like <b>parallel universes</b> for your code. Experiment freely! 🌿",
  "A pull request is how developers say: <b>'I made something cool, please merge it!'</b> 🙏",
  "🔥 Pro tip: Always write <b>meaningful commit messages</b>. Future you will thank present you!",
  "Git <b>stash</b> is like a clipboard for your work-in-progress. Super useful! 📋",
  "GitHub has <b>100+ million repositories</b>! Your next favorite tool is probably on there! 🌍",
  "You're doing amazing! Keep going, every module brings you closer to <b>GitHub mastery</b>! 🏆"
];

let mascotTipIndex = 0;

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  updateStreak();
  renderDashboard();
  renderModuleDots();
  renderBadges();
  renderLeaderboard();
  renderRoadmap();
  updateNavXP();
  initTerminalTyping();
  initNavHighlight();
  initMascot();
});

function loadState() {
  try {
    const s = localStorage.getItem('gitclub_state');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function saveState() {
  try { localStorage.setItem('gitclub_state', JSON.stringify(state)); }
  catch {}
}

// ══════════════════════════════════════════════
// STREAK
// ══════════════════════════════════════════════
function updateStreak() {
  const today = new Date().toDateString();
  if (state.lastVisit === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (state.lastVisit === yesterday) {
    state.streak = (state.streak || 0) + 1;
  } else if (state.lastVisit !== today) {
    state.streak = 1;
  }
  state.lastVisit = today;
  if (state.streak >= 3) earnBadge('streak-3');
  saveState();
}

// ══════════════════════════════════════════════
// XP & LEVELS
// ══════════════════════════════════════════════
function addXP(amount, x, y) {
  state.xp += amount;
  const oldLevel = state.level;
  state.level = getLevelIndex();
  if (state.level > oldLevel) {
    showToast(`🎉 Level Up! You're now a ${LEVELS[state.level].name}!`);
    changeMascotTip(`Wow, you leveled up! You're now a <b>${LEVELS[state.level].name}</b>! Amazing work! 🎉`);
  }
  saveState();
  renderDashboard();
  updateNavXP();
  if (x !== undefined && y !== undefined) spawnXPPop(amount, x, y);
}

function getLevelIndex() {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (state.xp >= LEVELS[i].min) idx = i;
  }
  return idx;
}

function getLevelName() { return LEVELS[getLevelIndex()].name; }

function getXPToNext() {
  const idx = getLevelIndex();
  if (idx >= LEVELS.length - 1) return { current: state.xp, next: state.xp, pct: 100 };
  const curr = LEVELS[idx].min;
  const next = LEVELS[idx + 1].min;
  const pct = Math.min(100, Math.round((state.xp - curr) / (next - curr) * 100));
  return { current: state.xp - curr, next: next - curr, pct };
}

function spawnXPPop(amount, x, y) {
  const el = document.createElement('div');
  el.className = 'xp-pop';
  el.textContent = `+${amount} XP ⚡`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

// ══════════════════════════════════════════════
// DASHBOARD RENDER
// ══════════════════════════════════════════════
function renderDashboard() {
  document.getElementById('dash-xp').textContent = state.xp;
  document.getElementById('dash-streak').textContent = `${state.streak || 0} day${state.streak !== 1 ? 's' : ''}`;
  document.getElementById('dash-level').textContent = getLevelName();
  document.getElementById('dash-done').textContent = state.modulesCompleted.length;

  const { current, next, pct } = getXPToNext();
  document.getElementById('xp-bar').style.width = `${pct}%`;
  document.getElementById('xp-to-next').textContent = `${current} / ${next} XP to next level`;

  const idx = getLevelIndex();
  const nextName = idx < LEVELS.length - 1 ? `Next: ${LEVELS[idx + 1].name}` : '👑 Max Level!';
  document.getElementById('dash-next-level').textContent = nextName;
}

function updateNavXP() {
  document.getElementById('nav-xp-display').textContent = `⚡ ${state.xp} XP`;
  document.getElementById('nav-level').textContent = `Lv.${getLevelIndex() + 1}`;
}

function renderModuleDots() {
  const container = document.getElementById('module-dots');
  container.innerHTML = '';
  for (let i = 0; i < 14; i++) {
    const dot = document.createElement('div');
    dot.className = 'module-dot' + (state.modulesCompleted.includes(i) ? ' done' : '');
    container.appendChild(dot);
  }
}

function renderBadges() {
  document.querySelectorAll('.badge').forEach(b => {
    const id = b.dataset.badge;
    if (state.badgesEarned.includes(id)) {
      b.classList.remove('locked');
      b.classList.add('earned');
    }
  });
}

function renderRoadmap() {
  document.querySelectorAll('.road-node').forEach(node => {
    const m = parseInt(node.dataset.module);
    node.classList.remove('done', 'active');
    if (state.modulesCompleted.includes(m)) {
      node.classList.add('done');
    } else if (!state.modulesCompleted.includes(m) &&
               (m === 0 || state.modulesCompleted.includes(m - 1))) {
      node.classList.add('active');
    }
    node.addEventListener('click', () => openModule(m));
  });
}

function renderLeaderboard() {
  const rows = document.getElementById('lb-rows');
  const sorted = [...state.leaderboard].sort((a, b) => b.xp - a.xp);
  rows.innerHTML = sorted.map((p, i) => `
    <div class="lb-row">
      <span class="lb-rank">${['🥇','🥈','🥉'][i] || (i+1)}</span>
      <span class="lb-name">${escapeHtml(p.name)}</span>
      <span class="lb-xp">${p.xp} XP</span>
      <span class="lb-level">${p.level}</span>
      <span class="lb-modules">${p.modules}/14</span>
    </div>
  `).join('');
}

// ══════════════════════════════════════════════
// BADGES
// ══════════════════════════════════════════════
function earnBadge(id) {
  if (state.badgesEarned.includes(id)) return;
  state.badgesEarned.push(id);
  saveState();
  renderBadges();
  const badgeEl = document.querySelector(`.badge[data-badge="${id}"]`);
  const badgeName = badgeEl ? badgeEl.textContent : 'Badge';
  showToast(`🎖️ New Badge: ${badgeName}!`);
  changeMascotTip(`You earned the <b>${badgeName}</b> badge! You're on fire! 🏅`);
}

// ══════════════════════════════════════════════
// MASCOT
// ══════════════════════════════════════════════
function initMascot() {
  const btn = document.getElementById('mascot-next-btn');
  btn.addEventListener('click', nextMascotTip);
  document.getElementById('mascot').addEventListener('click', nextMascotTip);
}

function nextMascotTip() {
  mascotTipIndex = (mascotTipIndex + 1) % MASCOT_TIPS.length;
  changeMascotTip(MASCOT_TIPS[mascotTipIndex]);
}

function changeMascotTip(text) {
  const el = document.getElementById('mascot-text');
  el.style.opacity = '0';
  setTimeout(() => {
    el.innerHTML = text;
    el.style.opacity = '1';
    el.style.transition = 'opacity 0.3s';
  }, 200);
}

// ══════════════════════════════════════════════
// TERMINAL TYPING ANIMATION (hero)
// ══════════════════════════════════════════════
const terminalLines = [
  { cmd: 'git init my-awesome-project', delay: 0, outputs: [
    { text: 'Initialized empty Git repository in my-awesome-project/.git/', cls: 'ok', d: 500 }
  ]},
  { cmd: 'git add .', delay: 1800, outputs: [] },
  { cmd: 'git commit -m "first commit 🎉"', delay: 3000, outputs: [
    { text: '[main (root-commit) a1b2c3d] first commit 🎉', cls: 'ok', d: 300 },
    { text: ' 3 files changed, 42 insertions(+)', cls: 'info', d: 500 }
  ]},
  { cmd: 'git push origin main', delay: 5200, outputs: [
    { text: 'Enumerating objects: 5, done.', cls: 'out', d: 200 },
    { text: 'Writing objects: 100% (5/5), done.', cls: 'ok', d: 400 },
    { text: '✓ Pushed to github.com/you/my-awesome-project', cls: 'highlight', d: 600 }
  ]}
];

function initTerminalTyping() {
  const cmdEl = document.querySelector('.typing-text');
  const outputEl = document.getElementById('term-output');
  if (!cmdEl) return;

  let lineIdx = 0;
  function runLine() {
    if (lineIdx >= terminalLines.length) {
      setTimeout(() => {
        cmdEl.textContent = '';
        outputEl.innerHTML = '';
        lineIdx = 0;
        runLine();
      }, 3000);
      return;
    }
    const line = terminalLines[lineIdx];
    typeText(cmdEl, line.cmd, 60, () => {
      line.outputs.forEach((out, i) => {
        setTimeout(() => {
          const span = document.createElement('span');
          span.className = `t-line ${out.cls}`;
          span.textContent = out.text;
          span.style.animationDelay = '0s';
          outputEl.appendChild(span);
        }, out.d);
      });
      const totalDelay = line.outputs.reduce((m, o) => Math.max(m, o.d), 0) + 400;
      setTimeout(() => {
        cmdEl.textContent = '';
        outputEl.innerHTML = '';
        lineIdx++;
        runLine();
      }, line.delay + totalDelay);
    });
  }
  setTimeout(runLine, 800);
}

function typeText(el, text, speed, cb) {
  let i = 0;
  el.textContent = '';
  const iv = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) { clearInterval(iv); if (cb) cb(); }
  }, speed);
}

// ══════════════════════════════════════════════
// NAV HIGHLIGHT
// ══════════════════════════════════════════════
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
}

// ══════════════════════════════════════════════
// MODULE CONTENT DATA
// ══════════════════════════════════════════════
const MODULE_DATA = [
  // 0: What is Git & GitHub?
  {
    icon: '🌍', title: 'What is Git & GitHub?', xp: 50,
    content: `
<div class="mod-section">
  <div class="mod-section-title">🤔 Why does version control exist?</div>
  <p class="mod-text">Imagine you're writing a school project. You save it as <code>project.doc</code>, then <code>project_final.doc</code>, then <code>project_final_REAL.doc</code>… Sound familiar? Version control solves this problem!</p>
  <div class="mod-tip">Version control is a system that records changes to your files over time so you can recall specific versions later.</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔧 What is Git?</div>
  <p class="mod-text">Git is a <strong>tool that runs on your computer</strong>. It tracks every change you make to your code. It was created by Linus Torvalds in 2005 — the same person who created Linux!</p>
  <p class="mod-text">Git is completely free and open source. It works offline on your computer.</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🐙 What is GitHub?</div>
  <p class="mod-text">GitHub is a <strong>website (github.com)</strong> where you can store your Git projects online. It's like Google Drive, but specifically built for code with amazing collaboration features.</p>
  <div class="mod-tip">Git = the tool on your computer. GitHub = the website in the cloud. They work together but are separate things!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🏢 Who uses GitHub?</div>
  <p class="mod-text">Literally everyone! Microsoft, Google, Facebook, NASA, and millions of developers worldwide. Even the code for <strong>VS Code, Linux, Python, React</strong> — all live on GitHub for anyone to see!</p>
  <div class="mod-tip">GitHub has over 100 million developers and 400+ million repositories. It's the world's largest code host!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">⚡ Real World Analogy</div>
  <p class="mod-text">Think of it this way:</p>
  <p class="mod-text">🖊️ <strong>Git</strong> = The pen you write with</p>
  <p class="mod-text">📚 <strong>GitHub</strong> = The library where your books are stored and shared</p>
</div>
    `
  },

  // 1: Setup
  {
    icon: '⚙️', title: 'Setup & Installation', xp: 50,
    content: `
<div class="mod-section">
  <div class="mod-section-title">💻 Installing Git</div>
  <p class="mod-text"><strong>Windows:</strong> Download from git-scm.com, run installer</p>
  <p class="mod-text"><strong>Mac:</strong> Open terminal, type <code>git --version</code> — if not installed, it'll prompt you</p>
  <p class="mod-text"><strong>Linux (Ubuntu):</strong></p>
  <div class="mod-code-block">sudo apt update
sudo apt install git</div>
  <p class="mod-text">Verify installation:</p>
  <div class="mod-code-block">git --version
<span class="comment"># Should show: git version 2.x.x</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">👤 Configure Your Identity</div>
  <p class="mod-text">Before you can make commits, Git needs to know who you are. This is a one-time setup:</p>
  <div class="mod-code-block">git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global core.editor "code --wait"  <span class="comment"># Use VS Code</span></div>
  <div class="mod-tip">The --global flag means this applies to ALL your projects. Use --local to set it for just one project.</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔑 Setting Up SSH Keys (Recommended)</div>
  <p class="mod-text">SSH keys let you push to GitHub without typing your password every time!</p>
  <div class="mod-code-block"><span class="comment"># 1. Generate SSH key</span>
ssh-keygen -t ed25519 -C "your@email.com"

<span class="comment"># 2. Copy the public key</span>
cat ~/.ssh/id_ed25519.pub

<span class="comment"># 3. Go to GitHub → Settings → SSH Keys → New SSH Key</span>
<span class="comment"># 4. Paste the key and save</span>

<span class="comment"># 5. Test the connection</span>
ssh -T git@github.com</div>
  <div class="mod-tip">After SSH setup, use git@github.com:username/repo.git URLs instead of https:// ones!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">✅ Check Your Config</div>
  <div class="mod-code-block">git config --list
<span class="comment"># Shows all your git settings</span></div>
</div>
    `
  },

  // 2: Repositories
  {
    icon: '📁', title: 'Repositories', xp: 60,
    content: `
<div class="mod-section">
  <div class="mod-section-title">📁 What is a Repository?</div>
  <p class="mod-text">A repository (repo) is a folder that Git is tracking. It contains your project files plus a hidden <code>.git</code> folder where Git stores all its tracking data.</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🆕 Creating a New Repository</div>
  <p class="mod-text"><strong>Method 1: Start locally</strong></p>
  <div class="mod-code-block">mkdir my-project      <span class="comment"># Create folder</span>
cd my-project         <span class="comment"># Enter folder</span>
git init              <span class="comment"># Initialize git here</span>
<span class="comment"># Output: Initialized empty Git repository in .git/</span></div>
  <p class="mod-text"><strong>Method 2: Create on GitHub first</strong> (recommended for beginners)</p>
  <p class="mod-text">1. Go to github.com → click "New repository"<br/>
  2. Fill in name, description<br/>
  3. Tick "Add README" and click Create<br/>
  4. Then clone it to your computer</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">📖 The README.md File</div>
  <p class="mod-text">README.md is the front page of your project. It's written in Markdown and shown on your GitHub page.</p>
  <div class="mod-code-block"># My Project Name

A short description of what this does.

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
Run with: \`node index.js\`

## License
MIT</div>
  <div class="mod-tip">A good README makes your project look professional and helps others use it!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🙈 The .gitignore File</div>
  <p class="mod-text">Tell Git which files to NEVER track. This is important for security and keeping your repo clean.</p>
  <div class="mod-code-block"><span class="comment"># Common things to ignore:</span>
node_modules/       <span class="comment"># Huge folder, not needed</span>
.env                <span class="comment"># Secret keys!</span>
.DS_Store           <span class="comment"># Mac system files</span>
*.log               <span class="comment"># Log files</span>
dist/               <span class="comment"># Build output</span></div>
  <div class="mod-danger">Never commit .env files or API keys to GitHub! Anyone can see them!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">📜 Licenses</div>
  <p class="mod-text">A license tells others what they can and can't do with your code:</p>
  <p class="mod-text">🟢 <strong>MIT</strong> — Do anything, just credit me</p>
  <p class="mod-text">🔵 <strong>Apache 2.0</strong> — Like MIT but with patent protection</p>
  <p class="mod-text">🔴 <strong>GPL</strong> — You can use it, but derivative work must also be open source</p>
</div>
    `
  },

  // 3: Commits
  {
    icon: '📸', title: 'Commits & Snapshots', xp: 60,
    content: `
<div class="mod-section">
  <div class="mod-section-title">🔄 The Git Workflow</div>
  <p class="mod-text">Git has 3 areas you need to understand:</p>
  <p class="mod-text">1️⃣ <strong>Working Directory</strong> — Your actual files (what you edit)</p>
  <p class="mod-text">2️⃣ <strong>Staging Area (Index)</strong> — Files you've marked to include in the next commit</p>
  <p class="mod-text">3️⃣ <strong>Repository</strong> — The permanent history of all commits</p>
  <div class="mod-tip">Think: Edit → Stage → Commit. Like packing a box: choose items → tape the box → ship it!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">📊 Checking Status</div>
  <div class="mod-code-block">git status
<span class="comment"># Shows what's changed, what's staged, what's untracked</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">➕ Staging Files</div>
  <div class="mod-code-block">git add filename.txt     <span class="comment"># Stage one file</span>
git add *.js             <span class="comment"># Stage all .js files</span>
git add .                <span class="comment"># Stage ALL changes</span>
git add -p               <span class="comment"># Interactively choose what to stage</span>

git restore --staged file.txt  <span class="comment"># Unstage a file</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">💾 Making Commits</div>
  <div class="mod-code-block">git commit -m "Add login button to homepage"
git commit -am "Fix typo"    <span class="comment"># Stage + commit tracked files</span>
git commit --amend           <span class="comment"># Fix the last commit message</span></div>
  <div class="mod-tip">Write commits like filling in a sentence: "This commit will ___". Use present tense! E.g., "Add login feature" not "Added login feature"</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">📜 Viewing History</div>
  <div class="mod-code-block">git log                   <span class="comment"># Full history</span>
git log --oneline         <span class="comment"># Short summary</span>
git log --oneline --graph <span class="comment"># Visual branch tree</span>
git show a1b2c3d          <span class="comment"># See a specific commit</span>
git diff                  <span class="comment"># What changed (unstaged)</span>
git diff --staged         <span class="comment"># What changed (staged)</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">⏪ Going Back in Time</div>
  <div class="mod-code-block">git restore file.txt       <span class="comment"># Discard changes in file</span>
git reset HEAD~1           <span class="comment"># Undo last commit, keep changes</span>
git reset --hard HEAD~1    <span class="comment"># Undo last commit AND changes</span>
git revert a1b2c3d         <span class="comment"># Safely undo a commit (adds new commit)</span></div>
  <div class="mod-danger">git reset --hard permanently deletes your uncommitted changes. Use with caution!</div>
</div>
    `
  },

  // 4: Branches
  {
    icon: '🌿', title: 'Branches', xp: 70,
    content: `
<div class="mod-section">
  <div class="mod-section-title">🌿 Why Branches?</div>
  <p class="mod-text">Branches let you work on different features or fixes <strong>in parallel</strong>, without affecting the main working code. It's like having multiple parallel timelines!</p>
  <p class="mod-text">The default branch is called <code>main</code> (or <code>master</code> in older repos). It should always contain working code.</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔧 Branch Commands</div>
  <div class="mod-code-block">git branch                    <span class="comment"># List branches (current has *)</span>
git branch feature-login      <span class="comment"># Create new branch</span>
git switch feature-login      <span class="comment"># Switch to branch</span>
git switch -c new-feature     <span class="comment"># Create AND switch</span>
git branch -d feature-login   <span class="comment"># Delete merged branch</span>
git branch -D feature-login   <span class="comment"># Force delete (unmerged)</span>
git branch -m old-name new-name  <span class="comment"># Rename branch</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">📏 Branch Naming Conventions</div>
  <p class="mod-text">Good branch names are descriptive and follow a pattern:</p>
  <div class="mod-code-block">feature/user-authentication     <span class="comment"># New features</span>
fix/login-button-crash          <span class="comment"># Bug fixes</span>
hotfix/security-patch           <span class="comment"># Urgent fixes</span>
docs/update-readme              <span class="comment"># Documentation</span>
refactor/clean-api-code         <span class="comment"># Code cleanup</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🌳 Typical Branching Workflow</div>
  <div class="mod-code-block"><span class="comment"># 1. Start on main, make sure it's up to date</span>
git switch main
git pull

<span class="comment"># 2. Create a feature branch</span>
git switch -c feature/dark-mode

<span class="comment"># 3. Make your changes and commit</span>
git add .
git commit -m "Add dark mode toggle"

<span class="comment"># 4. Push branch to GitHub</span>
git push origin feature/dark-mode

<span class="comment"># 5. Open a Pull Request on GitHub</span>
<span class="comment"># 6. After review, merge to main</span>
<span class="comment"># 7. Delete the feature branch</span>
git branch -d feature/dark-mode</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔍 Viewing Branches on GitHub</div>
  <p class="mod-text">On GitHub, you can see all branches under the branch dropdown. You can also compare branches, see how far ahead/behind they are, and open pull requests directly from the interface.</p>
</div>
    `
  },

  // 5: Merging
  {
    icon: '🔀', title: 'Merging & Conflicts', xp: 80,
    content: `
<div class="mod-section">
  <div class="mod-section-title">🔀 What is Merging?</div>
  <p class="mod-text">Merging combines the changes from one branch into another. When your feature is ready, you merge it into main.</p>
  <div class="mod-code-block"><span class="comment"># Merge feature-branch INTO main:</span>
git switch main
git merge feature/dark-mode</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">⚡ Fast-Forward vs 3-Way Merge</div>
  <p class="mod-text"><strong>Fast-Forward:</strong> If main hasn't changed since you branched, Git just moves the pointer forward. Clean and simple!</p>
  <p class="mod-text"><strong>3-Way Merge:</strong> If both branches have new commits, Git creates a "merge commit" that combines both histories.</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">⚔️ Merge Conflicts</div>
  <p class="mod-text">A conflict happens when two branches changed the <strong>same line</strong> in the same file. Git doesn't know which version to keep, so it asks YOU!</p>
  <div class="mod-code-block"><span class="comment"># Git marks the conflict like this:</span>
&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD (your current branch)
const color = "blue";
=======
const color = "red";
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/colors (incoming branch)</div>
  <p class="mod-text">You need to:</p>
  <p class="mod-text">1. Open the file and decide which version to keep</p>
  <p class="mod-text">2. Remove the conflict markers (&lt;&lt;&lt;, ===, &gt;&gt;&gt;)</p>
  <p class="mod-text">3. Stage and commit the resolved file</p>
  <div class="mod-code-block">git add resolved-file.js
git commit -m "Resolve merge conflict in colors"</div>
  <div class="mod-tip">VS Code, GitHub Desktop, and WebStorm all have great visual conflict resolvers that make this much easier!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔄 Rebase (Advanced)</div>
  <p class="mod-text">Rebase is another way to integrate changes. Instead of merging, it re-applies your commits on top of another branch, creating a cleaner, linear history.</p>
  <div class="mod-code-block">git switch feature/my-work
git rebase main    <span class="comment"># Re-apply your commits on top of main</span></div>
  <div class="mod-danger">Never rebase public branches that others are working on! Only rebase your own private branches.</div>
</div>
    `
  },

  // 6: Remote
  {
    icon: '☁️', title: 'Remote & Push/Pull', xp: 70,
    content: `
<div class="mod-section">
  <div class="mod-section-title">☁️ Local vs Remote</div>
  <p class="mod-text"><strong>Local</strong> = Your computer. <strong>Remote</strong> = GitHub (or any server). Git tracks the connection between them.</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔗 Managing Remotes</div>
  <div class="mod-code-block">git remote -v                    <span class="comment"># Show connected remotes</span>
git remote add origin &lt;url&gt;     <span class="comment"># Add a remote named "origin"</span>
git remote remove origin         <span class="comment"># Remove a remote</span>
git remote rename origin new-name  <span class="comment"># Rename it</span></div>
  <div class="mod-tip">"origin" is just a nickname for your GitHub repo URL. You can name it anything, but "origin" is the convention.</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">⬆️ Pushing</div>
  <div class="mod-code-block">git push origin main             <span class="comment"># Push main branch</span>
git push origin feature/login    <span class="comment"># Push a feature branch</span>
git push -u origin main          <span class="comment"># Set upstream (do once)</span>
git push                         <span class="comment"># After -u, just use this</span>
git push --force                 <span class="comment"># Dangerous! Overwrites remote</span></div>
  <div class="mod-danger">Never force push to main/master on shared repos. It rewrites history and breaks everyone else's local copy!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">⬇️ Pulling & Fetching</div>
  <div class="mod-code-block">git pull                <span class="comment"># Fetch + merge in one step</span>
git pull origin main    <span class="comment"># Pull specific branch</span>

git fetch               <span class="comment"># Download changes WITHOUT merging</span>
git fetch origin        <span class="comment"># Fetch from origin remote</span></div>
  <div class="mod-tip">git pull = git fetch + git merge. Use git fetch when you want to see what changed before applying it.</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔄 Connecting First Time</div>
  <div class="mod-code-block"><span class="comment"># If you created repo locally first:</span>
git remote add origin git@github.com:you/repo.git
git branch -M main
git push -u origin main</div>
</div>
    `
  },

  // 7: Pull Requests
  {
    icon: '🔁', title: 'Pull Requests', xp: 80,
    content: `
<div class="mod-section">
  <div class="mod-section-title">🔁 What is a Pull Request?</div>
  <p class="mod-text">A Pull Request (PR) is a way to tell others about changes you want to merge into a project. It's the core of GitHub collaboration — you push a branch, open a PR, someone reviews it, and then it gets merged.</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🚀 Opening a PR</div>
  <p class="mod-text">1. Push your branch to GitHub: <code>git push origin feature/my-feature</code></p>
  <p class="mod-text">2. Go to your repo on github.com</p>
  <p class="mod-text">3. Click the yellow banner "Compare & pull request"</p>
  <p class="mod-text">4. Write a clear title and description</p>
  <p class="mod-text">5. Assign reviewers, labels, milestone</p>
  <p class="mod-text">6. Click "Create pull request"</p>
  <div class="mod-tip">Use PR templates! Add a .github/PULL_REQUEST_TEMPLATE.md to your repo and every PR will auto-fill a checklist!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔍 Reviewing a PR</div>
  <p class="mod-text">Reviewers can:</p>
  <p class="mod-text">💬 <strong>Comment</strong> — Ask questions or suggest improvements</p>
  <p class="mod-text">✅ <strong>Approve</strong> — Give a thumbs up to merge</p>
  <p class="mod-text">🔄 <strong>Request changes</strong> — Ask the author to fix things first</p>
  <div class="mod-code-block"><span class="comment"># After feedback, update your PR:</span>
git add .
git commit -m "Address review comments"
git push origin feature/my-feature
<span class="comment"># PR automatically updates!</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">✅ Merging a PR</div>
  <p class="mod-text"><strong>Merge commit</strong> — Creates a merge commit, preserves full history</p>
  <p class="mod-text"><strong>Squash and merge</strong> — All PR commits become one. Clean history!</p>
  <p class="mod-text"><strong>Rebase and merge</strong> — Linear history, no merge commit</p>
  <div class="mod-tip">After merging, always delete the branch. GitHub will show a "Delete branch" button — use it to keep your repo tidy!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">📝 Writing a Good PR Description</div>
  <div class="mod-code-block">## What this PR does
Adds a dark mode toggle to the settings page.

## Why
Users requested dark mode. Reduces eye strain at night.

## How to test
1. Go to Settings page
2. Toggle "Dark mode" switch
3. UI should switch to dark theme

## Screenshots
[Add before/after screenshots here]

## Checklist
- [x] Tests pass
- [x] No console errors
- [x] Mobile responsive</div>
</div>
    `
  },

  // 8: Fork & Clone
  {
    icon: '🍴', title: 'Fork & Clone', xp: 60,
    content: `
<div class="mod-section">
  <div class="mod-section-title">🍴 What is Forking?</div>
  <p class="mod-text">Forking creates your own copy of someone else's repository on YOUR GitHub account. You can make any changes without affecting the original project.</p>
  <p class="mod-text">Use case: You want to contribute to an open-source project you don't own.</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔄 Fork Workflow</div>
  <p class="mod-text">1. Go to a repo on GitHub (e.g., facebook/react)</p>
  <p class="mod-text">2. Click "Fork" button (top right)</p>
  <p class="mod-text">3. It creates you/react in your account</p>
  <p class="mod-text">4. Clone YOUR fork to your computer</p>
  <p class="mod-text">5. Make changes, push to your fork</p>
  <p class="mod-text">6. Open PR from your fork to the original</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">📥 Cloning</div>
  <p class="mod-text">Cloning downloads a repository to your computer. Unlike forking (which is on GitHub), cloning brings it locally.</p>
  <div class="mod-code-block">git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git     <span class="comment"># SSH version</span>
git clone &lt;url&gt; my-folder-name             <span class="comment"># Clone into specific folder</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔗 Keeping Fork in Sync</div>
  <div class="mod-code-block"><span class="comment"># Add original repo as "upstream"</span>
git remote add upstream https://github.com/original/repo.git

<span class="comment"># Fetch latest from original</span>
git fetch upstream

<span class="comment"># Merge upstream changes into your main</span>
git switch main
git merge upstream/main

<span class="comment"># Push updated main to your fork</span>
git push origin main</div>
  <div class="mod-tip">Always sync your fork before starting new work, so you're building on the latest code!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🆚 Fork vs Clone</div>
  <p class="mod-text">🍴 <strong>Fork</strong> = Copy on GitHub (server-side). For contributing to others' projects.</p>
  <p class="mod-text">📥 <strong>Clone</strong> = Copy on your computer (local). For working on any project locally.</p>
  <p class="mod-text">You usually do BOTH: fork first, then clone your fork!</p>
</div>
    `
  },

  // 9: Issues & Projects
  {
    icon: '📋', title: 'Issues & Projects', xp: 60,
    content: `
<div class="mod-section">
  <div class="mod-section-title">🐛 What are Issues?</div>
  <p class="mod-text">Issues are GitHub's way of tracking bugs, feature requests, and tasks. Think of it as a to-do list that everyone on the project can see and contribute to.</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">✍️ Creating a Good Issue</div>
  <p class="mod-text">A great bug report includes:</p>
  <div class="mod-code-block">**Bug Report: Login fails on mobile**

**Describe the bug**
When clicking "Login" on mobile Safari, nothing happens.

**Steps to reproduce**
1. Open site on iPhone Safari
2. Enter valid credentials
3. Click Login button
4. Expected: redirect to dashboard
5. Actual: page stays on login screen

**Environment**
- iOS 17.2, Safari 17
- iPhone 14 Pro

**Screenshots**
[screenshot here]</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🏷️ Labels & Assignees</div>
  <p class="mod-text">Organize issues with labels:</p>
  <p class="mod-text">🐛 <strong>bug</strong> — Something is broken</p>
  <p class="mod-text">✨ <strong>enhancement</strong> — A new feature</p>
  <p class="mod-text">📖 <strong>documentation</strong> — Docs need updating</p>
  <p class="mod-text">🟢 <strong>good first issue</strong> — Good for newcomers</p>
  <p class="mod-text">🆘 <strong>help wanted</strong> — Need contributors</p>
  <div class="mod-tip">Assigning issues to people makes it clear who is responsible for what! Click "Assignees" on any issue.</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">📊 GitHub Projects (Kanban Board)</div>
  <p class="mod-text">GitHub Projects is like Trello — a visual board to organize your work:</p>
  <p class="mod-text">📥 <strong>To Do</strong> → 🔄 <strong>In Progress</strong> → ✅ <strong>Done</strong></p>
  <p class="mod-text">Drag and drop issues between columns as work progresses!</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔗 Linking Issues to PRs</div>
  <div class="mod-code-block"><span class="comment"># In PR description, use magic keywords:</span>
Closes #42       <span class="comment"># Auto-closes issue #42 when PR merges</span>
Fixes #15        <span class="comment"># Same effect</span>
Resolves #7      <span class="comment"># Same effect</span></div>
  <div class="mod-tip">When you use "Closes #42" in your PR and it merges, issue #42 automatically gets closed! Magic! ✨</div>
</div>
    `
  },

  // 10: GitHub Actions
  {
    icon: '⚡', title: 'GitHub Actions', xp: 100,
    content: `
<div class="mod-section">
  <div class="mod-section-title">⚡ What are GitHub Actions?</div>
  <p class="mod-text">GitHub Actions is an automation platform built into GitHub. It lets you automatically run tasks when certain events happen — like when someone pushes code or opens a PR.</p>
  <div class="mod-tip">CI/CD = Continuous Integration / Continuous Deployment. Fancy terms for "automatically test and deploy your code"!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">📄 Workflow File Structure</div>
  <p class="mod-text">Workflows are YAML files stored in <code>.github/workflows/</code></p>
  <div class="mod-code-block"><span class="comment"># .github/workflows/test.yml</span>
name: Run Tests           <span class="comment"># Workflow name</span>

on:                       <span class="comment"># WHEN to run</span>
  push:
    branches: [main]
  pull_request:

jobs:                     <span class="comment"># WHAT to do</span>
  test:
    runs-on: ubuntu-latest   <span class="comment"># Machine to use</span>
    steps:
      - uses: actions/checkout@v4     <span class="comment"># Get your code</span>
      - uses: actions/setup-node@v4   <span class="comment"># Install Node.js</span>
        with:
          node-version: '20'
      - run: npm install              <span class="comment"># Install dependencies</span>
      - run: npm test                 <span class="comment"># Run your tests</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🎯 Common Triggers</div>
  <div class="mod-code-block">on: push           <span class="comment"># On any push</span>
on: pull_request   <span class="comment"># On PR opened/updated</span>
on:
  schedule:
    - cron: '0 9 * * 1'   <span class="comment"># Every Monday at 9am</span>
on: workflow_dispatch      <span class="comment"># Manual trigger button</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🌐 Deploy to GitHub Pages</div>
  <div class="mod-code-block">name: Deploy to Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🛒 GitHub Actions Marketplace</div>
  <p class="mod-text">There are thousands of pre-built actions you can use:</p>
  <p class="mod-text">📧 Send email notifications • 🐦 Tweet on deploy • 📊 Code quality checks • 🔒 Security scanning • 🐳 Build Docker images</p>
  <div class="mod-tip">Check marketplace.github.com — you can find a pre-built action for almost anything!</div>
</div>
    `
  },

  // 11: GitHub Pages
  {
    icon: '🌐', title: 'GitHub Pages', xp: 70,
    content: `
<div class="mod-section">
  <div class="mod-section-title">🌐 What is GitHub Pages?</div>
  <p class="mod-text">GitHub Pages lets you host a website for FREE, directly from your GitHub repository. Great for portfolios, project docs, blogs, and more!</p>
  <p class="mod-text">Your site URL will be: <code>username.github.io/repository-name</code></p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🚀 Quick Setup</div>
  <p class="mod-text">1. Create a repo with HTML/CSS/JS files</p>
  <p class="mod-text">2. Go to repo Settings → Pages</p>
  <p class="mod-text">3. Under "Source", choose "Deploy from branch"</p>
  <p class="mod-text">4. Select "main" branch and "/ (root)" folder</p>
  <p class="mod-text">5. Click Save — your site is live in ~2 minutes! 🎉</p>
  <div class="mod-tip">Put your main HTML file as index.html in the root folder for it to work correctly!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">👤 User vs Project Pages</div>
  <p class="mod-text"><strong>User site:</strong> Repo named <code>username.github.io</code> → becomes <code>https://username.github.io</code></p>
  <p class="mod-text"><strong>Project site:</strong> Any repo → becomes <code>https://username.github.io/repo-name</code></p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🌍 Custom Domain</div>
  <p class="mod-text">Want <code>myawesomesite.com</code> instead of <code>username.github.io</code>?</p>
  <p class="mod-text">1. Buy a domain from Namecheap, GoDaddy, etc.</p>
  <p class="mod-text">2. Add a CNAME file to your repo with your domain name</p>
  <p class="mod-text">3. In your DNS settings, add a CNAME record pointing to <code>username.github.io</code></p>
  <p class="mod-text">4. In GitHub Pages settings, enter your custom domain</p>
  <div class="mod-tip">GitHub Pages also gives you free HTTPS (SSL) certificate — your site is secure automatically!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">📝 Jekyll Support</div>
  <p class="mod-text">GitHub Pages natively supports Jekyll — a static site generator. You can use themes and write blog posts in Markdown without any build step!</p>
  <div class="mod-code-block"><span class="comment"># Create _config.yml in your repo:</span>
theme: minima
title: My Blog
description: A simple blog</div>
</div>
    `
  },

  // 12: Open Source
  {
    icon: '🌍', title: 'Open Source', xp: 80,
    content: `
<div class="mod-section">
  <div class="mod-section-title">🌍 What is Open Source?</div>
  <p class="mod-text">Open source software is code that anyone can see, use, modify, and distribute. Linux, Python, VS Code, React — all open source. Billions of devices run on open source software!</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🤝 How to Contribute</div>
  <p class="mod-text">1. 🔍 Find a project you use and love</p>
  <p class="mod-text">2. 🔖 Look for issues labeled <code>good first issue</code> or <code>help wanted</code></p>
  <p class="mod-text">3. 🍴 Fork the repo</p>
  <p class="mod-text">4. 📥 Clone your fork</p>
  <p class="mod-text">5. 🌿 Create a branch: <code>git switch -c fix/typo-in-readme</code></p>
  <p class="mod-text">6. 🔨 Make your change</p>
  <p class="mod-text">7. 📤 Push and open a PR</p>
  <div class="mod-tip">Your first contribution doesn't have to be code! Fixing typos, improving documentation, or translating content are all valuable contributions!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🎃 Hacktoberfest</div>
  <p class="mod-text">Every October, Digital Ocean runs Hacktoberfest — contribute 4 PRs to open source and get a FREE T-shirt or plant a tree! Great motivation to start contributing!</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">📋 Important Files in Open Source Repos</div>
  <p class="mod-text">📖 <strong>README.md</strong> — What the project does, how to use it</p>
  <p class="mod-text">🤝 <strong>CONTRIBUTING.md</strong> — How to contribute to this project</p>
  <p class="mod-text">📜 <strong>CODE_OF_CONDUCT.md</strong> — Rules for community behavior</p>
  <p class="mod-text">🔒 <strong>SECURITY.md</strong> — How to report security vulnerabilities</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">⭐ GitHub Stars & Forks</div>
  <p class="mod-text">⭐ <strong>Star</strong> a repo to bookmark it and show appreciation. Repos are often ranked by stars!</p>
  <p class="mod-text">🍴 <strong>Forks</strong> show how many people have their own copy to work from.</p>
  <p class="mod-text">👁️ <strong>Watch</strong> to get notifications about new issues, PRs, and releases.</p>
</div>
    `
  },

  // 13: Pro Tips
  {
    icon: '👑', title: 'Pro Tips & Best Practices', xp: 100,
    content: `
<div class="mod-section">
  <div class="mod-section-title">📦 Git Stash</div>
  <p class="mod-text">Stash lets you temporarily save work-in-progress without committing.</p>
  <div class="mod-code-block">git stash                    <span class="comment"># Stash current changes</span>
git stash save "WIP: login"  <span class="comment"># Stash with a name</span>
git stash list               <span class="comment"># See all stashes</span>
git stash pop                <span class="comment"># Apply and remove latest stash</span>
git stash apply stash@{1}    <span class="comment"># Apply specific stash</span>
git stash drop               <span class="comment"># Delete a stash</span></div>
  <div class="mod-tip">Use stash when someone says "can you quickly fix this bug?" and you're in the middle of something else!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🏷️ Tags & Releases</div>
  <div class="mod-code-block">git tag v1.0.0                        <span class="comment"># Lightweight tag</span>
git tag -a v1.0.0 -m "First release"  <span class="comment"># Annotated tag</span>
git push --tags                        <span class="comment"># Push tags to GitHub</span></div>
  <p class="mod-text">Semantic versioning: <strong>MAJOR.MINOR.PATCH</strong></p>
  <p class="mod-text">• 1.0.0 → 2.0.0: Breaking changes</p>
  <p class="mod-text">• 1.0.0 → 1.1.0: New features (backwards compatible)</p>
  <p class="mod-text">• 1.0.0 → 1.0.1: Bug fixes</p>
</div>
<div class="mod-section">
  <div class="mod-section-title">🍒 Cherry Pick</div>
  <div class="mod-code-block"><span class="comment"># Apply a specific commit from another branch:</span>
git log other-branch --oneline   <span class="comment"># Find the commit hash</span>
git cherry-pick a1b2c3d           <span class="comment"># Apply just that commit</span></div>
  <div class="mod-tip">Use cherry-pick when you only want ONE specific commit from another branch, not a full merge!</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔍 Git Bisect (Bug Hunting)</div>
  <div class="mod-code-block"><span class="comment"># Find which commit introduced a bug:</span>
git bisect start
git bisect bad                    <span class="comment"># Current commit is buggy</span>
git bisect good v1.0              <span class="comment"># This version was fine</span>
<span class="comment"># Git will checkout midpoints, you test each:</span>
git bisect good   <span class="comment"># or</span>
git bisect bad
<span class="comment"># Git narrows it down automatically!</span>
git bisect reset  <span class="comment"># When done</span></div>
</div>
<div class="mod-section">
  <div class="mod-section-title">📏 Commit Message Convention</div>
  <div class="mod-code-block"><span class="comment"># Conventional Commits format:</span>
feat: add dark mode toggle
fix: resolve login crash on mobile
docs: update installation guide
style: format code with prettier
refactor: extract auth logic to service
test: add unit tests for LoginForm
chore: update dependencies</div>
</div>
<div class="mod-section">
  <div class="mod-section-title">🔒 Protecting Branches</div>
  <p class="mod-text">In GitHub Settings → Branches → Branch protection rules, you can:</p>
  <p class="mod-text">✅ Require pull requests before merging</p>
  <p class="mod-text">✅ Require CI checks to pass</p>
  <p class="mod-text">✅ Require review approvals</p>
  <p class="mod-text">✅ Prevent force pushes</p>
</div>
    `
  }
];

// ══════════════════════════════════════════════
// OPEN MODULE MODAL
// ══════════════════════════════════════════════
function openModule(idx) {
  const mod = MODULE_DATA[idx];
  if (!mod) return;
  const completed = state.modulesCompleted.includes(idx);
  const modal = document.getElementById('module-modal');
  const content = document.getElementById('module-modal-content');

  content.innerHTML = `
    <div class="mod-modal-header">
      <span class="mod-modal-icon">${mod.icon}</span>
      <div>
        <div class="mod-modal-title">${mod.title}</div>
        <div class="mod-modal-sub">Module ${idx + 1} &nbsp;·&nbsp; +${mod.xp} XP</div>
      </div>
    </div>
    ${mod.content}
    <button class="mod-complete-btn" id="mod-complete-btn" onclick="completeModule(${idx})" ${completed ? 'disabled' : ''}>
      ${completed ? '✅ Completed!' : `Mark as Complete (+${mod.xp} XP)`}
    </button>
  `;

  modal.classList.remove('hidden');
  changeMascotTip(`You're learning <b>${mod.title}</b>! Great choice! 📚`);
}

function completeModule(idx) {
  if (state.modulesCompleted.includes(idx)) return;
  state.modulesCompleted.push(idx);

  const mod = MODULE_DATA[idx];
  addXP(mod.xp);
  saveState();
  renderModuleDots();
  renderRoadmap();

  // Update button
  const btn = document.getElementById('mod-complete-btn');
  if (btn) { btn.textContent = '✅ Completed!'; btn.disabled = true; }

  // Update module card
  const card = document.querySelector(`.module-card[data-module="${idx}"]`);
  if (card) {
    card.classList.add('completed');
    const mcBtn = card.querySelector('.mc-btn');
    if (mcBtn) { mcBtn.textContent = '✅ Done'; mcBtn.className = 'mc-btn done-btn'; }
  }

  // Badges
  if (idx === 0) earnBadge('first-commit');
  if (idx === 4) earnBadge('brancher');
  if (idx === 5) earnBadge('merger');
  if (idx === 7) earnBadge('pr-hero');
  if (idx === 8) earnBadge('collaborator');
  if (idx === 12) earnBadge('open-source');
  if (idx === 10) earnBadge('actionist');
  if (state.modulesCompleted.length === 14) earnBadge('master');

  showToast(`✅ Module complete! +${mod.xp} XP`);
  updateLeaderboard();
}

// ══════════════════════════════════════════════
// QUIZ DATA
// ══════════════════════════════════════════════
const QUIZ_DATA = [
  // Beginner Quiz
  [
    {
      q: 'What command initializes a new Git repository?',
      opts: ['git start', 'git init', 'git new', 'git create'],
      correct: 1,
      explain: 'git init creates a new .git folder in your current directory, turning it into a Git repository!'
    },
    {
      q: 'What does "git add ." do?',
      opts: ['Creates a new commit', 'Stages all changed files for commit', 'Uploads files to GitHub', 'Deletes all files'],
      correct: 1,
      explain: 'git add . stages ALL changes in the current directory. The dot means "everything here".'
    },
    {
      q: 'Which command saves a snapshot of your staged changes?',
      opts: ['git push', 'git save', 'git commit -m "msg"', 'git snapshot'],
      correct: 2,
      explain: 'git commit -m "message" creates a new commit with all staged changes!'
    },
    {
      q: 'What file should you NEVER commit to GitHub?',
      opts: ['README.md', '.gitignore', '.env (with secrets)', 'index.html'],
      correct: 2,
      explain: '.env files often contain API keys and passwords. Committing them exposes your secrets to everyone!'
    },
    {
      q: 'What is a "repository" in Git?',
      opts: ['A type of commit', 'A folder tracked by Git', 'A branch name', 'A GitHub user'],
      correct: 1,
      explain: 'A repository (repo) is a folder that Git is tracking, including a .git subfolder with all history.'
    },
    {
      q: 'What does "git status" show you?',
      opts: ['Your GitHub profile stats', 'Which files changed, staged, or untracked', 'The latest commit hash', 'Your internet connection'],
      correct: 1,
      explain: 'git status is your go-to command to see what\'s changed, what\'s staged, and what\'s new!'
    },
    {
      q: 'Git was created by:',
      opts: ['Bill Gates', 'Mark Zuckerberg', 'Linus Torvalds', 'Satoshi Nakamoto'],
      correct: 2,
      explain: 'Linus Torvalds created Git in 2005. He also created Linux! Quite the resume.'
    },
    {
      q: 'What is the default branch usually called?',
      opts: ['root', 'origin', 'main', 'default'],
      correct: 2,
      explain: 'Modern repos use "main" as the default branch. Older repos used "master".'
    },
    {
      q: 'What does README.md do?',
      opts: ['Stores commit history', 'Is the front page description of your project', 'Lists your team members', 'Configures Git settings'],
      correct: 1,
      explain: 'README.md is displayed on your GitHub repo page. It explains what your project is and how to use it!'
    },
    {
      q: 'Which command shows your commit history?',
      opts: ['git history', 'git log', 'git commits', 'git show-all'],
      correct: 1,
      explain: 'git log shows all commits with author, date, and message. Use --oneline for a compact view!'
    }
  ],
  // Branching Quiz
  [
    {
      q: 'What command creates AND switches to a new branch?',
      opts: ['git branch new-feature', 'git checkout -b new-feature', 'git switch -c new-feature', 'Both B and C'],
      correct: 3,
      explain: 'Both "git checkout -b" and "git switch -c" create and switch to a branch. git switch is the modern way!'
    },
    {
      q: 'What is a merge conflict?',
      opts: ['When two branches have different names', 'When two branches changed the same line differently', 'When you can\'t push to GitHub', 'When git init fails'],
      correct: 1,
      explain: 'Merge conflicts happen when two branches change the exact same line in the same file. You have to manually choose which change to keep!'
    },
    {
      q: 'What does "git merge feature/login" do when on main?',
      opts: ['Deletes feature/login', 'Switches to feature/login', 'Combines feature/login changes into main', 'Creates a new branch'],
      correct: 2,
      explain: 'git merge brings the changes from the named branch INTO your current branch!'
    },
    {
      q: 'What is the difference between merge and rebase?',
      opts: ['They are identical', 'Merge creates a merge commit; rebase creates a linear history', 'Rebase is for remote branches only', 'Merge only works on main'],
      correct: 1,
      explain: 'Merge preserves history with a merge commit. Rebase rewrites commits to create a cleaner linear history!'
    },
    {
      q: 'Which command deletes a branch that has been merged?',
      opts: ['git branch -D feature', 'git remove feature', 'git branch -d feature', 'git delete feature'],
      correct: 2,
      explain: '-d (lowercase) safely deletes a merged branch. -D (uppercase) force-deletes even if unmerged!'
    },
    {
      q: 'What does "git stash" do?',
      opts: ['Saves your work-in-progress temporarily', 'Creates a new branch', 'Pushes to GitHub', 'Shows commit history'],
      correct: 0,
      explain: 'git stash saves your uncommitted changes in a temporary area so you can switch branches without losing work!'
    },
    {
      q: 'Which branch naming convention is best for a new feature?',
      opts: ['my-stuff', 'feature/user-authentication', 'branch1', 'dev'],
      correct: 1,
      explain: 'Convention: use "feature/" prefix + descriptive name. It makes the purpose of the branch obvious!'
    },
    {
      q: 'What does the conflict marker "=======" mean?',
      opts: ['End of file', 'Separates YOUR changes from INCOMING changes', 'An error occurred', 'A successful merge'],
      correct: 1,
      explain: 'In a conflict, <<<<<<< HEAD shows your version, ======= is the divider, >>>>>>> shows the incoming version!'
    },
    {
      q: 'When should you NOT rebase?',
      opts: ['On your private local branches', 'On public branches that others are using', 'On feature branches before a PR', 'Any time'],
      correct: 1,
      explain: 'Never rebase public shared branches — it rewrites history and causes problems for everyone who has those commits!'
    },
    {
      q: 'What is "git cherry-pick"?',
      opts: ['Selects files to delete', 'Applies a specific commit from another branch to current branch', 'Creates a new branch from a commit', 'Reverts the last 5 commits'],
      correct: 1,
      explain: 'Cherry-pick lets you take ONE specific commit and apply it to your current branch, without merging everything!'
    }
  ],
  // Collaboration Quiz
  [
    {
      q: 'What is a Pull Request (PR)?',
      opts: ['Downloading code from GitHub', 'A request to merge your branch into another branch', 'A security feature', 'A type of commit'],
      correct: 1,
      explain: 'A PR proposes your changes to a repository. Others review, comment, and approve before merging!'
    },
    {
      q: 'What does "forking" a repository do?',
      opts: ['Deletes the original repo', 'Creates your own copy of a repo on YOUR GitHub account', 'Downloads the repo to your computer', 'Creates a new branch'],
      correct: 1,
      explain: 'Forking creates a server-side copy in your account. You can then freely modify it without affecting the original!'
    },
    {
      q: 'What magic keyword in a PR description auto-closes an issue when merged?',
      opts: ['Closes #42', 'Fixes #42', 'Resolves #42', 'All of the above'],
      correct: 3,
      explain: '"Closes", "Fixes", and "Resolves" all auto-close an issue when the PR is merged! Very handy!'
    },
    {
      q: 'What label should you look for to find beginner-friendly issues?',
      opts: ['easy-mode', 'good first issue', 'beginner', 'starter'],
      correct: 1,
      explain: '"good first issue" is the universal label on GitHub for issues suitable for new contributors!'
    },
    {
      q: 'What is "git fetch" vs "git pull"?',
      opts: ['They are the same', 'fetch downloads without merging; pull downloads AND merges', 'pull is for branches, fetch is for tags', 'fetch is newer and faster'],
      correct: 1,
      explain: 'git fetch gets the data but doesn\'t touch your working files. git pull = fetch + merge in one step!'
    },
    {
      q: 'What is the "upstream" remote in a fork workflow?',
      opts: ['Your own fork', 'The original repo you forked from', 'The main branch', 'GitHub\'s servers'],
      correct: 1,
      explain: 'When you fork, "origin" is your fork and "upstream" is the original repo. This lets you pull in new changes from the source!'
    },
    {
      q: 'What should a good PR description include?',
      opts: ['Just a title', 'What it does, why, how to test, screenshots', 'Only the commit messages', 'A list of files changed'],
      correct: 1,
      explain: 'A great PR description helps reviewers understand: what changed, why it changed, and how to verify it works!'
    },
    {
      q: 'What is Hacktoberfest?',
      opts: ['A GitHub conference', 'A monthly event for paid contributors', 'An annual October event where you contribute to open source for prizes', 'A Halloween coding challenge'],
      correct: 2,
      explain: 'Hacktoberfest runs every October! Contribute 4 PRs to open source projects and earn a t-shirt or plant a tree!'
    },
    {
      q: 'What does CONTRIBUTING.md tell you?',
      opts: ['The project\'s license', 'How to contribute to the project', 'List of contributors', 'The project roadmap'],
      correct: 1,
      explain: 'CONTRIBUTING.md explains how to set up the project, coding standards, PR process, and how to report issues!'
    },
    {
      q: 'What are GitHub Actions?',
      opts: ['A to-do list feature', 'A way to automate tasks when events happen (like pushing code)', 'GitHub\'s mobile app', 'The GitHub support team'],
      correct: 1,
      explain: 'GitHub Actions automate your workflow — run tests, deploy code, send notifications, all automatically on events you define!'
    }
  ],
  // Speed round
  [
    { q: 'Command to check what changed:', opts: ['git diff', 'git changed', 'git view', 'git check'], correct: 0, explain: 'git diff shows unstaged changes.' },
    { q: 'Upload changes to GitHub:', opts: ['git send', 'git push', 'git upload', 'git sync'], correct: 1, explain: 'git push sends local commits to the remote.' },
    { q: 'Download changes without merging:', opts: ['git pull', 'git fetch', 'git download', 'git get'], correct: 1, explain: 'git fetch downloads but does NOT change your files.' },
    { q: 'Undo last commit, keep changes:', opts: ['git revert', 'git reset HEAD~1', 'git undo', 'git back'], correct: 1, explain: 'git reset HEAD~1 undoes the commit but keeps your file changes.' },
    { q: 'Save work-in-progress temporarily:', opts: ['git save', 'git stash', 'git hide', 'git temp'], correct: 1, explain: 'git stash is your emergency save point!' },
    { q: 'See all branches:', opts: ['git list', 'git branches', 'git branch', 'git show'], correct: 2, explain: 'git branch lists all local branches.' },
    { q: 'Create a tag:', opts: ['git tag v1.0', 'git label v1.0', 'git mark v1.0', 'git release v1.0'], correct: 0, explain: 'git tag creates a named pointer to a commit.' },
    { q: 'Who wrote each line of a file:', opts: ['git log', 'git blame', 'git who', 'git author'], correct: 1, explain: 'git blame shows the author and commit for every line!' },
    { q: 'Apply ONE commit from another branch:', opts: ['git merge', 'git pick', 'git cherry-pick', 'git apply'], correct: 2, explain: 'git cherry-pick applies a specific commit by its hash.' },
    { q: 'See a specific commit\'s changes:', opts: ['git log', 'git show <hash>', 'git view', 'git open'], correct: 1, explain: 'git show <hash> displays the diff and metadata for that commit.' }
  ]
];

// ══════════════════════════════════════════════
// QUIZ ENGINE
// ══════════════════════════════════════════════
let quizState = { quiz: 0, qIdx: 0, score: 0, answered: false };

function startQuiz(quizIdx) {
  quizState = { quiz: quizIdx, qIdx: 0, score: 0, answered: false };
  const modal = document.getElementById('quiz-modal');
  modal.classList.remove('hidden');
  renderQuestion();
}

function renderQuestion() {
  const { quiz, qIdx, score } = quizState;
  const questions = QUIZ_DATA[quiz];
  const content = document.getElementById('quiz-modal-content');

  if (qIdx >= questions.length) {
    showQuizResult();
    return;
  }

  const q = questions[qIdx];
  const letters = ['A', 'B', 'C', 'D'];
  const isSpeedRound = quiz === 3;

  content.innerHTML = `
    <div class="quiz-q-header">
      <span class="quiz-progress-text">Question ${qIdx + 1} of ${questions.length}</span>
      <span class="quiz-score-text">Score: ${score}/${qIdx}</span>
    </div>
    <div style="background:var(--bg4);border-radius:8px;height:6px;margin-bottom:24px;">
      <div style="height:100%;width:${(qIdx/questions.length)*100}%;background:linear-gradient(90deg,var(--yellow-dim),var(--yellow));border-radius:8px;transition:width 0.4s;"></div>
    </div>
    ${isSpeedRound ? `<div id="speed-timer-bar" style="background:var(--bg4);height:4px;border-radius:4px;margin-bottom:16px;"><div id="speed-timer-fill" style="height:100%;width:100%;background:var(--yellow);border-radius:4px;transition:width 0.1s linear;"></div></div>` : ''}
    <div class="quiz-question-num">Question ${qIdx + 1}</div>
    <div class="quiz-question-text">${q.q}</div>
    <div class="quiz-options" id="quiz-opts">
      ${q.opts.map((opt, i) => `
        <button class="quiz-option" onclick="answerQuiz(${i})">
          <span class="quiz-opt-letter">${letters[i]}</span>
          ${opt}
        </button>
      `).join('')}
    </div>
    <div id="quiz-explanation" style="display:none;" class="quiz-explanation"></div>
    <button id="quiz-next" class="quiz-next-btn" style="display:none;" onclick="nextQuestion()">
      ${qIdx < questions.length - 1 ? 'Next Question →' : 'See Results 🎉'}
    </button>
  `;

  quizState.answered = false;

  if (isSpeedRound) startSpeedTimer();
}

let speedTimerInterval = null;
function startSpeedTimer() {
  clearInterval(speedTimerInterval);
  let timeLeft = 30;
  const fill = document.getElementById('speed-timer-fill');
  speedTimerInterval = setInterval(() => {
    timeLeft -= 0.1;
    if (fill) fill.style.width = `${(timeLeft / 30) * 100}%`;
    if (fill) fill.style.background = timeLeft > 15 ? 'var(--yellow)' : 'var(--red)';
    if (timeLeft <= 0) {
      clearInterval(speedTimerInterval);
      if (!quizState.answered) answerQuiz(-1);
    }
  }, 100);
}

function answerQuiz(selectedIdx) {
  if (quizState.answered) return;
  quizState.answered = true;
  clearInterval(speedTimerInterval);

  const q = QUIZ_DATA[quizState.quiz][quizState.qIdx];
  const opts = document.querySelectorAll('.quiz-option');
  const explEl = document.getElementById('quiz-explanation');
  const nextBtn = document.getElementById('quiz-next');

  opts.forEach((opt, i) => {
    opt.classList.add('disabled');
    if (i === q.correct) opt.classList.add('correct');
    else if (i === selectedIdx) opt.classList.add('wrong');
  });

  if (selectedIdx === q.correct) {
    quizState.score++;
    showToast('✅ Correct! +10 XP');
    addXP(10);
  } else {
    showToast('❌ Not quite! Check the explanation.');
  }

  explEl.textContent = q.explain;
  explEl.style.display = 'block';
  nextBtn.style.display = 'inline-block';
}

function nextQuestion() {
  quizState.qIdx++;
  renderQuestion();
}

function showQuizResult() {
  const { quiz, score, qIdx } = quizState;
  const questions = QUIZ_DATA[quiz];
  const pct = Math.round((score / questions.length) * 100);
  const XP_REWARDS = [100, 120, 150, 200];
  const baseXP = XP_REWARDS[quiz];
  const earnedXP = Math.round(baseXP * (pct / 100));

  let emoji = pct >= 90 ? '🏆' : pct >= 70 ? '😎' : pct >= 50 ? '🙂' : '📚';
  let msg = pct >= 90 ? 'Perfect! You\'re a Git genius!' : pct >= 70 ? 'Great job! Keep it up!' : pct >= 50 ? 'Good effort! Review the topics and try again!' : 'Keep studying — you\'ve got this!';

  state.quizzesCompleted[quiz] = { score, total: questions.length, pct };
  if (pct === 100) earnBadge('quiz-ace');
  addXP(earnedXP);
  saveState();
  updateLeaderboard();

  const el = document.getElementById('quiz-quiz-status-' + quiz);
  const statusEl = document.getElementById('quiz-status-' + quiz);
  if (statusEl) { statusEl.textContent = `${score}/${questions.length} ✅`; statusEl.className = 'quiz-status done'; }

  document.getElementById('quiz-modal-content').innerHTML = `
    <div class="quiz-result">
      <div class="quiz-result-emoji">${emoji}</div>
      <div class="quiz-result-title">${score}/${questions.length} — ${pct}%</div>
      <div class="quiz-result-sub">${msg}</div>
      <div class="quiz-result-xp">+${earnedXP} XP earned! ⚡</div>
      <button class="btn-primary" onclick="startQuiz(${quiz})" style="margin-right:10px;">Try Again</button>
      <button class="btn-secondary" onclick="closeModal('quiz-modal')">Close</button>
    </div>
  `;
  changeMascotTip(`Quiz done! ${pct >= 70 ? 'Amazing score!' : 'Practice makes perfect!'} You earned <b>${earnedXP} XP</b>! 🎯`);
}

// ══════════════════════════════════════════════
// ACTIVITIES
// ══════════════════════════════════════════════
function openActivity(id) {
  const modal = document.getElementById('activity-modal');
  const content = document.getElementById('activity-modal-content');
  modal.classList.remove('hidden');

  const activities = {
    'cmd-match': renderCmdMatch,
    'terminal-sim': renderTerminalSim,
    'commit-story': renderCommitStory,
    'conflict-resolve': renderConflictResolve,
    'gitignore-builder': renderGitignoreBuilder,
    'readme-write': renderReadmeWriter,
    'branch-draw': renderBranchDraw,
    'pr-review': renderPRReview
  };

  if (activities[id]) {
    content.innerHTML = activities[id]();
    if (id === 'terminal-sim') initTerminalSim();
    if (id === 'cmd-match') initCmdMatch();
    if (id === 'conflict-resolve') initConflictResolve();
    if (id === 'gitignore-builder') initGitignoreBuilder();
  }
}

function renderCmdMatch() {
  return `
    <h2 class="act-modal-title">🎮 Command Match</h2>
    <p class="act-modal-desc">Match each Git command on the left to its meaning on the right! Click a command, then click its meaning.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;" id="cmd-match-container">
      <div>
        <div class="cmd-col-title">Git Command</div>
        <div id="cmd-list"></div>
      </div>
      <div>
        <div class="cmd-col-title">What it does</div>
        <div id="meaning-list"></div>
      </div>
    </div>
    <div id="cmd-match-result" style="margin-top:20px;"></div>
  `;
}

const CMD_PAIRS = [
  { cmd: 'git init', meaning: 'Start a new repository' },
  { cmd: 'git add .', meaning: 'Stage all changes' },
  { cmd: 'git commit -m', meaning: 'Save a snapshot with message' },
  { cmd: 'git push', meaning: 'Upload to GitHub' },
  { cmd: 'git pull', meaning: 'Download + merge from GitHub' },
  { cmd: 'git branch', meaning: 'List all branches' },
  { cmd: 'git merge', meaning: 'Combine branches' },
  { cmd: 'git stash', meaning: 'Save work temporarily' },
];

let cmdSelected = null, meaningSelected = null, cmdMatchScore = 0;

function initCmdMatch() {
  cmdSelected = null; meaningSelected = null; cmdMatchScore = 0;
  const shuffled = [...CMD_PAIRS].sort(() => Math.random() - 0.5);
  const meanings = [...CMD_PAIRS].map(p => p.meaning).sort(() => Math.random() - 0.5);

  const cmdList = document.getElementById('cmd-list');
  const meanList = document.getElementById('meaning-list');

  cmdList.innerHTML = shuffled.map((p, i) => `
    <div class="cmd-item" data-idx="${i}" data-cmd="${p.cmd}" onclick="selectCmd(this)">${p.cmd}</div>
  `).join('');

  meanList.innerHTML = meanings.map((m, i) => `
    <div class="meaning-item" data-idx="${i}" data-meaning="${m}" onclick="selectMeaning(this)">${m}</div>
  `).join('');
}

function selectCmd(el) {
  if (el.classList.contains('matched')) return;
  document.querySelectorAll('.cmd-item').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  cmdSelected = el;
  if (meaningSelected) checkCmdMatch();
}

function selectMeaning(el) {
  if (el.classList.contains('matched')) return;
  document.querySelectorAll('.meaning-item').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  meaningSelected = el;
  if (cmdSelected) checkCmdMatch();
}

function checkCmdMatch() {
  const cmd = cmdSelected.dataset.cmd;
  const meaning = meaningSelected.dataset.meaning;
  const pair = CMD_PAIRS.find(p => p.cmd === cmd);

  if (pair && pair.meaning === meaning) {
    cmdSelected.classList.add('matched');
    meaningSelected.classList.add('matched');
    cmdMatchScore++;
    showToast('✅ Correct match! +5 XP');
    addXP(5);
    if (cmdMatchScore === CMD_PAIRS.length) {
      document.getElementById('cmd-match-result').innerHTML = `
        <div style="background:var(--yellow-glow);border:1px solid var(--yellow-border);border-radius:12px;padding:20px;text-align:center;">
          <div style="font-size:36px;margin-bottom:8px;">🏆</div>
          <div style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--yellow);">All matched! +30 XP bonus!</div>
        </div>
      `;
      addXP(30);
      earnBadge('first-commit');
    }
  } else {
    cmdSelected.classList.add('wrong-match');
    meaningSelected.classList.add('wrong-match');
    setTimeout(() => {
      cmdSelected.classList.remove('wrong-match', 'selected');
      meaningSelected.classList.remove('wrong-match', 'selected');
    }, 600);
    showToast('❌ Not quite! Try again!');
  }
  cmdSelected = null; meaningSelected = null;
}

function renderTerminalSim() {
  return `
    <h2 class="act-modal-title">💻 Terminal Simulator</h2>
    <p class="act-modal-desc">Practice real Git commands! Try: git init, git status, git add, git commit, git log, git branch, git stash, git diff</p>
    <div class="sim-terminal">
      <div class="terminal-bar">
        <span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span>
        <span class="terminal-title">git-simulator</span>
      </div>
      <div class="sim-output" id="sim-output">
        <span class="sim-line ok">🐱 Welcome to GitSim! Type git commands below.</span>
        <span class="sim-line info">Hint: Start with 'git init' then 'git status'</span>
      </div>
      <div class="sim-input-row">
        <span class="sim-prompt">~/project $</span>
        <input class="sim-input" id="sim-input" type="text" placeholder="type a git command..." autocomplete="off" />
        <span class="sim-hint" onclick="showSuggest()">💡 hint</span>
      </div>
    </div>
    <div id="sim-task" style="background:var(--bg4);border-radius:10px;padding:14px 18px;font-size:14px;color:var(--text-muted);">
      🎯 <b style="color:var(--yellow)">Task 1:</b> Initialize a new Git repository
    </div>
  `;
}

const SIM_STATE = {
  initialized: false, staged: false, committed: false, branch: 'main',
  commits: [], stashed: false, files: ['index.html', 'style.css', 'app.js'],
  taskIdx: 0
};

const SIM_TASKS = [
  'Initialize a new Git repository',
  'Check the status of your repo',
  'Stage your files with git add .',
  'Make your first commit',
  'View the commit log',
  'Create a new branch called feature/test',
  'Switch to the feature/test branch',
  'Stash your current changes',
];

function initTerminalSim() {
  SIM_STATE.initialized = false;
  SIM_STATE.staged = false;
  SIM_STATE.committed = false;
  SIM_STATE.commits = [];
  SIM_STATE.taskIdx = 0;
  const input = document.getElementById('sim-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') runSimCommand(input.value.trim());
    });
    input.focus();
  }
}

function simPrint(text, cls = '') {
  const out = document.getElementById('sim-output');
  if (!out) return;
  const line = document.createElement('span');
  line.className = `sim-line ${cls}`;
  line.innerHTML = text;
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
}

function runSimCommand(cmd) {
  if (!cmd) return;
  const input = document.getElementById('sim-input');
  if (input) input.value = '';
  simPrint(`$ ${cmd}`, 'cmd');

  const c = cmd.toLowerCase().trim().replace(/\s+/g, ' ');

  if (c === 'git init') {
    SIM_STATE.initialized = true;
    simPrint('Initialized empty Git repository in /project/.git/', 'ok');
    advanceSimTask(0);
    addXP(5);
  } else if (!SIM_STATE.initialized && c.startsWith('git')) {
    simPrint('fatal: not a git repository (run git init first!)', 'err');
  } else if (c === 'git status') {
    simPrint('On branch main', 'highlight');
    if (SIM_STATE.committed) {
      simPrint('nothing to commit, working tree clean', 'ok');
    } else if (SIM_STATE.staged) {
      simPrint('Changes to be committed:', 'info');
      SIM_STATE.files.forEach(f => simPrint(`  new file: ${f}`, 'ok'));
    } else {
      simPrint('Untracked files:', 'info');
      SIM_STATE.files.forEach(f => simPrint(`  ${f}`, ''));
      simPrint('nothing added to commit but untracked files present', '');
    }
    advanceSimTask(1); addXP(3);
  } else if (c === 'git add .' || c === 'git add -a') {
    SIM_STATE.staged = true;
    simPrint('', '');
    SIM_STATE.files.forEach(f => simPrint(`✓ staged: ${f}`, 'ok'));
    advanceSimTask(2); addXP(5);
  } else if (c.startsWith('git commit')) {
    if (!SIM_STATE.staged) { simPrint('error: nothing to commit (use git add first)', 'err'); return; }
    const msg = cmd.match(/-m\s+"([^"]+)"/)?.[1] || cmd.match(/-m\s+'([^']+)'/)?.[1] || 'no message';
    const hash = Math.random().toString(16).slice(2, 9);
    SIM_STATE.commits.push({ hash, msg });
    SIM_STATE.committed = true; SIM_STATE.staged = false;
    simPrint(`[main ${hash}] ${msg}`, 'ok');
    simPrint(`${SIM_STATE.files.length} files changed`, 'info');
    advanceSimTask(3); addXP(8);
    earnBadge('first-commit');
  } else if (c === 'git log' || c === 'git log --oneline') {
    if (!SIM_STATE.commits.length) { simPrint('No commits yet', 'err'); return; }
    SIM_STATE.commits.slice().reverse().forEach(cm => {
      simPrint(`<span style="color:var(--yellow)">${cm.hash}</span> ${cm.msg}`, '');
    });
    advanceSimTask(4); addXP(3);
  } else if (c.startsWith('git branch')) {
    const parts = c.split(' ');
    if (parts.length === 1) {
      simPrint(`* ${SIM_STATE.branch}`, 'ok');
    } else {
      const branchName = parts[2] || parts[1];
      simPrint(`Created branch '${branchName}'`, 'ok');
      advanceSimTask(5); addXP(8);
      earnBadge('brancher');
    }
  } else if (c.startsWith('git switch') || c.startsWith('git checkout')) {
    const parts = c.split(' ');
    const branchName = parts[parts.length - 1];
    if (branchName === '-c' || branchName === 'switch' || branchName === 'checkout') {
      simPrint('error: please specify a branch name', 'err');
    } else {
      SIM_STATE.branch = branchName.replace('-c', '').trim() || 'main';
      simPrint(`Switched to branch '${branchName}'`, 'ok');
      advanceSimTask(6); addXP(5);
    }
  } else if (c === 'git stash') {
    SIM_STATE.stashed = true;
    simPrint('Saved working directory and index state WIP on main: stash@{0}', 'ok');
    advanceSimTask(7); addXP(5);
  } else if (c === 'git stash pop') {
    simPrint('Dropped refs/stash@{0}', 'ok');
    simPrint('Restored stashed changes!', 'info');
  } else if (c === 'git diff') {
    simPrint('diff --git a/index.html b/index.html', 'info');
    simPrint('+++ b/index.html', 'ok');
    simPrint('+ <h1>Hello World</h1>', 'ok');
  } else if (c === 'clear' || c === 'cls') {
    document.getElementById('sim-output').innerHTML = '';
  } else if (c === 'help' || c === 'git help') {
    ['git init', 'git status', 'git add .', 'git commit -m "msg"', 'git log', 'git branch <name>', 'git switch <name>', 'git stash'].forEach(h => {
      simPrint(h, 'info');
    });
  } else {
    simPrint(`bash: ${cmd}: command not recognized. Try 'help' for available commands.`, 'err');
  }
}

function advanceSimTask(taskIdx) {
  if (SIM_STATE.taskIdx <= taskIdx) {
    SIM_STATE.taskIdx = taskIdx + 1;
    const taskEl = document.getElementById('sim-task');
    if (taskEl && SIM_STATE.taskIdx < SIM_TASKS.length) {
      taskEl.innerHTML = `🎯 <b style="color:var(--yellow)">Task ${SIM_STATE.taskIdx + 1}:</b> ${SIM_TASKS[SIM_STATE.taskIdx]}`;
    } else if (taskEl) {
      taskEl.innerHTML = `🏆 <b style="color:var(--green)">All tasks complete! You're a terminal pro! +20 XP</b>`;
      addXP(20);
    }
  }
}

function showSuggest() {
  if (SIM_TASKS[SIM_STATE.taskIdx]) {
    showToast(`💡 Try: "${SIM_TASKS[SIM_STATE.taskIdx]}"`);
  }
}

function renderCommitStory() {
  return `
    <h2 class="act-modal-title">📖 Commit Story</h2>
    <p class="act-modal-desc">Look at this project's commit history. Can you figure out what the developer was building?</p>
    <div style="background:var(--bg);border-radius:12px;padding:20px;font-family:var(--font-mono);font-size:13px;line-height:2;margin-bottom:20px;">
      <div style="color:var(--yellow)">a4f2d1c</div><span style="color:var(--text-muted)"> Initial commit: project setup</span><br/>
      <div style="color:var(--yellow)">b8c3e2a</div><span style="color:var(--text-muted)"> Add user registration form</span><br/>
      <div style="color:var(--yellow)">c1d4f5b</div><span style="color:var(--text-muted)"> Add login functionality</span><br/>
      <div style="color:var(--yellow)">d2e5g6c</div><span style="color:var(--text-muted)"> Add JWT token authentication</span><br/>
      <div style="color:var(--yellow)">e3f6h7d</div><span style="color:var(--text-muted)"> Add user profile page</span><br/>
      <div style="color:var(--yellow)">f4g7i8e</div><span style="color:var(--text-muted)"> Add profile picture upload</span><br/>
      <div style="color:var(--yellow)">g5h8j9f</div><span style="color:var(--text-muted)"> Fix profile picture not saving</span><br/>
      <div style="color:var(--yellow)">h6i9k0g</div><span style="color:var(--text-muted)"> Add friend request feature</span><br/>
      <div style="color:var(--yellow)">i7j0l1h</div><span style="color:var(--text-muted)"> Add real-time notifications</span><br/>
      <div style="color:var(--yellow)">j8k1m2i</div><span style="color:var(--text-muted)"> Add chat messaging system</span>
    </div>
    <p style="color:var(--text-muted);font-size:14px;margin-bottom:14px;">What do you think this developer was building?</p>
    <div style="display:flex;flex-direction:column;gap:10px;" id="story-opts">
      <button class="quiz-option" onclick="checkStory(0)"><span class="quiz-opt-letter">A</span>An e-commerce shopping app</button>
      <button class="quiz-option" onclick="checkStory(1)"><span class="quiz-opt-letter">B</span>A social network / chat application</button>
      <button class="quiz-option" onclick="checkStory(2)"><span class="quiz-opt-letter">C</span>A task management tool</button>
      <button class="quiz-option" onclick="checkStory(3)"><span class="quiz-opt-letter">D</span>A weather application</button>
    </div>
    <div id="story-result"></div>
  `;
}

function checkStory(idx) {
  document.querySelectorAll('#story-opts .quiz-option').forEach((b, i) => {
    b.classList.add('disabled');
    if (i === 1) b.classList.add('correct');
    else if (i === idx) b.classList.add('wrong');
  });
  document.getElementById('story-result').innerHTML = `
    <div class="quiz-explanation" style="margin-top:16px;">
      ${idx === 1 ? '🎯 Correct!' : '📚 Not quite!'} Looking at the commit messages: registration → login → JWT → profile → profile pics → friends → notifications → chat — this is clearly a <b>social network!</b> Reading commit history tells you the whole story of what was built. This is why clear commit messages matter! +40 XP
    </div>
  `;
  if (idx === 1) addXP(40);
  else addXP(10);
}

function renderConflictResolve() {
  return `
    <h2 class="act-modal-title">⚔️ Conflict Resolver</h2>
    <p class="act-modal-desc">Two teammates edited the same line! Resolve the merge conflict by choosing the correct version.</p>
    <div style="background:var(--bg);border-radius:12px;padding:20px;font-family:var(--font-mono);font-size:13px;line-height:1.9;margin-bottom:20px;">
      <span style="color:var(--text-muted)">/* styles.css */</span><br/>
      <span style="color:var(--text)">body {</span><br/>
      <span style="color:var(--red)">  &lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD (your branch)</span><br/>
      <span style="color:var(--green)">  background-color: #1a1a2e;</span><br/>
      <span style="color:var(--yellow)">  =======</span><br/>
      <span style="color:var(--blue)">  background-color: #f5f5f5;</span><br/>
      <span style="color:var(--red)">  &gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/light-mode (teammate's branch)</span><br/>
      <span style="color:var(--text)">  font-family: sans-serif;</span><br/>
      <span style="color:var(--text)">}</span>
    </div>
    <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px;">Your app is a <b>dark-themed</b> app. Which version should win?</p>
    <div style="display:flex;flex-direction:column;gap:10px;" id="conflict-opts">
      <button class="quiz-option" onclick="resolveConflict(0)"><span class="quiz-opt-letter">A</span>Keep #1a1a2e (dark blue — your branch)</button>
      <button class="quiz-option" onclick="resolveConflict(1)"><span class="quiz-opt-letter">B</span>Keep #f5f5f5 (light gray — teammate's branch)</button>
      <button class="quiz-option" onclick="resolveConflict(2)"><span class="quiz-opt-letter">C</span>Keep both lines (use both colors)</button>
      <button class="quiz-option" onclick="resolveConflict(3)"><span class="quiz-opt-letter">D</span>Delete both lines</button>
    </div>
    <div id="conflict-result"></div>
  `;
}

function initConflictResolve() {}

function resolveConflict(idx) {
  document.querySelectorAll('#conflict-opts .quiz-option').forEach((b, i) => {
    b.classList.add('disabled');
    if (i === 0) b.classList.add('correct');
    else if (i === idx) b.classList.add('wrong');
  });
  const msgs = [
    '🎯 Correct! Since the app is dark-themed, you keep YOUR version (#1a1a2e). You delete the conflict markers, keep that one line, and commit the resolved file.',
    "📚 Not quite! The teammate's light mode conflicts with your dark theme. Communication is key — discuss with teammates before merging!",
    '📚 Not quite! CSS only uses one background-color. You cannot have two — the last one would win, causing confusion.',
    '📚 Not quite! Deleting both would leave no background color — you need to pick one!'
  ];
  document.getElementById('conflict-result').innerHTML = `<div class="quiz-explanation" style="margin-top:16px;">${msgs[idx]} ${idx === 0 ? '+70 XP' : '+10 XP'}</div>`;
  addXP(idx === 0 ? 70 : 10);
}

function renderGitignoreBuilder() {
  const files = [
    { name: 'node_modules/', should: true },
    { name: '.env', should: true },
    { name: 'index.js', should: false },
    { name: '*.log', should: true },
    { name: 'package.json', should: false },
    { name: '.DS_Store', should: true },
    { name: 'dist/', should: true },
    { name: 'README.md', should: false },
  ];
  return `
    <h2 class="act-modal-title">🙈 .gitignore Builder</h2>
    <p class="act-modal-desc">For a Node.js project, click all the files/folders that SHOULD be in .gitignore (i.e., should NOT be tracked by Git).</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;" id="ignore-grid">
      ${files.map((f, i) => `
        <div class="meaning-item" id="ignore-item-${i}" onclick="toggleIgnore(${i}, ${f.should})" data-selected="false">
          ${f.name}
        </div>
      `).join('')}
    </div>
    <button class="btn-primary" onclick="checkIgnore()" style="margin-right:10px;">Check My .gitignore</button>
    <div id="ignore-result" style="margin-top:16px;"></div>
  `;
}

function initGitignoreBuilder() {}

function toggleIgnore(idx, shouldIgnore) {
  const el = document.getElementById(`ignore-item-${idx}`);
  const selected = el.dataset.selected === 'true';
  el.dataset.selected = !selected;
  el.classList.toggle('selected', !selected);
}

function checkIgnore() {
  const files = [
    { name: 'node_modules/', should: true },
    { name: '.env', should: true },
    { name: 'index.js', should: false },
    { name: '*.log', should: true },
    { name: 'package.json', should: false },
    { name: '.DS_Store', should: true },
    { name: 'dist/', should: true },
    { name: 'README.md', should: false },
  ];
  let correct = 0;
  files.forEach((f, i) => {
    const el = document.getElementById(`ignore-item-${i}`);
    const selected = el.dataset.selected === 'true';
    el.classList.remove('selected');
    if (selected === f.should) { el.classList.add('matched'); correct++; }
    else el.style.borderColor = 'var(--red)';
  });
  const pct = Math.round(correct / files.length * 100);
  document.getElementById('ignore-result').innerHTML = `
    <div class="quiz-explanation">${correct}/${files.length} correct (${pct}%)! ${pct === 100 ? '🏆 Perfect!' : 'Check the highlighted ones.'} +${correct * 3} XP</div>
  `;
  addXP(correct * 3);
}

function renderReadmeWriter() {
  return `
    <h2 class="act-modal-title">📝 README Writer</h2>
    <p class="act-modal-desc">Write a README for a "GitClub Website" project using Markdown. Preview updates as you type!</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;height:320px;">
      <div>
        <div style="font-size:12px;color:var(--text-muted);font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">✍️ Markdown</div>
        <textarea id="readme-editor" style="width:100%;height:280px;background:var(--bg);border:1.5px solid var(--bg5);border-radius:10px;padding:14px;color:var(--yellow-light);font-family:var(--font-mono);font-size:12px;resize:none;outline:none;line-height:1.7;" oninput="updateReadmePreview()" placeholder="# My Project\n\nA cool project!\n\n## Installation\n...">
# GitClub Website 🐱

A fun, interactive website to teach GitHub to friends!

## Features
- 14 learning modules
- Fun quizzes
- Terminal simulator
- Progress tracking

## Tech Stack
- HTML, CSS, JavaScript
- No frameworks needed!

## How to Use
1. Open index.html in a browser
2. Follow the learning roadmap
3. Complete quizzes to earn XP

## Contributing
Pull requests are welcome!</textarea>
      </div>
      <div>
        <div style="font-size:12px;color:var(--text-muted);font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">👁️ Preview</div>
        <div id="readme-preview" style="height:280px;background:var(--bg);border:1.5px solid var(--bg5);border-radius:10px;padding:14px;overflow-y:auto;font-size:13px;line-height:1.7;color:var(--text);"></div>
      </div>
    </div>
    <button class="btn-primary" style="margin-top:16px;" onclick="submitReadme()">Submit README (+50 XP)</button>
  `;
}

function updateReadmePreview() {
  const text = document.getElementById('readme-editor')?.value || '';
  const preview = document.getElementById('readme-preview');
  if (!preview) return;
  let html = text
    .replace(/^# (.+)$/gm, '<h1 style="font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--yellow);margin:12px 0 8px;">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text);margin:12px 0 6px;">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:15px;font-weight:700;color:var(--text-muted);margin:8px 0 4px;">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg4);padding:1px 5px;border-radius:4px;font-family:var(--font-mono);color:var(--yellow-light);">$1</code>')
    .replace(/^- (.+)$/gm, '<li style="margin:3px 0;color:var(--text-muted);">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:3px 0;color:var(--text-muted);">$1</li>')
    .replace(/\n/g, '<br/>');
  preview.innerHTML = html;
}

function submitReadme() {
  const text = document.getElementById('readme-editor')?.value || '';
  if (text.length > 50) {
    addXP(50);
    showToast('📝 Great README! +50 XP');
  } else {
    showToast('✍️ Write a bit more first!');
  }
}

function renderBranchDraw() {
  return `
    <h2 class="act-modal-title">🌿 Branch Sketch</h2>
    <p class="act-modal-desc">Read these git commands and match the resulting branch tree!</p>
    <div style="background:var(--bg);border-radius:12px;padding:20px;font-family:var(--font-mono);font-size:13px;line-height:2;margin-bottom:20px;">
      <span style="color:var(--yellow)">$</span> git init<br/>
      <span style="color:var(--yellow)">$</span> git commit -m "A"<br/>
      <span style="color:var(--yellow)">$</span> git commit -m "B"<br/>
      <span style="color:var(--yellow)">$</span> git branch feature<br/>
      <span style="color:var(--yellow)">$</span> git commit -m "C"  <span style="color:var(--text-muted)">&lt;-- on main</span><br/>
      <span style="color:var(--yellow)">$</span> git switch feature<br/>
      <span style="color:var(--yellow)">$</span> git commit -m "D"<br/>
      <span style="color:var(--yellow)">$</span> git commit -m "E"
    </div>
    <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px;">Which diagram shows the correct branch tree?</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;" id="branch-opts">
      <button class="quiz-option" onclick="checkBranch(0)" style="flex-direction:column;align-items:flex-start;gap:4px;font-family:var(--font-mono);font-size:12px;">
        <span style="color:var(--text-muted)">Option A</span>
        <span>main: A—B—C</span>
        <span>feature:  \\—D—E</span>
      </button>
      <button class="quiz-option" onclick="checkBranch(1)" style="flex-direction:column;align-items:flex-start;gap:4px;font-family:var(--font-mono);font-size:12px;">
        <span style="color:var(--text-muted)">Option B</span>
        <span>main: A—B—C—D—E</span>
        <span>feature:  \\</span>
      </button>
      <button class="quiz-option" onclick="checkBranch(2)" style="flex-direction:column;align-items:flex-start;gap:4px;font-family:var(--font-mono);font-size:12px;">
        <span style="color:var(--text-muted)">Option C</span>
        <span>main: A—B—D—E</span>
        <span>feature: C</span>
      </button>
      <button class="quiz-option" onclick="checkBranch(3)" style="flex-direction:column;align-items:flex-start;gap:4px;font-family:var(--font-mono);font-size:12px;">
        <span style="color:var(--text-muted)">Option D</span>
        <span>main: A—B</span>
        <span>feature: C—D—E</span>
      </button>
    </div>
    <div id="branch-result"></div>
  `;
}

function checkBranch(idx) {
  document.querySelectorAll('#branch-opts .quiz-option').forEach((b, i) => {
    b.classList.add('disabled');
    if (i === 0) b.classList.add('correct');
    else if (i === idx) b.classList.add('wrong');
  });
  document.getElementById('branch-result').innerHTML = `
    <div class="quiz-explanation" style="margin-top:16px;">
      ${idx === 0 ? '🎯 Correct!' : '📚 Not quite!'} After A—B, the feature branch is created. C is committed on main. Then we switch to feature and commit D, E. So main has A—B—C and feature branches off at B with D—E. ${idx === 0 ? '+50 XP' : '+10 XP'}
    </div>
  `;
  addXP(idx === 0 ? 50 : 10);
}

function renderPRReview() {
  return `
    <h2 class="act-modal-title">🔍 Code Review Simulator</h2>
    <p class="act-modal-desc">Review this pull request! Find what needs to be changed before it can be merged.</p>
    <div style="background:var(--bg);border-radius:12px;padding:20px;margin-bottom:20px;">
      <div style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--text);margin-bottom:8px;">PR #42: Add user login feature</div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">by <span style="color:var(--yellow)">new-dev</span> → main</div>
      <div style="font-family:var(--font-mono);font-size:12px;line-height:1.9;background:var(--bg2);border-radius:8px;padding:16px;">
        <span style="color:var(--text-muted)">// auth.js</span><br/>
        <span style="color:var(--blue)">function</span> <span style="color:var(--yellow)">login</span>(username, password) {<br/>
        &nbsp;&nbsp;<span style="color:var(--text-muted)">// hardcoded admin password!</span><br/>
        &nbsp;&nbsp;<span style="color:var(--blue)">if</span> (password === <span style="color:var(--green)">"admin123"</span>) {<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style="color:var(--blue)">return</span> <span style="color:var(--yellow)">true</span>;<br/>
        &nbsp;&nbsp;}<br/>
        &nbsp;&nbsp;console.log(<span style="color:var(--green)">"User: "</span> + username + <span style="color:var(--green)">" Password: "</span> + password);<br/>
        &nbsp;&nbsp;<span style="color:var(--blue)">return</span> authenticate(username, password);<br/>
        }
      </div>
    </div>
    <p style="color:var(--text-muted);font-size:14px;margin-bottom:14px;">What should you do? (Select all that apply)</p>
    <div style="display:flex;flex-direction:column;gap:10px;" id="pr-opts">
      <button class="quiz-option" data-correct="true" onclick="togglePROption(this)"><span class="quiz-opt-letter">A</span>Request changes — hardcoded password is a security risk</button>
      <button class="quiz-option" onclick="togglePROption(this)"><span class="quiz-opt-letter">B</span>Approve and merge immediately, it looks fine</button>
      <button class="quiz-option" data-correct="true" onclick="togglePROption(this)"><span class="quiz-opt-letter">C</span>Comment: remove console.log that prints passwords!</button>
      <button class="quiz-option" onclick="togglePROption(this)"><span class="quiz-opt-letter">D</span>Close the PR without comment</button>
      <button class="quiz-option" data-correct="true" onclick="togglePROption(this)"><span class="quiz-opt-letter">E</span>Comment: use environment variable for credentials</button>
    </div>
    <button class="btn-primary" style="margin-top:16px;" onclick="submitPRReview()">Submit Review</button>
    <div id="pr-result"></div>
  `;
}

function togglePROption(el) {
  el.classList.toggle('selected');
}

function submitPRReview() {
  const opts = document.querySelectorAll('#pr-opts .quiz-option');
  let correct = 0, total = 3;
  opts.forEach(opt => {
    const isSelected = opt.classList.contains('selected');
    const shouldBe = opt.dataset.correct === 'true';
    if (isSelected && shouldBe) { opt.classList.add('correct'); correct++; }
    else if (isSelected && !shouldBe) opt.classList.add('wrong');
    else if (!isSelected && shouldBe) opt.style.opacity = '0.5';
    opt.classList.remove('selected');
    opt.style.pointerEvents = 'none';
  });
  const xp = correct * 20;
  document.getElementById('pr-result').innerHTML = `
    <div class="quiz-explanation" style="margin-top:16px;">
      You found ${correct}/${total} issues! The big red flags: (1) hardcoded "admin123" password — anyone who reads the code knows it!, (2) logging passwords to console — huge security breach!, (3) credentials should be in .env files. This is why code review matters! +${xp} XP
    </div>
  `;
  addXP(xp);
}

// ══════════════════════════════════════════════
// LEADERBOARD
// ══════════════════════════════════════════════
function addToLeaderboard() {
  const input = document.getElementById('lb-name-input');
  const name = input.value.trim();
  if (!name) { showToast('Please enter your name!'); return; }
  state.currentUser = name;
  updateLeaderboard();
  input.value = '';
  showToast(`🎉 ${name} joined the leaderboard!`);
}

function updateLeaderboard() {
  if (!state.currentUser) return;
  const existing = state.leaderboard.find(p => p.name === state.currentUser);
  if (existing) {
    existing.xp = state.xp;
    existing.level = getLevelName();
    existing.modules = state.modulesCompleted.length;
  } else {
    state.leaderboard.push({
      name: state.currentUser,
      xp: state.xp,
      level: getLevelName(),
      modules: state.modulesCompleted.length
    });
  }
  saveState();
  renderLeaderboard();
}

// ══════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  clearInterval(speedTimerInterval);
}

function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.add('hidden'), duration);
}

function startJourney() {
  document.getElementById('modules').scrollIntoView({ behavior: 'smooth' });
  changeMascotTip("Let's start with <b>Module 1</b> — What is Git & GitHub? 🌍 You're going to love it!");
}

function scrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Keyboard close for modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['module-modal', 'quiz-modal', 'activity-modal'].forEach(id => {
      if (!document.getElementById(id).classList.contains('hidden')) {
        closeModal(id);
      }
    });
  }
});

// Auto-update readme preview on render
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateReadmePreview, 500);
});
