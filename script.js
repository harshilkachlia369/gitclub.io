// ============================================
// Git Club - Complete Interactive Script
// Perfect for 12-14 year olds learning GitHub
// ============================================

// Global state
let currentLesson = 0;
let quizScore = 0;
let quizCurrent = 0;
let completedLessons = new Set();

// GitHub Lessons (kid-friendly & complete)
const lessons = [
    {
        icon: '👋',
        title: 'What is GitHub?',
        content: `
            <div class="lesson-step">
                <h4>🎯 GitHub = Code Superhero HQ!</h4>
                <p><strong>GitHub is like:</strong></p>
                <ul>
                    <li>📱 Instagram for programmers</li>
                    <li>📂 Google Drive for code</li>
                    <li>👥 Teamwork for coding projects</li>
                    <li>⭐ Show your skills to companies</li>
                </ul>
                <div class="tip-box">
                    <strong>💡 Fun Fact:</strong> 100+ MILLION people use GitHub!
                </div>
                <div class="challenge">
                    <strong>⚡ Ready?</strong> Let's make your account next!
                </div>
            </div>
        `
    },
    {
        icon: '📝',
        title: 'Create Account (2 min)',
        content: `
            <div class="lesson-step">
                <h4>🚀 Step 1: Sign Up!</h4>
                <ol>
                    <li><strong>Go to:</strong> <a href="https://github.com" target="_blank" style="color: #fff; font-weight: 600;">github.com</a></li>
                    <li>Click green <strong>"Sign up"</strong> button</li>
                    <li>Pick username like <code>coolcoder123</code></li>
                    <li>Add email + password</li>
                    <li>Check email to verify 📧</li>
                </ol>
                <div class="success-box">
                    <strong>✅ DONE?</strong> You have GitHub account!
                </div>
            </div>
        `
    },
    {
        icon: '📁',
        title: 'Make First Repo',
        content: `
            <div class="lesson-step">
                <h4>🏠 Step 2: Create Repository!</h4>
                <ol>
                    <li>Click green <strong>"New"</strong> button</li>
                    <li>Name: <code>my-first-project</code></li>
                    <li>Description: "My awesome project!"</li>
                    <li>Click <strong>"Create repository"</strong></li>
                </ol>
                <div class="code-demo">
                    <pre><code>📁 my-first-project/
├── README.md
└── (your files here)</code></pre>
                </div>
                <div class="tip-box">
                    <strong>💡 Repo = Repository = Your project folder!</strong>
                </div>
            </div>
        `
    },
    {
        icon: '⬆️',
        title: 'Upload Files',
        content: `
            <div class="lesson-step">
                <h4>💾 Step 3: Add Your Code!</h4>
                <p><strong>Super easy - drag & drop!</strong></p>
                <ol>
                    <li>Make <code>index.html</code>, <code>style.css</code></li>
                    <li><strong>Drag files</strong> to GitHub upload area</li>
                    <li>Write message: <code>"Add my website"</code></li>
                    <li>Click <strong>"Commit changes"</strong></li>
                </ol>
                <div class="challenge">
                    <strong>⚡ Challenge:</strong> Upload a file NOW!
                </div>
            </div>
        `
    },
    {
        icon: '🌟',
        title: 'Share & Level Up!',
        content: `
            <div class="lesson-step">
                <h4>🎉 Step 4: You're a GitHub Pro!</h4>
                <ul>
                    <li>📋 <strong>Copy URL</strong> to share</li>
                    <li>👥 Invite friends to collaborate</li>
                    <li>⭐ Put on resume!</li>
                    <li>⚡ <strong>Codespaces:</strong> Edit code online</li>
                </ul>
                <div class="success-box">
                    <h4>🥳 GIT CLUB MASTER!</h4>
                    <p>Share your repo link with friends!</p>
                    <a href="#quiz" class="btn btn-secondary" onclick="scrollToSection('quiz')" style="margin-top: 1rem; display: inline-block;">Take Quiz →</a>
                </div>
            </div>
        `
    }
];

