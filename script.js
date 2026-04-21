// Global variables
let currentLesson = 0;
let quizScore = 0;
let quizCurrent = 0;
let completedLessons = new Set();

// GitHub Lessons data
const lessons = [
    {
        icon: '👤',
        title: 'What is GitHub?',
        content: `
            <div class="lesson-step">
                <h4>🎯 GitHub = Your Code Superhero Base!</h4>
                <ul>
                    <li>🌍 Biggest code sharing platform (100M+ users!)</li>
                    <li>📁 Save & share your projects</li>
                    <li>👥 Work with friends (team coding!)</li>
                    <li>⭐ Show your skills to the world</li>
                </ul>
                <div class="tip-box">
                    <strong>💡 Pro Tip:</strong> Think of GitHub like Google Drive for code!
                </div>
            </div>
        `
    },
    {
        icon: '📝',
        title: 'Create Your Account',
        content: `
            <div class="lesson-step">
                <h4>🚀 Step 1: Sign Up!</h4>
                <ol>
                    <li>Go to <a href="https://github.com" target="_blank">github.com</a></li>
                    <li>Click "Sign up" (green button)</li>
                    <li>Pick a cool username! 🎮</li>
                    <li>Add email & password</li>
                    <li>Verify your email 📧</li>
                </ol>
                <div class="challenge">
                    <strong>⚡ Challenge:</strong> Create your account NOW!
                </div>
            </div>
        `
    },
    {
        icon: '📁',
        title: 'Your First Repository',
        content: `
            <div class="lesson-step">
                <h4>🏠 Step 2: Make a Repo!</h4>
                <ol>
                    <li>Click green "New" button</li>
                    <li>Name it "my-first-repo" 😎</li>
                    <li>Write a description</li>
                    <li>Click "Create repository"</li>
                </ol>
                <img src="https://via.placeholder.com/400x200/6C63FF/FFFFFF?text=New+Repo+Screen" alt="Repo" class="demo-img">
                <div class="tip-box">
                    <strong>💡 Repo = Repository = Your project folder!</strong>
                </div>
            </div>
        `
    },
    {
        icon: '💾',
        title: 'Upload Your Code',
        content: `
            <div class="lesson-step">
                <h4>⬆️ Step 3: Upload Files!</h4>
                <div class="code-demo">
                    <pre><code># Drag & drop your files here!
# Or click "uploading an existing file"

📄 index.html
📄 style.css
📄 script.js</code></pre>
                </div>
                <ol>
                    <li>Drag files to upload area</li>
                    <li>Write commit message: "My first website!"</li>
                    <li>Click "Commit changes"</li>
                </ol>
            </div>
        `
    },
    {
        icon: '🌐',
        title: 'Share Your Project',
        content: `
            <div class="lesson-step">
                <h4>🔗 Step 4: Go Public!</h4>
                <ul>
                    <li>Copy your repo URL 📋</li>
                    <li>Share with friends! 👫</li>
                    <li>Add to your resume ⭐</li>
                    <li>Click "Code" → "Codespaces" for online editing</li>
                </ul>
                <div class="success-box">
                    <strong>🎉 YOU DID IT!</strong><br>
                    You're now a GitHub Pro! 🚀
                </div>
            </div>
        `
    }
];

// Quiz questions
const quizQuestions = [
    {
        question: "What does GitHub help you do?",
        options: ["Save code", "Eat pizza", "Play games", "Watch movies"],
        correct: 0
    },
    {
        question: "What's a repository called?",
        options: ["Repo", "Recipe", "Report", "Replay"],
        correct: 0
    },
    {
        question: "How do you upload files?",
        options: ["Drag & drop", "Magic spell", "Email", "Carrier pigeon"],
        correct: 0
    },
    {
        question: "What's a good first commit message?",
        options: ["First commit!", "Hello world", "Added stuff", "My first website"],
        correct: 3
    },
    {
        question: "Where do you create a new repo?",
        options: ["Green New button", "Settings", "Profile", "Stars"],
        correct: 0
    },
    {
        question: "GitHub has how many users?",
        options: ["10", "100 million+", "1 billion", "Just you"],
        correct: 1
    },
    {
        question: "What's Codespaces?",
        options: ["Online code editor", "Game", "Music player", "Chat app"],
        correct: 0
    },
    {
        question: "Repo = ?",
        options: ["Project folder", "Recipe book", "Report card", "Replay button"],
        correct: 0
    },
    {
        question: "How to share your repo?",
        options: ["Copy URL", "Send postcard", "Carrier pigeon", "Morse code"],
        correct: 0
    },
    {
        question: "You're now a...?",
        options: ["GitHub Pro!", "Pizza expert", "Math wizard", "Dance master"],
        correct: 0
    }
];

// DOM elements
const elements = {
    lessonsContainer: document.querySelector('.lessons-container'),
    nextBtn: document.getElementById('nextBtn'),
    globalProgress: document.getElementById('globalProgress'),
    quizContainer: document.getElementById('quizContainer'),
    quizScore: document.getElementById('quizScore'),
    score: document.getElementById('score')
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    createLessons();
    updateProgress();
    createTeamMembers();
});

