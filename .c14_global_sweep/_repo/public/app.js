// Global state
let currentUser = null;
let authToken = null;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const walletSection = document.getElementById('walletSection');
const loginForm = document.getElementById('loginForm');
const addTokenForm = document.getElementById('addTokenForm');
const loginMessage = document.getElementById('loginMessage');
const currentUserSpan = document.getElementById('currentUser');
const tokenBalanceSpan = document.getElementById('tokenBalance');
const tokenList = document.getElementById('tokenList');
const commitLog = document.getElementById('commitLog');
const logoutBtn = document.getElementById('logoutBtn');
const refreshCommitsBtn = document.getElementById('refreshCommits');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCommits();
    setupEventListeners();
    setupWordLinks();
});

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    addTokenForm.addEventListener('submit', handleAddToken);
    logoutBtn.addEventListener('click', handleLogout);
    refreshCommitsBtn.addEventListener('click', loadCommits);
}

function setupWordLinks() {
    const wordLinks = document.querySelectorAll('.word-link');
    wordLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const project = link.getAttribute('data-project');
            showProjectInfo(project);
        });
    });
}

function showProjectInfo(project) {
    const projectInfo = {
        'freestyle': 'Freestyle BMX Project - Advanced trick scripting and automation',
        'bmx': 'BMX Core System - Base framework for bike control',
        'tricks': 'Tricks Library - Collection of BMX trick definitions',
        'mongoose': 'Mongoose OS - Main operating system for bike computers',
        'scripting': 'Scripting Engine - Custom language for trick programming',
        'copilot': 'CoPilot Integration - AI-assisted trick design',
        'integration': 'Project Integration Hub - Connect all co-pilot projects',
        'projects': 'All Projects Dashboard - View all connected repositories'
    };
    
    alert(`🚴 ${project.toUpperCase()}\n\n${projectInfo[project] || 'Project information coming soon!'}\n\nThis link will integrate with your other co-pilot repositories for seamless collaboration.`);
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.username;
            authToken = data.token;
            
            showMessage(loginMessage, 'Login successful! Saved as server-side commit.', 'success');
            
            setTimeout(() => {
                loginSection.style.display = 'none';
                walletSection.style.display = 'block';
                currentUserSpan.textContent = currentUser;
                tokenBalanceSpan.textContent = data.tokens;
                loadWallet();
                loadCommits();
            }, 1000);
        } else {
            showMessage(loginMessage, data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage(loginMessage, 'Error connecting to server', 'error');
        console.error('Login error:', error);
    }
}

async function handleAddToken(e) {
    e.preventDefault();
    
    const tokenType = document.getElementById('tokenType').value;
    const amount = document.getElementById('amount').value;
    
    try {
        const response = await fetch('/api/wallet/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: currentUser,
                tokenType,
                amount 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            tokenBalanceSpan.textContent = data.balance;
            displayTokens(data.wallet);
            loadCommits();
            
            // Reset form
            document.getElementById('amount').value = '1';
            
            // Show success animation
            tokenBalanceSpan.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                tokenBalanceSpan.style.animation = '';
            }, 500);
        }
    } catch (error) {
        console.error('Error adding token:', error);
        alert('Failed to add token');
    }
}

async function loadWallet() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/api/wallet/${currentUser}`);
        const data = await response.json();
        
        if (data.success) {
            tokenBalanceSpan.textContent = data.balance;
            displayTokens(data.tokens);
        }
    } catch (error) {
        console.error('Error loading wallet:', error);
    }
}

function displayTokens(tokens) {
    if (!tokens || tokens.length === 0) {
        tokenList.innerHTML = '<p style="color: #999; text-align: center;">No tokens yet. Add some tokens to get started!</p>';
        return;
    }
    
    tokenList.innerHTML = tokens.map(token => `
        <div class="token-item ${token.type}">
            <strong>${token.type.toUpperCase()}</strong>
            <div>Amount: ${token.amount}</div>
            <small>${new Date(token.timestamp).toLocaleString()}</small>
        </div>
    `).join('');
}

async function loadCommits() {
    try {
        const response = await fetch('/api/commits');
        const data = await response.json();
        
        if (data.success && data.commits.length > 0) {
            commitLog.innerHTML = data.commits.reverse().map(commit => `
                <div class="commit-item">
                    <div class="commit-user">👤 ${commit.username}</div>
                    <div class="commit-action">📝 Action: ${commit.action.replace('_', ' ')}</div>
                    ${commit.tokenType ? `<div>Token Type: ${commit.tokenType}</div>` : ''}
                    ${commit.amount ? `<div>Amount: ${commit.amount}</div>` : ''}
                    <div class="commit-time">🕒 ${new Date(commit.timestamp).toLocaleString()}</div>
                </div>
            `).join('');
        } else {
            commitLog.innerHTML = '<p style="color: #999; text-align: center;">No commits yet. Login to create your first commit!</p>';
        }
    } catch (error) {
        console.error('Error loading commits:', error);
        commitLog.innerHTML = '<p style="color: #999; text-align: center;">Error loading commits</p>';
    }
}

function handleLogout() {
    currentUser = null;
    authToken = null;
    
    loginSection.style.display = 'block';
    walletSection.style.display = 'none';
    
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    loginMessage.className = 'message';
    loginMessage.style.display = 'none';
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }
}

// Add pulse animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
`;
document.head.appendChild(style);