// Quiz (10 fun questions)
const quizQuestions = [
    { question: "GitHub is like what for code?", options: ["📱 Instagram", "🍕 Pizza delivery", "📚 Library", "🎮 Game console"], correct: 0 },
    { question: "What's a repository?", options: ["📁 Project folder", "📝 Recipe", "📊 Report", "🎵 Song"], correct: 0 },
    { question: "How to upload files?", options: ["⬆️ Drag & drop", "✉️ Email", "📞 Call GitHub", "🪄 Magic"], correct: 0 },
    { question: "Where's the New button?", options: ["🟢 Green button", "🔴 Red button", "🔵 Blue button", "🟡 Yellow"], correct: 0 },
    { question: "Good commit message?", options: ["📝 'Added website'", "'hello'", "'stuff'", "'lol'"], correct: 0 },
    { question: "GitHub users?", options: ["100M+", "10", "1B", "Just you"], correct: 0 },
    { question: "Codespaces = ?", options: ["💻 Online editor", "🎮 Game", "📱 Phone app", "🍕 Pizza tracker"], correct: 0 },
    { question: "Share repo how?", options: ["🔗 Copy URL", "📮 Mail", "📞 Phone", "🕺 Dance"], correct: 0 },
    { question: "First repo name?", options: ["📂 my-first-repo", "hello", "test", "123"], correct: 0 },
    { question: "You're now?", options: ["🚀 GitHub Pro!", "🍕 Pizza chef", "🎮 Gamer", "🧙 Wizard"], correct: 0 }
];

// DOM Elements
const elements = {
    lessonsContainer: document.querySelector('.lessons-container'),
    nextBtn: document.getElementById('nextBtn'),
    globalProgress: document.getElementById('globalProgress'),
    quizContainer: document.getElementById('quizContainer'),
    quizScore: document.getElementById('quizScore'),
    score: document.getElementById('score')
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    createLessons();
    createTeamMembers();
    updateProgress();
    initScrollSpy();
});

// Navbar (mobile + desktop)
function initNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Smooth scroll
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================
// LESSONS SYSTEM (FULLY ACCESSIBLE)
// ============================================
function createLessons() {
    lessons.forEach((lesson, index) => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.dataset.index = index;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', index === 0 ? '0' : '-1');
        card.setAttribute('aria-label', `Lesson ${index + 1}: ${lesson.title}`);
        card.setAttribute('aria-expanded', 'false');
        card.setAttribute('aria-describedby', `lesson-${index}`);
        
        card.innerHTML = `
            <div class="lesson-icon">${lesson.icon}</div>
            <h3>${lesson.title}</h3>
            <div class="lesson-content" id="lesson-${index}">${lesson.content}</div>
        `;
        
        // Full accessibility support
        card.addEventListener('click', () => showLesson(index));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showLesson(index);
            }
        });
        
        elements.lessonsContainer.appendChild(card);
    });
    
    // Auto-start first lesson
    setTimeout(() => showLesson(0), 500);
}