// Navbar mobile
function initNavbar() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Smooth scroll
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Create lessons cards
function createLessons() {
    lessons.forEach((lesson, index) => {
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="lesson-icon">${lesson.icon}</div>
            <h3>${lesson.title}</h3>
            <div class="lesson-content">${lesson.content}</div>
        `;
        
        card.addEventListener('click', () => showLesson(index));
        elements.lessonsContainer.appendChild(card);
    });
    
    showLesson(0);
}

// Show specific lesson
function showLesson(index) {
    const cards = document.querySelectorAll('.lesson-card');
    cards.forEach((card, i) => {
        card.classList.remove('active', 'completed');
        if (i <= index) {
            card.classList.add('completed');
            completedLessons.add(i);
        }
    });
    
    const activeCard = cards[index];
    activeCard.classList.add('active');
    
    // Scroll to lesson
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    currentLesson = index;
    updateProgress();
}

// Next lesson
function nextLesson() {
    if (currentLesson < lessons.length - 1) {
        showLesson(currentLesson + 1);
    }
}

// Update progress
function updateProgress() {
    const progress = (completedLessons.size / lessons.length) * 100;
    elements.globalProgress.style.width = `${progress}%`;
    elements.globalProgress.textContent = `${Math.round(progress)}%`;
}

// Quiz functions
function startQuiz() {
    quizCurrent = 0;
    quizScore = 0;
    elements.quizScore.style.display = 'none';
    showQuizQuestion();
}

function showQuizQuestion() {
    if (quizCurrent >= quizQuestions.length) {
        showQuizResults();
        return;
    }
    
    const q = quizQuestions[quizCurrent];
    elements.quizContainer.innerHTML = `
        <div class="question-card">
            <div class="quiz-question">${quizCurrent + 1}. ${q.question}</div>
            <div class="quiz-options">
                ${q.options.map((option, i) => 
                    `<button class="option-btn" onclick="selectAnswer(${i})">${option}</button>`
                ).join('')}
            </div>
        </div>
    `;
}

function selectAnswer(selected) {
    const q = quizQuestions[quizCurrent];
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach((btn, i) => {
        if (i === q.correct) {
            btn.classList.add('correct');
        } else if (i === selected && i !== q.correct) {
            btn.classList.add('wrong');
        }
        btn.disabled = true;
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
    
    // Confetti effect
    confettiEffect();
}

function confettiEffect() {
    // Simple confetti using canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.zIndex = '3000';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 100,
            size: Math.random() * 5 + 5,
            speedX: Math.random() * 3 - 1.5,
            speedY: Math.random() * 3 + 2,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            p.x += p.speedX;
            p.y += p.speedY;
            p.speedY += 0.1;
            
            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    setTimeout(() => {
        document.body.removeChild(canvas);
    }, 3000);
}

// Projects modal
document.addEventListener('click', (e) => {
    if (e.target.dataset.modal) {
        showProjectModal(e.target.dataset.modal);
    }
});

document.querySelector('.close').addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

function showProjectModal(projectId) {
    const projects = {
        project1: {
            title: "🎮 Game Repo",
            content: `
                <h3>Build Tic-Tac-Toe!</h3>
                <p>1. Create repo: "tic-tac-toe"</p>
                <p>2. Upload game files</p>
                <p>3. Add README.md with game rules</p>
                <p><strong>Bonus:</strong> Deploy to GitHub Pages!</p>
                <a href="https://github.com/new" target="_blank" class="btn-primary">Start Now!</a>
            `
        },
        project2: {
            title: "🤖 Chatbot",
            content: `
                <h3>Create Your Bot!</h3>
                <p>1. Repo: "my-chatbot"</p>
                <p>2. Use JavaScript</p>
                <p>3. Add cool responses</p>
                <a href="https://github.com/new" target="_blank" class="btn-primary">Create Repo!</a>
            `
        },
        project3: {
            title: "🎨 Portfolio",
            content: `
                <h3>Show Your Skills!</h3>
                <p>1. Repo: "my-portfolio"</p>
                <p>2. Add index.html</p>
                <p>3. Link your GitHub</p>
                <p>4. Enable GitHub Pages</p>
                <a href="https://pages.github.com/" target="_blank" class="btn-primary">Learn Pages!</a>
            `
        }
    };
    
    document.getElementById('modalBody').innerHTML = projects[projectId].content;
    document.getElementById('projectModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('projectModal').style.display = 'none';
}

// Team members
function createTeamMembers() {
    const teamNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan'];
    const teamGrid = document.querySelector('.team-grid');
    
    teamNames.forEach(name => {
        const member = document.createElement('div');
        member.className = 'team-member';
        member.innerHTML = `
            <img src="https://via.placeholder.com/100/${Math.floor(Math.random()*16777215).toString(16)}/FFFFFF?text=${name[0]}" alt="${name}">
            <h4>${name}</h4>
            <p>Git Master (13yo)</p>
        `;
        teamGrid.appendChild(member);
    });
}

// Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.querySelectorAll('.lesson-card, .project-card, .team-member').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentLesson < lessons.length - 1) {
        nextLesson();
    }
});