function showLesson(index) {
    const cards = document.querySelectorAll('.lesson-card');
    
    // Reset all cards
    cards.forEach((card, i) => {
        card.classList.remove('active', 'completed');
        card.setAttribute('aria-expanded', 'false');
        card.setAttribute('tabindex', '-1');
        
        if (i <= index) {
            card.classList.add('completed');
            completedLessons.add(i);
        }
    });
    
    // Activate current lesson
    const activeCard = cards[index];
    activeCard.classList.add('active');
    activeCard.setAttribute('aria-expanded', 'true');
    activeCard.setAttribute('tabindex', '0');
    activeCard.focus();
    
    // Update Next button
    const nextBtn = elements.nextBtn;
    if (index === lessons.length - 1) {
        nextBtn.innerHTML = '🎉 <strong>Course Complete!</strong> <i class="fas fa-trophy"></i>';
        nextBtn.disabled = true;
        nextBtn.onclick = null;
    } else {
        nextBtn.innerHTML = 'Next Lesson <i class="fas fa-arrow-right"></i>';
        nextBtn.disabled = false;
        nextBtn.onclick = () => nextLesson();
    }
    
    currentLesson = index;
    updateProgress();
    
    // Smooth scroll to lesson
    activeCard.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

function nextLesson() {
    if (currentLesson < lessons.length - 1) {
        showLesson(currentLesson + 1);
    }
}

// Progress tracking
function updateProgress() {
    const progress = Math.round((completedLessons.size / lessons.length) * 100);
    elements.globalProgress.style.width = `${progress}%`;
    elements.globalProgress.textContent = `${progress}%`;
}

// ============================================
// QUIZ SYSTEM
// ============================================
function startQuiz() {
    quizCurrent = 0;
    quizScore = 0;
    elements.quizScore.style.display = 'none';
    elements.quizContainer.style.display = 'block';
    elements.quizContainer.innerHTML = `
        <div class="question-card">
            <div class="quiz-question">🚀 Ready to test your GitHub skills?</div>
            <button class="btn btn-primary quiz-start" onclick="showQuizQuestion()">
                Start Quiz! <i class="fas fa-rocket"></i>
            </button>
        </div>
    `;
}

function showQuizQuestion() {
    if (quizCurrent >= quizQuestions.length) {
        showQuizResults();
        return;
    }
    
    const q = quizQuestions[quizCurrent];
    elements.quizContainer.innerHTML = `
        <div class="question-card">
            <div class="quiz-question">
                <strong>Q${quizCurrent + 1}:</strong> ${q.question}
            </div>
            <div class="quiz-options">
                ${q.options.map((option, i) => 
                    `<button class="option-btn" onclick="selectAnswer(${i})" tabindex="0">
                        ${option}
                    </button>`
                ).join('')}
            </div>
            <small>${quizCurrent + 1} of ${quizQuestions.length}</small>
        </div>
    `;
}

function selectAnswer(selected) {
    const q = quizQuestions[quizCurrent];
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach((btn, i) => {
        btn.disabled = true;
        btn.tabIndex = -1;
        
        if (i === q.correct) {
            btn.classList.add('correct');
            btn.setAttribute('aria-label', 'Correct answer');
        } else if (i === selected && i !== q.correct) {
            btn.classList.add('wrong');
            btn.setAttribute('aria-label', 'Incorrect answer');
        }
    });
    
    if (selected === q.correct) {
        quizScore++;
    }
    
    setTimeout(() => {
        quizCurrent++;
        showQuizQuestion();
    }, 1500);
}

function showQuizResults() {
    elements.quizContainer.style.display = 'none';
    elements.quizScore.style.display = 'block';
    elements.score.textContent = quizScore;
    
    const percentage = Math.round((quizScore / 10) * 100);
    let message = '';
    
    if (percentage >= 90) message = '🎉 GitHub GENIUS!';
    else if (percentage >= 70) message = '🚀 GitHub Pro!';
    else if (percentage >= 50) message = '👍 Good job!';
    else message = '📚 Keep learning!';
    
    elements.quizScore.innerHTML = `
        <h3>${message}</h3>
        <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary); margin: 1rem 0;">${quizScore}/10</div>
        <div style="font-size: 1.2rem; opacity: 0.8;">${percentage}%</div>
        <button class="btn btn-primary" onclick="startQuiz()" style="margin-top: 1.5rem;">
            Try Again! <i class="fas fa-redo"></i>
        </button>
    `;
    
    // Victory confetti
    if (percentage >= 80) confettiEffect();
}

// Confetti celebration
function confettiEffect() {
    // Canvas confetti (simple & lightweight)
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 100,
            vx: (Math.random() - 0.5) * 10,
            vy: Math.random() * -10 - 5,
            size: Math.random() * 6 + 3,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        
        particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.rotation += p.rotSpeed;
            
            if (p.y < canvas.height) active = true;
        });
        
        if (active) requestAnimationFrame(animate);
        else document.body.removeChild(canvas);
    }
    
    animate();
}

// ============================================
// PROJECTS MODAL
// ============================================
const projects = {
    project1: {
        title: "🎮 Tic-Tac-Toe Game",
        content: `
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Build a Game!</h3>
            <ol style="margin: 1rem 0;">
                <li>Create repo: <code>tic-tac-toe-game</code></li>
                <li>Upload <code>index.html</code> + <code>style.css</code></li>
                <li>Add <code>README.md</code> with rules</li>
                <li>Enable GitHub Pages (free hosting!)</li>
            </ol>
            <a href="https://github.com/new" target="_blank" class="btn btn-primary" style="margin-top: 1rem;">Create Repo Now!</a>
        `
    },
    project2: {
        title: "🤖 Personal Chatbot",
        content: `
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Make a Talking Bot!</h3>
            <p>1. Repo: <code>my-chatbot</code></p>
            <p>2. Use simple JavaScript</p>
            <p>3. Make it answer questions</p>
            <p><strong>Bonus:</strong> Deploy to internet!</p>
            <a href="https://github.com/new" target="_blank" class="btn btn-primary" style="margin-top: 1rem;">Start Bot!</a>
        `
    },
    project3: {
        title: "🎨 Your Portfolio",
        content: `
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Showcase Skills!</h3>
            <p>1. Repo: <code>my-portfolio</code></p>
            <p>2. Add your projects</p>
            <p>3. Link GitHub repos</p>
            <p>4. <strong>GitHub Pages</strong> = free website!</p>
            <a href="https://pages.github.com/" target="_blank" class="btn btn-primary" style="margin-top: 1rem;">Learn Pages</a>
        `
    }
};

// Modal handlers
document.addEventListener('click', (e) => {
    if (e.target.dataset.modal) {
        showProjectModal(e.target.dataset.modal);
    }
});

function showProjectModal(projectId) {
    document.getElementById('modalBody').innerHTML = projects[projectId].content;
    document.get
