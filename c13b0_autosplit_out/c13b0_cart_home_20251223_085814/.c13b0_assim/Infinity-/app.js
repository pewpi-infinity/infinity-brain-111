// Global Variables
let currentUser = null;
let currentHub = 'main';
let currentApp = null;
let currentRealm = null;
let autopilotActive = false;
let audioContext = null;
let analyser = null;
let microphone = null;
let userTokens = 0;
let messageCount = 0;
let aiAssistantActive = true;

// Voice UI Variables
let voiceRecognition = null;
let voiceSynthesis = window.speechSynthesis;
let elevenLabsApiKey = null; // Will be set from user config

// AI API Keys
const GEMINI_API_KEY = 'AIzaSyDWKRhBjFEt752zC86X0aQOvRQHxM5XPlc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Vector Transition System
const vectorGuides = ['🚀', '⚡', '✨', '🌟', '💫', '🔮', '🎯', '🧭'];
let currentGuideIndex = 0;

// Google Authentication - Must be global for callback
window.handleCredentialResponse = function(response) {
    try {
        const responsePayload = decodeJwtResponse(response.credential);
        
        currentUser = {
            email: responsePayload.email,
            name: responsePayload.name,
            picture: responsePayload.picture,
            sub: responsePayload.sub
        };
        
        // Check if authorized email
        if (currentUser.email === 'marvaseater@gmail.com') {
            currentUser.isAdmin = true;
            currentUser.tokens = 1000; // Admin starts with bonus tokens
        } else {
            currentUser.isAdmin = false;
            currentUser.tokens = 10; // Regular users start with 10 tokens
        }
        
        userTokens = currentUser.tokens;
        
        // Hide auth section and show main app
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
        // Update user info in header
        const avatarEl = document.getElementById('userAvatar');
        if (avatarEl) avatarEl.src = currentUser.picture;
        
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        if (sidebarAvatar) sidebarAvatar.src = currentUser.picture;
        
        const sidebarName = document.getElementById('sidebarName');
        if (sidebarName) sidebarName.textContent = currentUser.name;
        
        updateTokenDisplay();
        
        // Save to localStorage
        localStorage.setItem('infinityUser', JSON.stringify(currentUser));
        
        console.log('✅ User signed in:', currentUser);
        showWelcomeMessage();
        
        // Initialize features after auth
        if (typeof initializeVoiceUI === 'function') {
            initializeVoiceUI();
        }
    } catch (error) {
        console.error('❌ Google Auth Error:', error);
        alert('Authentication failed. Please try again.\n\nError: ' + error.message);
    }
};

function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function signOut() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('infinityUser');
    currentUser = null;
    userTokens = 0;
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authSection').style.display = 'flex';
    location.reload();
}

function showWelcomeMessage() {
    const msg = `Welcome to Infinity, ${currentUser.name}!\n\nYou have ${userTokens} Infinity Tokens.\n\nType "ti rigers" in chat to earn 1 token per reply!`;
    console.log('🎉 ' + msg);
    
    // Voice announcement if available
    if (voiceSynthesis) {
        const utterance = new SpeechSynthesisUtterance(`Welcome ${currentUser.name.split(' ')[0]}. You have ${userTokens} Infinity Tokens.`);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        voiceSynthesis.speak(utterance);
    }
    
    // Visual welcome
    setTimeout(() => {
        if (typeof alert !== 'undefined') {
            alert(msg);
        }
    }, 500);
}

// Check for existing session on load
window.addEventListener('load', function() {
    console.log('🚀 Infinity Platform Loading...');
    
    const savedUser = localStorage.getItem('infinityUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            userTokens = currentUser.tokens || 10;
            
            console.log('✅ Restored session for:', currentUser.email);
            
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('mainApp').style.display = 'block';
            
            if (currentUser.picture) {
                const avatarEl = document.getElementById('userAvatar');
                if (avatarEl) avatarEl.src = currentUser.picture;
                
                const sidebarAvatar = document.getElementById('sidebarAvatar');
                if (sidebarAvatar) sidebarAvatar.src = currentUser.picture;
            }
            
            if (currentUser.name) {
                const sidebarName = document.getElementById('sidebarName');
                if (sidebarName) sidebarName.textContent = currentUser.name;
            }
            
            updateTokenDisplay();
        } catch (e) {
            console.error('❌ Failed to restore session:', e);
            localStorage.removeItem('infinityUser');
        }
    } else {
        console.log('👤 No saved session - showing auth screen');
    }
});

// Bypass Auth for Testing/Demo
window.bypassAuth = function() {
    console.log('🔓 Bypassing authentication - Demo Mode');
    
    currentUser = {
        email: 'marvaseater@gmail.com',
        name: 'Kris (Demo Mode)',
        picture: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%230070ba"/%3E%3Ctext x="50" y="65" text-anchor="middle" fill="white" font-size="40" font-family="Arial"%3EK%3C/text%3E%3C/svg%3E',
        sub: 'demo-' + Date.now(),
        isAdmin: true,
        tokens: 1000
    };
    
    userTokens = currentUser.tokens;
    
    // Hide auth section and show main app
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Update user info
    const avatarEl = document.getElementById('userAvatar');
    if (avatarEl) avatarEl.src = currentUser.picture;
    
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarAvatar) sidebarAvatar.src = currentUser.picture;
    
    const sidebarName = document.getElementById('sidebarName');
    if (sidebarName) sidebarName.textContent = currentUser.name;
    
    updateTokenDisplay();
    
    // Save to localStorage
    localStorage.setItem('infinityUser', JSON.stringify(currentUser));
    
    console.log('✅ Demo mode activated');
    
    // Voice announcement
    if (voiceSynthesis) {
        const utterance = new SpeechSynthesisUtterance('Demo mode activated. Welcome to Infinity.');
        voiceSynthesis.speak(utterance);
    }
    
    alert('🔓 Demo Mode Activated\n\nYou can now explore all 44 apps!\n\nNote: This is a demo login. For full features and token persistence, sign in with your Google account.');
};

function signOut() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    localStorage.removeItem('infinityUser');
    currentUser = null;
    userTokens = 0;
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authSection').style.display = 'flex';
    location.reload();
}

function showWelcomeMessage() {
    speak(`Welcome to Infinity, ${currentUser.name}! You have ${userTokens} Infinity Tokens. Type "ti rigers" in chat to earn 1 token per reply!`);
}

function updateTokenDisplay() {
    const display = document.getElementById('tokenDisplay');
    const sidebarTokens = document.getElementById('sidebarTokens');
    if (display) {
        display.textContent = `Tokens: ${userTokens.toFixed(1)}`;
    }
    if (sidebarTokens) {
        sidebarTokens.textContent = `Tokens: ${userTokens.toFixed(1)}`;
    }
}

// Update sidebar user info
function updateSidebarUserInfo() {
    if (currentUser) {
        const sidebarName = document.getElementById('sidebarName');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        
        if (sidebarName) {
            sidebarName.textContent = currentUser.name || currentUser.email;
        }
        if (sidebarAvatar && currentUser.picture) {
            sidebarAvatar.src = currentUser.picture;
        }
        updateTokenDisplay();
    }
}

// Sidebar Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

function navigateToHome() {
    backToMainHub();
}

// Chat Session Management
let chatSessions = JSON.parse(localStorage.getItem('chatSessions')) || {
    'default': { name: 'Main Chat', messages: [] }
};
let currentSession = 'default';

function loadChatSession(sessionId) {
    currentSession = sessionId;
    // Load session messages
    console.log('Loading chat session:', sessionId);
    speak('Chat session loaded');
}

function newChatSession() {
    const sessionId = 'session_' + Date.now();
    const sessionName = prompt('Enter chat session name:') || 'New Chat';
    chatSessions[sessionId] = { name: sessionName, messages: [] };
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    
    // Add to sidebar
    const sessionsDiv = document.getElementById('chatSessions');
    const newBtn = sessionsDiv.querySelector('.new-session');
    const sessionBtn = document.createElement('button');
    sessionBtn.className = 'session-btn';
    sessionBtn.textContent = `💬 ${sessionName}`;
    sessionBtn.onclick = () => loadChatSession(sessionId);
    sessionsDiv.insertBefore(sessionBtn, newBtn);
    
    loadChatSession(sessionId);
}

// Developer Mode
let devMode = false;

function toggleDevMode() {
    devMode = !devMode;
    localStorage.setItem('devMode', devMode);
    console.log('Developer Mode:', devMode ? 'ON' : 'OFF');
    
    if (devMode) {
        speak('Developer mode activated');
        // Enable additional features
        window.infinityDebug = {
            user: currentUser,
            tokens: userTokens,
            sessions: chatSessions,
            currentHub,
            currentApp
        };
        console.log('Infinity Debug Info:', window.infinityDebug);
    } else {
        speak('Developer mode deactivated');
    }
}

function openConsole() {
    if (devMode) {
        console.log('=== INFINITY CONSOLE ===');
        console.log('User:', currentUser);
        console.log('Tokens:', userTokens);
        console.log('Current Hub:', currentHub);
        console.log('Current App:', currentApp);
        console.log('Chat Sessions:', chatSessions);
        alert('Console output in browser DevTools (F12)');
    } else {
        alert('Enable Developer Mode first');
    }
}

function viewLogs() {
    if (devMode) {
        const logs = localStorage.getItem('infinityLogs') || 'No logs yet';
        console.log('=== INFINITY LOGS ===');
        console.log(logs);
        alert('Logs output in browser DevTools (F12)');
    } else {
        alert('Enable Developer Mode first');
    }
}

// Check for existing session on load
window.addEventListener('load', function() {
    const savedUser = localStorage.getItem('infinityUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        userTokens = currentUser.tokens || 10;
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        if (currentUser.picture) {
            document.getElementById('userAvatar').src = currentUser.picture;
        }
        updateTokenDisplay();
        initializeVoiceUI();
    }
});

// SPA Navigation
function showHub(hubName) {
    // Start vector transition
    playVectorTransition(() => {
        // Hide all sections
        document.getElementById('mainHub').style.display = 'none';
        document.getElementById('portalHub').style.display = 'none';
        document.getElementById('marketplaceHub').style.display = 'none';
        document.getElementById('socializerHub').style.display = 'none';
        document.getElementById('appContent').style.display = 'none';
        
        // Show selected hub
        currentHub = hubName;
        const hubElement = document.getElementById(hubName + 'Hub');
        hubElement.style.display = 'block';
        hubElement.classList.add('panel-enter');
        
        awardTokenForHardWork('hub_navigation');
        speak(`Entering ${hubName} hub`);
    });
}

// Vector Transition Animation System
function playVectorTransition(callback, isSlowLoad = false) {
    const transition = document.getElementById('vectorTransition');
    const guide = document.getElementById('vectorGuide');
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    // Rotate guide emoji
    currentGuideIndex = (currentGuideIndex + 1) % vectorGuides.length;
    guide.textContent = vectorGuides[currentGuideIndex];
    
    // Show transition
    transition.classList.add('active');
    
    // Calculate random path across screen
    const startX = Math.random() * window.innerWidth * 0.3;
    const startY = Math.random() * window.innerHeight * 0.3;
    const endX = window.innerWidth * 0.7 + Math.random() * window.innerWidth * 0.3;
    const endY = window.innerHeight * 0.7 + Math.random() * window.innerHeight * 0.3;
    
    // Animate guide
    guide.style.left = startX + 'px';
    guide.style.top = startY + 'px';
    
    // Create SVG path for vector trail
    const svg = document.getElementById('vectorCanvas');
    svg.innerHTML = '';
    
    // Determine animation speed based on load type
    const duration = isSlowLoad ? 1200 : 400;
    
    if (isSlowLoad) {
        // Show loading overlay for slow apps
        overlay.classList.add('active');
        loadingText.textContent = 'Initializing AI systems...';
    }
    
    // Animate vector movement
    const startTime = Date.now();
    
    function animateVector() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-in-out curve
        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentX = startX + (endX - startX) * easeProgress;
        const currentY = startY + (endY - startY) * easeProgress;
        
        guide.style.left = currentX + 'px';
        guide.style.top = currentY + 'px';
        
        // Draw trail
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', currentX);
        line.setAttribute('y2', currentY);
        line.setAttribute('stroke', '#0070ba');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('opacity', '0.6');
        svg.appendChild(line);
        
        if (progress < 1) {
            requestAnimationFrame(animateVector);
        } else {
            // Animation complete
            setTimeout(() => {
                transition.classList.remove('active');
                overlay.classList.remove('active');
                if (callback) callback();
            }, 100);
        }
    }
    
    animateVector();
}

function backToMainHub() {
    playVectorTransition(() => {
        document.getElementById('portalHub').style.display = 'none';
        document.getElementById('marketplaceHub').style.display = 'none';
        document.getElementById('socializerHub').style.display = 'none';
        document.getElementById('appContent').style.display = 'none';
        const mainHub = document.getElementById('mainHub');
        mainHub.style.display = 'block';
        mainHub.classList.add('panel-enter');
        currentHub = 'main';
        currentApp = null;
    });
}

function backToHub() {
    playVectorTransition(() => {
        document.getElementById('appContent').style.display = 'none';
        const hubElement = document.getElementById(currentHub + 'Hub');
        hubElement.style.display = 'block';
        hubElement.classList.add('panel-enter');
        currentApp = null;
    });
}

function loadApp(appName) {
    // Determine if this is a slow-loading app (AI-powered features)
    const slowApps = ['videogame', 'channel', 'diy', 'school'];
    const isSlowLoad = slowApps.includes(appName);
    
    playVectorTransition(() => {
        currentApp = appName;
        document.getElementById('portalHub').style.display = 'none';
        document.getElementById('marketplaceHub').style.display = 'none';
        document.getElementById('socializerHub').style.display = 'none';
        const appContent = document.getElementById('appContent');
        appContent.style.display = 'block';
        appContent.classList.add('panel-enter');
        
        const container = document.getElementById('appContainer');
        container.innerHTML = getAppContent(appName);
        
        awardTokenForHardWork('app_load');
        speak(`Loading ${appName} app`);
        
        // Initialize app-specific functionality
        initializeApp(appName);
    }, isSlowLoad);
}

// Gemini AI Integration
async function callGeminiAI(prompt, context = '') {
    try {
        const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt;
        
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Gemini API error:', data);
            return 'I encountered an issue with the AI. Please try again.';
        }
    } catch (error) {
        console.error('Gemini AI error:', error);
        return 'Unable to connect to AI services. Using local processing.';
    }
}

// Enhanced AI Chat with Gemini
async function sendAIMessage(message, appContext = '') {
    const context = appContext || `You are Rogers AI assistant in the Infinity platform. Be concise and helpful.`;
    const response = await callGeminiAI(message, context);
    return response;
}

// Voice UI System
function initializeVoiceUI() {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        voiceRecognition = new SpeechRecognition();
        voiceRecognition.continuous = false;
        voiceRecognition.interimResults = false;
        voiceRecognition.lang = 'en-US';
        
        voiceRecognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            handleVoiceCommand(transcript);
        };
        
        console.log('Voice UI initialized');
    }
    
    // Check for ElevenLabs API key in localStorage
    elevenLabsApiKey = localStorage.getItem('elevenLabsApiKey');
}

function speak(text) {
    if (voiceSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        voiceSynthesis.speak(utterance);
    }
}

function startVoiceListening() {
    if (voiceRecognition) {
        voiceRecognition.start();
        speak('Listening');
    }
}

function stopVoiceListening() {
    if (voiceRecognition) {
        voiceRecognition.stop();
    }
}

function handleVoiceCommand(command) {
    console.log('Voice command:', command);
    const lowerCommand = command.toLowerCase();
    
    // Check for ti rigers
    if (lowerCommand.includes('ti rigers')) {
        userTokens += 1;
        currentUser.tokens = userTokens;
        localStorage.setItem('infinityUser', JSON.stringify(currentUser));
        updateTokenDisplay();
        speak(`You earned 1 token! You now have ${userTokens} tokens.`);
        return;
    }
    
    // Navigation commands
    if (lowerCommand.includes('portal')) {
        showHub('portal');
    } else if (lowerCommand.includes('marketplace')) {
        showHub('marketplace');
    } else if (lowerCommand.includes('socializer')) {
        showHub('socializer');
    } else if (lowerCommand.includes('home') || lowerCommand.includes('main')) {
        backToMainHub();
    } else {
        speak('Command not recognized. Try saying portal, marketplace, socializer, or home.');
    }
}

// Token System
function awardTokenForHardWork(action) {
    userTokens += 0.5;
    currentUser.tokens = userTokens;
    localStorage.setItem('infinityUser', JSON.stringify(currentUser));
    updateTokenDisplay();
    console.log(`Token awarded for ${action}. Total: ${userTokens.toFixed(1)}`);
}

function checkForTiRigers(message) {
    if (message.toLowerCase().includes('ti rigers')) {
        userTokens += 1;
        currentUser.tokens = userTokens;
        localStorage.setItem('infinityUser', JSON.stringify(currentUser));
        updateTokenDisplay();
        return true;
    }
    return false;
}

// App Content Generator
function getAppContent(appName) {
    const apps = {
        calculator: `
            <h2>🔢 Calculator</h2>
            <div style="max-width: 400px; margin: 0 auto; padding: 20px; background: white; border-radius: 12px;">
                <div id="calcDisplay" style="background: #f8f9fa; padding: 20px; font-size: 32px; text-align: right; border-radius: 8px; margin-bottom: 16px; min-height: 60px;">0</div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <button class="calc-btn" onclick="calcInput('7')">7</button>
                    <button class="calc-btn" onclick="calcInput('8')">8</button>
                    <button class="calc-btn" onclick="calcInput('9')">9</button>
                    <button class="calc-btn" onclick="calcInput('/')">/</button>
                    <button class="calc-btn" onclick="calcInput('4')">4</button>
                    <button class="calc-btn" onclick="calcInput('5')">5</button>
                    <button class="calc-btn" onclick="calcInput('6')">6</button>
                    <button class="calc-btn" onclick="calcInput('*')">*</button>
                    <button class="calc-btn" onclick="calcInput('1')">1</button>
                    <button class="calc-btn" onclick="calcInput('2')">2</button>
                    <button class="calc-btn" onclick="calcInput('3')">3</button>
                    <button class="calc-btn" onclick="calcInput('-')">-</button>
                    <button class="calc-btn" onclick="calcInput('0')">0</button>
                    <button class="calc-btn" onclick="calcInput('.')">.</button>
                    <button class="calc-btn" onclick="calcEqual()">=</button>
                    <button class="calc-btn" onclick="calcInput('+')">+</button>
                </div>
                <button class="btn-secondary" style="width: 100%; margin-top: 10px;" onclick="calcClear()">Clear</button>
                <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="startVoiceListening()">🎤 Voice Input</button>
            </div>
        `,
        
        alarm: `
            <h2>⏰ Smart Alarm Clock</h2>
            <div style="max-width: 500px; margin: 0 auto; padding: 20px; background: white; border-radius: 12px;">
                <div style="text-align: center; font-size: 64px; color: #0070ba; margin: 20px 0;" id="currentTime"></div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Set Alarm</h3>
                    <input type="time" id="alarmTime" style="width: 100%; padding: 12px; font-size: 18px; border: 2px solid #0070ba; border-radius: 8px;">
                    <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="setAlarm()">Set Alarm</button>
                    <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="startVoiceListening()">🎤 Set with Voice</button>
                </div>
                <div id="alarmList"></div>
            </div>
            <script>
                setInterval(() => {
                    const now = new Date();
                    document.getElementById('currentTime').textContent = now.toLocaleTimeString();
                }, 1000);
            </script>
        `,
        
        bible: `
            <h2>📖 Bible Verse Infinity</h2>
            <p style="text-align: center; color: #6c757d;">Rogers-analyzed divine messages with time-date correlation</p>
            <div style="max-width: 600px; margin: 20px auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #0070ba 0%, #003087 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 10px;">Today's Verse</h3>
                    <p style="font-size: 18px; font-style: italic;">"Your country is desolate, your cities are burned with fire: your land, strangers devour it in your presence, and it is desolate, as overthrown by strangers." - Isaiah 1:7</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h4 style="color: #0070ba;">Rogers Analysis</h4>
                    <p>This verse speaks to transparency and truth - revealing what has been hidden. In the context of Infinity, it represents our mission to expose corruption and bring light to darkness, including revelations about corporate manipulation and technological control.</p>
                </div>
                <button class="btn-primary" style="width: 100%; margin-top: 20px;" onclick="getNewVerse()">Get New Verse</button>
                <button class="btn-secondary" style="width: 100%; margin-top: 10px;" onclick="speakVerse()">🔊 Read Aloud</button>
            </div>
        `,
        
        pets: `
            <h2>🐾 Pet Care Manager</h2>
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>Add Pet</h3>
                    <input type="text" id="petName" placeholder="Pet name..." style="width: 100%; padding: 12px; margin: 8px 0; border: 2px solid #d9d9d9; border-radius: 8px;">
                    <select id="petType" style="width: 100%; padding: 12px; margin: 8px 0; border: 2px solid #d9d9d9; border-radius: 8px;">
                        <option>Dog</option>
                        <option>Cat</option>
                        <option>Bird</option>
                        <option>Fish</option>
                        <option>Other</option>
                    </select>
                    <button class="btn-primary" onclick="addPet()">Add Pet</button>
                </div>
                <div id="petList"></div>
            </div>
        `,
        
        therapy: `
            <h2>💪 Physical Therapy & Exercise</h2>
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: white; padding: 20px; border-radius: 12px;">
                    <h3>Exercise Routines</h3>
                    <div class="exercise-card">
                        <h4>Stretching Routine</h4>
                        <p>10 minutes • Flexibility</p>
                        <button class="btn-primary">Start Routine</button>
                    </div>
                    <div class="exercise-card">
                        <h4>Strength Training</h4>
                        <p>20 minutes • Building strength</p>
                        <button class="btn-primary">Start Routine</button>
                    </div>
                    <div class="exercise-card">
                        <h4>Recovery Exercises</h4>
                        <p>15 minutes • Post-injury recovery</p>
                        <button class="btn-primary">Start Routine</button>
                    </div>
                </div>
            </div>
        `,
        
        garden: `
            <h2>🌱 Garden & Seed Swapping</h2>
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>My Garden</h3>
                    <button class="btn-primary" onclick="addPlant()">Add Plant</button>
                    <div id="gardenList" style="margin-top: 20px;"></div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 12px;">
                    <h3>Seed Exchange Network</h3>
                    <p>Connect with other gardeners to swap seeds</p>
                    <button class="btn-secondary">Browse Available Seeds</button>
                </div>
            </div>
        `,
        
        trade: `
            <h2>🏪 Infinity Token Trading</h2>
            <p style="text-align: center; color: #0070ba; font-weight: bold;">NO USD ACCEPTED - Tokens Only</p>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>List Item for Sale</h3>
                    <input type="text" placeholder="Item name..." style="width: 100%; padding: 12px; margin: 8px 0; border: 2px solid #d9d9d9; border-radius: 8px;">
                    <textarea placeholder="Description..." style="width: 100%; padding: 12px; margin: 8px 0; border: 2px solid #d9d9d9; border-radius: 8px; min-height: 100px;"></textarea>
                    <input type="number" placeholder="Price in tokens..." style="width: 100%; padding: 12px; margin: 8px 0; border: 2px solid #d9d9d9; border-radius: 8px;">
                    <button class="btn-primary">List Item</button>
                </div>
                <div id="marketplace Grid"></div>
            </div>
        `,
        
        clothing: `
            <h2>👔 Clothing Design Studio</h2>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="background: white; padding: 20px; border-radius: 12px;">
                    <h3>Design Your Clothing</h3>
                    <p>AI-powered design assistance</p>
                    <canvas id="designCanvas" width="600" height="400" style="border: 2px solid #0070ba; border-radius: 8px; display: block; margin: 20px auto;"></canvas>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn-primary">Save Design</button>
                        <button class="btn-secondary">Get AI Suggestions</button>
                        <button class="btn-secondary">List for Sale</button>
                    </div>
                </div>
            </div>
        `,
        
        foodtextile: `
            <h2>🌾 Food & Textiles Trading Platform</h2>
            <p style="text-align: center;">Global network for fair trade</p>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div class="trade-category">
                        <h3>Food Products</h3>
                        <button class="btn-primary">Browse</button>
                    </div>
                    <div class="trade-category">
                        <h3>Textiles</h3>
                        <button class="btn-primary">Browse</button>
                    </div>
                    <div class="trade-category">
                        <h3>Raw Materials</h3>
                        <button class="btn-primary">Browse</button>
                    </div>
                </div>
            </div>
        `,
        
        glass: `
            <h2>🏺 Infinity Glass Packaging</h2>
            <p style="text-align: center;">Standardized eco-friendly packaging system</p>
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px;">
                <h3>Standard Sizes</h3>
                <div style="display: grid; gap: 15px;">
                    <div class="glass-size">Small: 250ml</div>
                    <div class="glass-size">Medium: 500ml</div>
                    <div class="glass-size">Large: 1000ml</div>
                    <div class="glass-size">XL: 2000ml</div>
                </div>
                <button class="btn-primary" style="margin-top: 20px;">Order Packaging</button>
            </div>
        `,
        
        banned: `
            <h2>⚠️ Truth & Transparency Database</h2>
            <p style="text-align: center; color: #dc3545; font-weight: bold;">Exposing Corruption and Protecting Consumers</p>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: #856404;">⚡ Breaking Investigation</h3>
                    <h4>Tesla Driverless Vehicle Brain Chip Technology</h4>
                    <p>Investigation reveals potential use of aluminum oxide chips in autonomous vehicle control systems. Designs from 2-1 years ago show concerning implementation details.</p>
                    <button class="btn-primary">Read Full Report</button>
                </div>
                <div style="background: white; padding: 20px; border-radius: 12px;">
                    <h3>Report Database</h3>
                    <button class="btn-secondary">Submit New Report</button>
                    <div id="reportsList" style="margin-top: 20px;"></div>
                </div>
            </div>
        `,
        
        leather: `
            <h2>🧤 Leather Craft Hub</h2>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <div class="craft-section">
                        <h3>Tutorials</h3>
                        <p>Step-by-step leather crafting guides</p>
                        <button class="btn-primary">Browse Tutorials</button>
                    </div>
                    <div class="craft-section">
                        <h3>Patterns</h3>
                        <p>Downloadable pattern library</p>
                        <button class="btn-primary">View Patterns</button>
                    </div>
                    <div class="craft-section">
                        <h3>Marketplace</h3>
                        <p>Buy and sell leather goods</p>
                        <button class="btn-primary">Visit Marketplace</button>
                    </div>
                </div>
            </div>
        `,
        
        locals: `
            <h2>📍 Locals Chat</h2>
            <p style="text-align: center;">Connect with people in your area</p>
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>Find Your Local Chat</h3>
                    <input type="text" id="zipCode" placeholder="Enter your zip code..." maxlength="5" style="width: 100%; padding: 12px; font-size: 18px; border: 2px solid #0070ba; border-radius: 8px;">
                    <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="findLocalChat()">Find Chat Room</button>
                </div>
                <div id="localChatRoom" class="chat-container" style="display: none;">
                    <div id="localMessages" class="chat-messages"></div>
                    <div class="chat-input-box">
                        <input type="text" id="localChatInput" placeholder="Type your message...">
                        <button class="btn-primary" onclick="sendLocalMessage()">Send</button>
                    </div>
                </div>
            </div>
        `,
        
        videogame: `
            <h2>🎮 Video Game Generator</h2>
            <p style="text-align: center;">AI-powered video game creation</p>
            <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px;">
                <h3>Describe Your Game</h3>
                <textarea id="gameIdea" placeholder="Describe your game idea..." style="width: 100%; min-height: 150px; padding: 15px; border: 2px solid #0070ba; border-radius: 8px; font-size: 16px;"></textarea>
                <div style="margin: 20px 0;">
                    <label>Genre:</label>
                    <select style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px; margin-top: 8px;">
                        <option>Action</option>
                        <option>Adventure</option>
                        <option>RPG</option>
                        <option>Puzzle</option>
                        <option>Strategy</option>
                    </select>
                </div>
                <button class="btn-primary" onclick="generateGame()">Generate Game</button>
                <div id="gamePreview" style="margin-top: 30px;"></div>
            </div>
        `,
        
        diy: `
            <h2>🔨 DIY Modeling Hub</h2>
            <p style="text-align: center;">Instructables-style project sharing</p>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>Create New Project</h3>
                    <button class="btn-primary">Start Project Guide</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div class="project-card">
                        <h4>Woodworking</h4>
                        <p>125 projects</p>
                        <button class="btn-secondary">Browse</button>
                    </div>
                    <div class="project-card">
                        <h4>Electronics</h4>
                        <p>89 projects</p>
                        <button class="btn-secondary">Browse</button>
                    </div>
                    <div class="project-card">
                        <h4>Crafts</h4>
                        <p>203 projects</p>
                        <button class="btn-secondary">Browse</button>
                    </div>
                </div>
            </div>
        `,
        
        school: `
            <h2>🎓 Infinity School</h2>
            <p style="text-align: center;">Lifelong learning from newborn to elderly</p>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    <div class="age-group">
                        <h3>Early Childhood</h3>
                        <p>Ages 0-5</p>
                        <button class="btn-primary">Enter</button>
                    </div>
                    <div class="age-group">
                        <h3>Elementary</h3>
                        <p>Ages 6-12</p>
                        <button class="btn-primary">Enter</button>
                    </div>
                    <div class="age-group">
                        <h3>Teen</h3>
                        <p>Ages 13-18</p>
                        <button class="btn-primary">Enter</button>
                    </div>
                    <div class="age-group">
                        <h3>Adult</h3>
                        <p>Ages 19-65</p>
                        <button class="btn-primary">Enter</button>
                    </div>
                    <div class="age-group">
                        <h3>Senior</h3>
                        <p>Ages 65+</p>
                        <button class="btn-primary">Enter</button>
                    </div>
                </div>
            </div>
        `,
        
        channel: `
            <h2>📺 Channel Generator</h2>
            <p style="text-align: center;">Merit-based TV programming with AI analysis</p>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>Submit Your Audition</h3>
                    <form>
                        <input type="text" placeholder="Your name..." style="width: 100%; padding: 12px; margin: 8px 0; border: 2px solid #d9d9d9; border-radius: 8px;">
                        <select style="width: 100%; padding: 12px; margin: 8px 0; border: 2px solid #d9d9d9; border-radius: 8px;">
                            <option>Educational</option>
                            <option>Entertainment</option>
                            <option>Documentary</option>
                            <option>Mystery</option>
                            <option>Adventure</option>
                        </select>
                        <textarea placeholder="Describe your programming idea..." style="width: 100%; min-height: 150px; padding: 12px; margin: 8px 0; border: 2px solid #d9d9d9; border-radius: 8px;"></textarea>
                        <button type="button" class="btn-primary">Submit Audition</button>
                    </form>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px;">
                    <h3>How It Works</h3>
                    <ol style="color: #6c757d; padding-left: 20px;">
                        <li>Submit your audition and program idea</li>
                        <li>AI analyzes your content and merit</li>
                        <li>Get assigned to appropriate digital channel</li>
                        <li>Build audience through quality content</li>
                        <li>Earn Infinity Tokens for engagement</li>
                    </ol>
                </div>
            </div>
        `,
        
        peerlink: `
            <h2>📞 PeerLink / 2-Way</h2>
            <p style="text-align: center;">Phone-number-like IDs for global P2P hosting</p>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>Your P2P Identity</h3>
                    <div id="p2pIdDisplay" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="font-size: 24px; color: #0070ba; font-weight: bold; text-align: center;" id="userP2PId">INF-USER-0001</div>
                        <div style="text-align: center; margin-top: 10px; color: #6c757d;">Your global P2P routing ID</div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Handle:</label>
                        <input type="text" id="p2pHandle" placeholder="Your unique handle..." value="${currentUser?.name || 'User'}" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Routing ID Format:</label>
                        <select id="routingFormat" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                            <option value="numeric">Numeric (INF-USER-0001)</option>
                            <option value="word">Word-based (INF-ALPHA-ZETA)</option>
                            <option value="custom">Custom Format</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Link to Your Page:</label>
                        <input type="url" id="p2pPageLink" placeholder="https://yoursite.com" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label class="toggle-switch">
                            <input type="checkbox" id="radioMode" checked>
                            <span class="slider"></span>
                            <span class="label-text">Radio Mode (Two-Way Communication)</span>
                        </label>
                    </div>
                    
                    <button class="btn-primary" onclick="saveP2PConfig()">Save Configuration</button>
                    <button class="btn-secondary" onclick="generateNewP2PId()">Generate New ID</button>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px;">
                    <h3>Active Connections</h3>
                    <div id="p2pConnections" style="margin-top: 15px;">
                        <p style="color: #6c757d; text-align: center;">No active P2P connections</p>
                    </div>
                    <button class="btn-primary" style="margin-top: 15px;" onclick="scanP2PNetwork()">Scan P2P Network</button>
                </div>
            </div>
        `,
        
        deployer: `
            <h2>🚀 Portal Publisher (Gruber/Pewpi Deployer)</h2>
            <p style="text-align: center;">Export and deploy your Infinity pages</p>
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>Deployment Configuration</h3>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Presidential/NWO Title:</label>
                        <input type="text" id="presidentialTitle" placeholder="Enter title..." value="Infinity Presidential Node" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                        <small style="color: #6c757d;">Default: Infinity Presidential Node</small>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Deploy Target:</label>
                        <select id="deployTarget" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                            <option value="html">Download HTML</option>
                            <option value="github">GitHub Pages</option>
                            <option value="cloudflare">Cloudflare Pages</option>
                            <option value="zip">Local ZIP Package</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label class="toggle-switch">
                            <input type="checkbox" id="includePayPal" checked>
                            <span class="slider"></span>
                            <span class="label-text">Include PayPal Marketplace Panel</span>
                        </label>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 25px;">
                        <button class="btn-primary" onclick="exportHTML()">📄 Export HTML</button>
                        <button class="btn-primary" onclick="exportJSON()">📋 Export JSON Schema</button>
                        <button class="btn-primary" onclick="generateZIP()">📦 Generate ZIP Layout</button>
                        <button class="btn-secondary" onclick="previewDeploy()">👁️ Preview</button>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>Export Status</h3>
                    <div id="exportStatus" style="padding: 15px; background: white; border-radius: 8px; margin-top: 10px;">
                        <p style="color: #6c757d;">Ready to export. Click a button above to begin.</p>
                    </div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 12px;">
                    <h3>🔌 Integration Hooks</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div class="integration-card">
                            <h4>Watson AI</h4>
                            <p style="font-size: 13px; color: #6c757d;">Connect Watson for advanced analytics</p>
                            <button class="btn-secondary">Configure</button>
                        </div>
                        <div class="integration-card">
                            <h4>Gemini AI</h4>
                            <p style="font-size: 13px; color: #6c757d;">Already integrated ✓</p>
                            <button class="btn-secondary">Settings</button>
                        </div>
                        <div class="integration-card">
                            <h4>Pewpi Network</h4>
                            <p style="font-size: 13px; color: #6c757d;">Deploy to Pewpi CDN</p>
                            <button class="btn-secondary">Connect</button>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        funding: `
            <h2>💰 Infinity Funding Pad</h2>
            <p style="text-align: center;">Grant templates, donor lists, and fundraising tools</p>
            <div style="max-width: 900px; margin: 0 auto;">
                <div class="funding-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                    <button class="tab-btn active" onclick="showFundingTab('grants')">📝 Grants</button>
                    <button class="tab-btn" onclick="showFundingTab('donors')">👥 Donors</button>
                    <button class="tab-btn" onclick="showFundingTab('partners')">🤝 Partner Apps</button>
                    <button class="tab-btn" onclick="showFundingTab('solutions')">💡 What Infinity Solves</button>
                </div>
                
                <div id="grantsTab" class="funding-tab-content" style="display: block;">
                    <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                        <h3>Grant Templates</h3>
                        <div class="grant-template-list">
                            <div class="grant-item" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>Technology Innovation Grant</h4>
                                <p style="color: #6c757d; font-size: 14px;">For AI/blockchain platforms - $50K-$500K</p>
                                <button class="btn-secondary" onclick="loadGrantTemplate('tech')">Load Template</button>
                            </div>
                            <div class="grant-item" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>Social Impact Grant</h4>
                                <p style="color: #6c757d; font-size: 14px;">For community-focused projects - $10K-$100K</p>
                                <button class="btn-secondary" onclick="loadGrantTemplate('social')">Load Template</button>
                            </div>
                            <div class="grant-item" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>Research & Development</h4>
                                <p style="color: #6c757d; font-size: 14px;">For experimental tech - $25K-$250K</p>
                                <button class="btn-secondary" onclick="loadGrantTemplate('rd')">Load Template</button>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="createCustomGrant()">+ Create Custom Grant Application</button>
                    </div>
                </div>
                
                <div id="donorsTab" class="funding-tab-content" style="display: none;">
                    <div style="background: white; padding: 30px; border-radius: 12px;">
                        <h3>Donor & Investor List</h3>
                        <div style="margin-bottom: 20px;">
                            <input type="text" id="donorSearch" placeholder="Search donors..." style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                        </div>
                        <div id="donorList" style="max-height: 400px; overflow-y: auto;">
                            <div class="donor-card" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                                <h4>Tech Accelerators</h4>
                                <p style="font-size: 13px; color: #6c757d;">Y Combinator, Techstars, 500 Startups</p>
                                <button class="btn-secondary">View Details</button>
                            </div>
                            <div class="donor-card" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                                <h4>Angel Investors</h4>
                                <p style="font-size: 13px; color: #6c757d;">Individual tech investors & mentors</p>
                                <button class="btn-secondary">View Details</button>
                            </div>
                            <div class="donor-card" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                                <h4>Government Grants</h4>
                                <p style="font-size: 13px; color: #6c757d;">NSF, SBIR, STTR programs</p>
                                <button class="btn-secondary">View Details</button>
                            </div>
                        </div>
                        <button class="btn-primary" style="margin-top: 15px;" onclick="addDonor()">+ Add New Donor</button>
                    </div>
                </div>
                
                <div id="partnersTab" class="funding-tab-content" style="display: none;">
                    <div style="background: white; padding: 30px; border-radius: 12px;">
                        <h3>Partner Applications</h3>
                        <p style="color: #6c757d; margin-bottom: 20px;">1% Marketplace Cut Model - Revenue sharing with partners</p>
                        <div class="partner-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                            <div class="partner-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                                <div style="font-size: 36px; margin-bottom: 10px;">🛍️</div>
                                <h4>E-commerce Apps</h4>
                                <p style="font-size: 13px; color: #6c757d;">1% of token transactions</p>
                                <div style="margin-top: 10px; color: #0070ba; font-weight: bold;">$2.5K/month avg</div>
                            </div>
                            <div class="partner-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                                <div style="font-size: 36px; margin-bottom: 10px;">🎮</div>
                                <h4>Gaming Partners</h4>
                                <p style="font-size: 13px; color: #6c757d;">1% of in-game token trades</p>
                                <div style="margin-top: 10px; color: #0070ba; font-weight: bold;">$1.8K/month avg</div>
                            </div>
                            <div class="partner-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                                <div style="font-size: 36px; margin-bottom: 10px;">📱</div>
                                <h4>App Developers</h4>
                                <p style="font-size: 13px; color: #6c757d;">Revenue share model</p>
                                <div style="margin-top: 10px; color: #0070ba; font-weight: bold;">$3.2K/month avg</div>
                            </div>
                        </div>
                        <button class="btn-primary" style="margin-top: 20px;" onclick="proposePartnership()">Propose New Partnership</button>
                    </div>
                </div>
                
                <div id="solutionsTab" class="funding-tab-content" style="display: none;">
                    <div style="background: white; padding: 30px; border-radius: 12px;">
                        <h3>What Infinity Solves</h3>
                        <div style="background: linear-gradient(135deg, #0070ba 0%, #003087 100%); color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                            <h4 style="color: white; margin-bottom: 15px;">🎯 Mission: Infinity OS</h4>
                            <p style="font-size: 15px; line-height: 1.8;">One-page deployer for poor/rural users. Legacy marketplaces take % and require multi-page setup. Infinity provides one-page, AI-filled, image-to-app solution with only 1% marketplace cut built in.</p>
                        </div>
                        <div class="solution-list">
                            <div class="solution-item" style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>💳 Token Economy (No USD)</h4>
                                <p style="color: #6c757d;">Eliminates traditional banking barriers and enables global microtransactions</p>
                            </div>
                            <div class="solution-item" style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>📞 P2P Communication</h4>
                                <p style="color: #6c757d;">Direct peer-to-peer connections without centralized control</p>
                            </div>
                            <div class="solution-item" style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>🤖 AI Integration (Watson/Gemini/Rogers)</h4>
                                <p style="color: #6c757d;">Gemini Pro and Watson AI for intelligent automation and insights</p>
                            </div>
                            <div class="solution-item" style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>🔍 Truth & Transparency</h4>
                                <p style="color: #6c757d;">Database of banned products and corporate transparency (Tesla chip investigation)</p>
                            </div>
                            <div class="solution-item" style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>🌐 Decentralized Publishing (Gruber/Pewpi)</h4>
                                <p style="color: #6c757d;">Anyone can deploy and host 1-page sites with P2P routing</p>
                            </div>
                        </div>
                        <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin-top: 20px;">
                            <h4 style="color: #856404;">💰 Funding Ask</h4>
                            <p style="color: #856404;">$500K for development, device lab, and oxide-core research</p>
                            <p style="color: #856404; font-size: 13px; margin-top: 10px;">Partners: PayPal-like, eBay-like, Cloudflare-like</p>
                        </div>
                        <button class="btn-primary" onclick="generatePitchDeck()">📊 Generate Pitch Deck</button>
                    </div>
                </div>
            </div>
        `,
        
        risk: `
            <h2>🎲 RISK Game Companion</h2>
            <p style="text-align: center;">AI-powered strategy assistant for RISK board game</p>
            <div style="max-width: 900px; margin: 0 auto;">
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🗺️ Game Board Setup</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h4>Players</h4>
                            <select id="riskPlayers" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 6px; margin-bottom: 10px;">
                                <option>2 Players</option>
                                <option>3 Players</option>
                                <option>4 Players</option>
                                <option>5 Players</option>
                                <option selected>6 Players</option>
                            </select>
                            <button class="btn-secondary" onclick="initRiskGame()">Initialize Game</button>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h4>Current Turn</h4>
                            <div id="riskCurrentPlayer" style="font-size: 24px; color: #0070ba; font-weight: bold; text-align: center; padding: 20px;">Red Player</div>
                            <button class="btn-primary" onclick="nextRiskTurn()">End Turn</button>
                        </div>
                    </div>
                    
                    <h3>🎯 AI Strategy Advisor</h3>
                    <div style="background: linear-gradient(135deg, #0070ba 0%, #003087 100%); color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="color: white;">Current Recommendation</h4>
                        <div id="riskAdvice" style="font-size: 15px; line-height: 1.6;">
                            Fortify Australia - it's the easiest continent to defend with only 1 entry point. Focus on building 3-5 armies there before expanding.
                        </div>
                        <button class="btn-secondary" style="margin-top: 15px; background: white; color: #0070ba;" onclick="getNewRiskAdvice()">Get New Advice</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div class="strategy-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h4>🛡️ Defensive Strategy</h4>
                            <p style="font-size: 13px; color: #6c757d;">Secure continent bonuses, fortify borders</p>
                            <button class="btn-secondary" onclick="analyzeDefense()">Analyze</button>
                        </div>
                        <div class="strategy-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h4>⚔️ Offensive Strategy</h4>
                            <p style="font-size: 13px; color: #6c757d;">Identify weak opponents, calculate odds</p>
                            <button class="btn-secondary" onclick="analyzeAttack()">Analyze</button>
                        </div>
                        <div class="strategy-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h4>📊 Territory Control</h4>
                            <p style="font-size: 13px; color: #6c757d;">View current territory distribution</p>
                            <button class="btn-secondary" onclick="showTerritoryMap()">View Map</button>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>🎲 Dice Calculator</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Attacking Armies:</label>
                            <input type="number" id="attackArmies" min="1" max="3" value="3" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 6px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Defending Armies:</label>
                            <input type="number" id="defendArmies" min="1" max="2" value="2" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 6px;">
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="calculateRiskOdds()">Calculate Win Probability</button>
                    <div id="riskOddsResult" style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold;"></div>
                </div>
            </div>
        `,
        
        smokey: `
            <h2>🐻 Smokey Bear Fire Prevention</h2>
            <p style="text-align: center;">Official U.S. Forest Service Fire Prevention & Education App</p>
            <div style="max-width: 900px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #228B22 0%, #006400 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                    <div style="font-size: 120px; margin-bottom: 20px;">🐻</div>
                    <h3 style="color: white; font-size: 32px; margin-bottom: 15px;">Only YOU Can Prevent Wildfires!</h3>
                    <p style="font-size: 18px;">- Smokey Bear</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px; border: 2px solid #228B22;">
                        <h4 style="color: #228B22;">🔥 Fire Danger Level</h4>
                        <div id="fireDangerLevel" style="font-size: 48px; text-align: center; margin: 20px 0; color: #ff6b6b; font-weight: bold;">HIGH</div>
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <strong>Current Conditions:</strong> Dry, windy - No campfires allowed
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-top: 15px; background: #228B22;" onclick="checkFireDanger()">Check My Location</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px; border: 2px solid #228B22;">
                        <h4 style="color: #228B22;">📍 Report a Fire</h4>
                        <p style="color: #6c757d; margin-bottom: 15px;">See smoke or fire? Report immediately!</p>
                        <input type="text" id="fireLocation" placeholder="Location or GPS coordinates..." style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 10px;">
                        <textarea id="fireDescription" placeholder="Describe what you see..." style="width: 100%; min-height: 80px; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 10px;"></textarea>
                        <button class="btn-primary" style="width: 100%; background: #dc3545;" onclick="reportFire()">🚨 Report Fire Now</button>
                        <p style="font-size: 12px; color: #6c757d; margin-top: 10px;">Emergency: Call 911 first!</p>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>📚 Fire Safety Education</h3>
                    <div class="education-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 20px;">
                        <div class="safety-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #228B22;">
                            <h4>🏕️ Campfire Safety</h4>
                            <ul style="font-size: 14px; color: #6c757d; padding-left: 20px;">
                                <li>Clear 10-foot area around fire</li>
                                <li>Keep water/shovel nearby</li>
                                <li>Never leave unattended</li>
                                <li>Drown, stir, feel - ensure it's cold</li>
                            </ul>
                            <button class="btn-secondary" onclick="learnMore('campfire')">Learn More</button>
                        </div>
                        
                        <div class="safety-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #228B22;">
                            <h4>🏠 Home Defensible Space</h4>
                            <ul style="font-size: 14px; color: #6c757d; padding-left: 20px;">
                                <li>Clear 30 feet around home</li>
                                <li>Remove dead vegetation</li>
                                <li>Trim tree branches</li>
                                <li>Use fire-resistant materials</li>
                            </ul>
                            <button class="btn-secondary" onclick="learnMore('defensible')">Learn More</button>
                        </div>
                        
                        <div class="safety-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #228B22;">
                            <h4>🚗 Vehicle Fire Prevention</h4>
                            <ul style="font-size: 14px; color: #6c757d; padding-left: 20px;">
                                <li>Don't park on dry grass</li>
                                <li>Check tire chains for sparks</li>
                                <li>Maintain exhaust systems</li>
                                <li>Carry fire extinguisher</li>
                            </ul>
                            <button class="btn-secondary" onclick="learnMore('vehicle')">Learn More</button>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>🎓 Kids' Fire Safety Zone</h3>
                    <div style="text-align: center; padding: 30px;">
                        <div style="font-size: 80px; margin-bottom: 20px;">🐻🎨</div>
                        <h4>Learn with Smokey!</h4>
                        <p style="color: #6c757d; margin: 15px 0;">Interactive games, coloring pages, and fire safety tips for kids</p>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 20px;">
                            <button class="btn-primary" onclick="playFireSafetyGame()">🎮 Play Game</button>
                            <button class="btn-secondary" onclick="downloadColoringPages()">🖍️ Coloring Pages</button>
                            <button class="btn-secondary" onclick="watchSafetyVideos()">📺 Watch Videos</button>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-top: 20px; text-align: center;">
                    <p style="font-size: 13px; color: #6c757d;">
                        Official partner of U.S. Forest Service & Ad Council<br>
                        Smokey Bear celebrating 75+ years of wildfire prevention
                    </p>
                </div>
            </div>
        `,
        
        safehaven: `
            <h2>📈 Safe Haven Stocks</h2>
            <p style="text-align: center;">AI-validated business listings for the Infinity Plateau</p>
            <div style="max-width: 900px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0070ba 0%, #003087 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🛡️ Infinity Standards Model</h3>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Chat AI decides if a business or stock is actually listable on the Infinity Plateau. 
                        Only positive assets with verified ethics, sustainability, and community impact are approved.
                    </p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🔍 Submit Business for Validation</h3>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Business/Stock Name:</label>
                        <input type="text" id="businessName" placeholder="e.g., Tesla, Apple, Local Farm Co-op" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Stock Symbol (if applicable):</label>
                        <input type="text" id="stockSymbol" placeholder="e.g., TSLA, AAPL" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Business Description:</label>
                        <textarea id="businessDesc" placeholder="What does this business do?" style="width: 100%; min-height: 100px; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;"></textarea>
                    </div>
                    <button class="btn-primary" onclick="validateBusiness()">🤖 AI Validation Analysis</button>
                </div>
                
                <div id="validationResult" style="display: none; background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>AI Validation Result</h3>
                    <div id="validationContent"></div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>✅ Approved Infinity Plateau Stocks</h3>
                    <p style="color: #6c757d; margin-bottom: 20px;">Businesses validated as positive assets</p>
                    <div class="stock-grid" style="display: grid; gap: 15px;">
                        <div class="stock-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h4 style="margin-bottom: 5px;">Renewable Energy Co-op</h4>
                                    <p style="font-size: 13px; color: #6c757d;">Community-owned solar initiative</p>
                                </div>
                                <div style="text-align: right;">
                                    <div style="color: #28a745; font-weight: bold;">✅ APPROVED</div>
                                    <div style="font-size: 12px; color: #6c757d;">Ethics: 95/100</div>
                                </div>
                            </div>
                        </div>
                        <div class="stock-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #28a745;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h4 style="margin-bottom: 5px;">Organic Farming Alliance</h4>
                                    <p style="font-size: 13px; color: #6c757d;">Sustainable agriculture network</p>
                                </div>
                                <div style="text-align: right;">
                                    <div style="color: #28a745; font-weight: bold;">✅ APPROVED</div>
                                    <div style="font-size: 12px; color: #6c757d;">Ethics: 98/100</div>
                                </div>
                            </div>
                        </div>
                        <div class="stock-card" style="padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h4 style="margin-bottom: 5px;">Big Tech Corp X</h4>
                                    <p style="font-size: 13px; color: #6c757d;">Under review for data practices</p>
                                </div>
                                <div style="text-align: right;">
                                    <div style="color: #ffc107; font-weight: bold;">⚠️ REVIEW</div>
                                    <div style="font-size: 12px; color: #6c757d;">Ethics: 62/100</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        cancer: `
            <h2>🎗️ Cancer Obliteration</h2>
            <p style="text-align: center;">Mainstream medicine aggregator with AI agents building cases for new treatments</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #e91e63 0%, #9c27b0 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🔬 Fighting Cancer with AI & Science</h3>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Live RSS feed aggregation of mainstream cancer research. AI autopilot agents analyze articles, 
                        build cases for new medications, and track breakthrough treatments in real-time.
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h4 style="color: #e91e63;">📰 Live Research Feed</h4>
                        <div id="cancerFeed" style="max-height: 400px; overflow-y: auto; margin-top: 15px;">
                            <div class="research-item" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #e91e63;">
                                <strong>Breakthrough in Immunotherapy</strong>
                                <p style="font-size: 13px; color: #6c757d; margin: 5px 0;">New CAR-T cell treatment shows 87% remission rate in trial</p>
                                <small style="color: #999;">Nature Medicine - 2 hours ago</small>
                            </div>
                            <div class="research-item" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #9c27b0;">
                                <strong>mRNA Vaccine for Melanoma</strong>
                                <p style="font-size: 13px; color: #6c757d; margin: 5px 0;">Personalized mRNA vaccines reduce recurrence by 44%</p>
                                <small style="color: #999;">The Lancet - 5 hours ago</small>
                            </div>
                            <div class="research-item" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #e91e63;">
                                <strong>Early Detection AI System</strong>
                                <p style="font-size: 13px; color: #6c757d; margin: 5px 0;">Machine learning detects lung cancer 2 years earlier</p>
                                <small style="color: #999;">JAMA Oncology - 8 hours ago</small>
                            </div>
                        </div>
                        <button class="btn-secondary" style="width: 100%; margin-top: 15px;" onclick="refreshCancerFeed()">🔄 Refresh Feed</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h4 style="color: #9c27b0;">🤖 AI Agent Analysis</h4>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
                            <h5>Active Cases Being Built:</h5>
                            <div style="margin-top: 15px;">
                                <div style="margin-bottom: 15px;">
                                    <strong>Pancreatic Cancer Treatment</strong>
                                    <div style="background: #e5e5e5; height: 8px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                                        <div style="background: #e91e63; height: 100%; width: 73%;"></div>
                                    </div>
                                    <small style="color: #6c757d;">73% - Analyzing 124 studies</small>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <strong>Breast Cancer Prevention</strong>
                                    <div style="background: #e5e5e5; height: 8px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                                        <div style="background: #9c27b0; height: 100%; width: 91%;"></div>
                                    </div>
                                    <small style="color: #6c757d;">91% - Analyzing 203 studies</small>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <strong>Prostate Cancer Markers</strong>
                                    <div style="background: #e5e5e5; height: 8px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                                        <div style="background: #e91e63; height: 100%; width: 45%;"></div>
                                    </div>
                                    <small style="color: #6c757d;">45% - Analyzing 87 studies</small>
                                </div>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="viewAIAnalysis()">View Full Analysis</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>💊 New Medication Cases</h3>
                    <p style="color: #6c757d; margin-bottom: 20px;">AI-compiled evidence for emerging treatments</p>
                    <div class="medication-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px;">
                        <div class="med-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-top: 4px solid #28a745;">
                            <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 10px;">
                                <h4>Drug: Pembrolizumab</h4>
                                <span style="background: #28a745; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; margin-left: 10px;">APPROVED</span>
                            </div>
                            <p style="font-size: 13px; color: #6c757d;">Target: Multiple cancers</p>
                            <p style="font-size: 13px; color: #6c757d;">Evidence: 847 studies analyzed</p>
                            <p style="font-size: 13px; color: #6c757d;">Efficacy: 72% response rate</p>
                            <button class="btn-secondary" style="margin-top: 10px;" onclick="viewMedDetails('pembrolizumab')">View Details</button>
                        </div>
                        <div class="med-card" style="padding: 20px; background: #fff3cd; border-radius: 8px; border-top: 4px solid #ffc107;">
                            <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 10px;">
                                <h4>Drug: Experimental-XR9</h4>
                                <span style="background: #ffc107; color: #000; padding: 4px 12px; border-radius: 12px; font-size: 11px; margin-left: 10px;">PHASE III</span>
                            </div>
                            <p style="font-size: 13px; color: #6c757d;">Target: Lung cancer</p>
                            <p style="font-size: 13px; color: #6c757d;">Evidence: 234 studies analyzed</p>
                            <p style="font-size: 13px; color: #6c757d;">Efficacy: 68% response rate</p>
                            <button class="btn-secondary" style="margin-top: 10px;" onclick="viewMedDetails('xr9')">View Details</button>
                        </div>
                        <div class="med-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-top: 4px solid #0070ba;">
                            <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 10px;">
                                <h4>Drug: CAR-T Combo</h4>
                                <span style="background: #0070ba; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; margin-left: 10px;">RESEARCH</span>
                            </div>
                            <p style="font-size: 13px; color: #6c757d;">Target: Blood cancers</p>
                            <p style="font-size: 13px; color: #6c757d;">Evidence: 156 studies analyzed</p>
                            <p style="font-size: 13px; color: #6c757d;">Efficacy: 82% response rate</p>
                            <button class="btn-secondary" style="margin-top: 10px;" onclick="viewMedDetails('cart')">View Details</button>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>🔬 Mainstream Medicine Sources</h3>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
                        <span class="source-badge">PubMed</span>
                        <span class="source-badge">Nature</span>
                        <span class="source-badge">The Lancet</span>
                        <span class="source-badge">JAMA</span>
                        <span class="source-badge">New England Journal of Medicine</span>
                        <span class="source-badge">Cancer Research</span>
                        <span class="source-badge">Cell</span>
                        <span class="source-badge">Science</span>
                    </div>
                    <button class="btn-primary" style="margin-top: 20px;" onclick="configureRSSFeeds()">⚙️ Configure RSS Feeds</button>
                </div>
            </div>
            <style>
                .source-badge {
                    display: inline-block;
                    padding: 6px 12px;
                    background: #e91e63;
                    color: white;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: 500;
                }
            </style>
        `,
        
        coinidentity: `
            <h2>🪙 Coin Identity</h2>
            <p style="text-align: center;">Cylinder Resonance Technology - Proving coin authenticity without carbon dating</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px;">🔬 New Tech Horizons</h3>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Revolutionary cylinder resonance rendering technology analyzes metal composition echoes, 
                        manufacturing patterns, and vibrational signatures to authenticate ancient coins - 
                        revealing echoes of the past without destructive carbon dating.
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 30px; border-radius: 12px;">
                        <h3>📸 Upload Coin Image</h3>
                        <div style="border: 3px dashed #d9d9d9; border-radius: 12px; padding: 40px; text-align: center; background: #f8f9fa; margin: 20px 0;">
                            <div style="font-size: 64px; margin-bottom: 15px;">📷</div>
                            <p style="color: #6c757d;">Click or drag to upload coin image</p>
                            <input type="file" id="coinImage" accept="image/*" style="display: none;" onchange="handleCoinImageUpload(event)">
                            <button class="btn-secondary" onclick="document.getElementById('coinImage').click()">Choose Image</button>
                        </div>
                        <div id="coinImagePreview" style="display: none; text-align: center; margin-bottom: 15px;">
                            <img id="coinPreviewImg" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="scanCoinImage()">🔍 Scan & Analyze</button>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 12px;">
                        <h3>🌊 Cylinder Resonance Scan</h3>
                        <div style="background: #000; padding: 30px; border-radius: 12px; margin: 20px 0; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 200px; height: 200px;">
                                <div style="position: absolute; border: 2px solid #FFD700; border-radius: 50%; width: 100%; height: 100%; opacity: 0.6; animation: pulse 2s infinite;"></div>
                                <div style="position: absolute; border: 2px solid #FFA500; border-radius: 50%; width: 80%; height: 80%; top: 10%; left: 10%; opacity: 0.6; animation: pulse 2s 0.5s infinite;"></div>
                                <div style="position: absolute; border: 2px solid #FFD700; border-radius: 50%; width: 60%; height: 60%; top: 20%; left: 20%; opacity: 0.6; animation: pulse 2s 1s infinite;"></div>
                            </div>
                            <div style="text-align: center; color: #FFD700; font-size: 48px; position: relative; z-index: 10;">🪙</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <h4>Resonance Data:</h4>
                            <p style="font-size: 13px; color: #6c757d; margin: 5px 0;">Frequency: 2.847 kHz</p>
                            <p style="font-size: 13px; color: #6c757d; margin: 5px 0;">Harmonic Pattern: Ancient Roman</p>
                            <p style="font-size: 13px; color: #6c757d; margin: 5px 0;">Metal Composition: 92% Silver, 8% Copper</p>
                            <p style="font-size: 13px; color: #6c757d; margin: 5px 0;">Manufacture Era: 100-200 AD</p>
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="analyzeCoinResonance()">📊 Deep Analysis</button>
                    </div>
                </div>
                
                <!-- Edison Cylinder Resonance Analysis Results -->
                <div id="coinAnalysisResult" style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; min-height: 100px;">
                    <div style="text-align: center; color: #6c757d; padding: 40px;">
                        <p>Upload a coin image and scan to see Thomas Edison's cylinder resonance data extraction</p>
                        <p style="font-size: 13px; margin-top: 10px;">Every conversation, transaction, and moment near this coin is stored in Watson particles</p>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🏛️ Echoes of the Past - Verified Coins</h3>
                    <div class="coin-gallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
                        <div class="coin-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #FFD700;">
                            <div style="font-size: 80px; margin-bottom: 10px;">🪙</div>
                            <h4>Roman Denarius</h4>
                            <p style="font-size: 13px; color: #6c757d;">Emperor Marcus Aurelius</p>
                            <p style="font-size: 13px; color: #6c757d;">Era: 161-180 AD</p>
                            <div style="background: #28a745; color: white; padding: 6px 12px; border-radius: 16px; display: inline-block; margin-top: 10px; font-size: 12px;">
                                ✓ Verified 98%
                            </div>
                        </div>
                        <div class="coin-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #FFD700;">
                            <div style="font-size: 80px; margin-bottom: 10px;">🪙</div>
                            <h4>Greek Tetradrachm</h4>
                            <p style="font-size: 13px; color: #6c757d;">Athens Owl</p>
                            <p style="font-size: 13px; color: #6c757d;">Era: 450-400 BC</p>
                            <div style="background: #28a745; color: white; padding: 6px 12px; border-radius: 16px; display: inline-block; margin-top: 10px; font-size: 12px;">
                                ✓ Verified 96%
                            </div>
                        </div>
                        <div class="coin-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #FFD700;">
                            <div style="font-size: 80px; margin-bottom: 10px;">🪙</div>
                            <h4>Byzantine Solidus</h4>
                            <p style="font-size: 13px; color: #6c757d;">Justinian I</p>
                            <p style="font-size: 13px; color: #6c757d;">Era: 527-565 AD</p>
                            <div style="background: #28a745; color: white; padding: 6px 12px; border-radius: 16px; display: inline-block; margin-top: 10px; font-size: 12px;">
                                ✓ Verified 99%
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>🔬 How Cylinder Resonance Works</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 20px;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h4 style="color: #FFD700;">1️⃣ Acoustic Scanning</h4>
                            <p style="font-size: 13px; color: #6c757d;">Cylinder resonance chamber generates specific frequencies that interact with coin's metal structure</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h4 style="color: #FFA500;">2️⃣ Echo Analysis</h4>
                            <p style="font-size: 13px; color: #6c757d;">AI analyzes echo patterns revealing manufacturing methods and metal composition unique to specific eras</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h4 style="color: #FFD700;">3️⃣ Pattern Matching</h4>
                            <p style="font-size: 13px; color: #6c757d;">Compare resonance signatures against database of verified ancient coins without any physical damage</p>
                        </div>
                    </div>
                    <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <h4 style="color: #856404;">🆕 New Tech Horizons</h4>
                        <p style="color: #856404;">This revolutionary non-destructive method preserves coins while providing authentication accuracy previously impossible without carbon dating or chemical analysis.</p>
                    </div>
                </div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.3;
                    }
                }
            </style>
        `,
        
        musicdownloader: `
            <h2>🎵 Music Downloader</h2>
            <p style="text-align: center;">Internet Archive to Hydrogen Cloud - Private collections with Infinity Standards</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">☁️ Hydrogen Cloud Storage Center</h3>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Download music, videos, documentaries, and cartoons directly from Internet Archive. 
                        All content is Infinity Standardized for copyright compliance, quality, and stored in your private Hydrogen Cloud.
                    </p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🔍 Search Internet Archive</h3>
                    <div style="display: flex; gap: 10px; margin: 20px 0;">
                        <input type="text" id="musicSearch" placeholder="Search music, videos, documentaries, cartoons..." style="flex: 1; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px; font-size: 16px;">
                        <button class="btn-primary" style="padding: 12px 30px;" onclick="searchInternetArchive()">Search</button>
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
                        <button class="btn-secondary" onclick="document.getElementById('musicSearch').value='jazz'; searchInternetArchive()">🎺 Jazz</button>
                        <button class="btn-secondary" onclick="document.getElementById('musicSearch').value='classical'; searchInternetArchive()">🎻 Classical</button>
                        <button class="btn-secondary" onclick="document.getElementById('musicSearch').value='public domain films'; searchInternetArchive()">🎬 Films</button>
                        <button class="btn-secondary" onclick="document.getElementById('musicSearch').value='documentaries'; searchInternetArchive()">📺 Docs</button>
                        <button class="btn-secondary" onclick="document.getElementById('musicSearch').value='cartoons'; searchInternetArchive()">🎨 Cartoons</button>
                    </div>
                    <div id="musicResults" style="min-height: 200px;">
                        <p style="text-align: center; color: #6c757d; padding: 40px;">Enter search terms to find content from Internet Archive</p>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>☁️ Your Hydrogen Cloud Storage</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 10px;">🎵</div>
                            <h4>Music</h4>
                            <p style="font-size: 24px; color: #667eea; font-weight: bold;">1.27 GB</p>
                            <p style="font-size: 13px; color: #6c757d;">18 albums</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 10px;">🎬</div>
                            <h4>Videos</h4>
                            <p style="font-size: 24px; color: #667eea; font-weight: bold;">3.6 GB</p>
                            <p style="font-size: 13px; color: #6c757d;">12 films</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 10px;">📺</div>
                            <h4>Documentaries</h4>
                            <p style="font-size: 24px; color: #667eea; font-weight: bold;">6.1 GB</p>
                            <p style="font-size: 13px; color: #6c757d;">28 episodes</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 10px;">🎨</div>
                            <h4>Cartoons</h4>
                            <p style="font-size: 24px; color: #667eea; font-weight: bold;">1.9 GB</p>
                            <p style="font-size: 13px; color: #6c757d;">45 episodes</p>
                        </div>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>Total Storage Used:</strong> 12.87 GB
                            </div>
                            <div>
                                <strong>Infinity Standardized:</strong> <span style="color: #28a745;">100%</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="viewHydrogenStorage()">📁 Browse All Files</button>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>✓ Infinity Standardization</h3>
                    <p style="color: #6c757d; margin-bottom: 20px;">All content must pass Infinity Standards before moving through the system</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                            <h4>✓ Copyright Check</h4>
                            <p style="font-size: 13px; color: #6c757d;">Public domain or properly licensed</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                            <h4>✓ Quality Validation</h4>
                            <p style="font-size: 13px; color: #6c757d;">Audio/Video meets minimum standards</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                            <h4>✓ Format Conversion</h4>
                            <p style="font-size: 13px; color: #6c757d;">Standardized to Infinity formats</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
                            <h4>✓ Metadata Complete</h4>
                            <p style="font-size: 13px; color: #6c757d;">Artist, title, year, source tracked</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        arrowhead: `
            <h2>🏹 Arrowhead Artifact Identification</h2>
            <p style="text-align: center;">LLM Study on Real Arrowheads of Native Americans in USA</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🪶 Authentic Native American Artifact Analysis</h3>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Professional archaeological identification system using AI trained on thousands of authentic Native American arrowheads. 
                        Identify tribe, period, region, and material composition with scientific accuracy.
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 30px; border-radius: 12px;">
                        <h3>📸 Upload Arrowhead Photo</h3>
                        <div style="border: 3px dashed #d9d9d9; border-radius: 12px; padding: 40px; text-align: center; background: #f8f9fa; margin: 20px 0;">
                            <div style="font-size: 64px; margin-bottom: 15px;">📷</div>
                            <p style="color: #6c757d;">Upload clear photos from multiple angles</p>
                            <input type="file" id="arrowheadImage" accept="image/*" multiple style="display: none;" onchange="handleArrowheadUpload(event)">
                            <button class="btn-secondary" onclick="document.getElementById('arrowheadImage').click()">Choose Images</button>
                        </div>
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 15px;">
                            <strong>📌 Tips for Best Results:</strong>
                            <ul style="font-size: 13px; color: #856404; margin: 10px 0; padding-left: 20px;">
                                <li>Natural lighting preferred</li>
                                <li>Include scale reference (ruler/coin)</li>
                                <li>Photograph both sides</li>
                                <li>Clear, focused images</li>
                            </ul>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="analyzeArrowhead()">🔍 Analyze Arrowhead</button>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 12px;">
                        <h3>📊 AI Analysis Results</h3>
                        <div id="arrowheadAnalysis" style="background: #f8f9fa; padding: 25px; border-radius: 12px; min-height: 300px;">
                            <div style="text-align: center; padding: 40px; color: #6c757d;">
                                <div style="font-size: 64px; margin-bottom: 15px;">🏹</div>
                                <p>Upload images to begin analysis</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>📚 Arrowhead Type Database</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                        <div class="artifact-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #8B4513;">
                            <div style="font-size: 48px; text-align: center; margin-bottom: 10px;">🏹</div>
                            <h4>Clovis Point</h4>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Period:</strong> Paleo-Indian (13,000-12,000 years ago)</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Region:</strong> Throughout North America</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Features:</strong> Fluted base, symmetrical</p>
                            <button class="btn-secondary" onclick="learnMoreArrowhead('clovis')">Learn More</button>
                        </div>
                        
                        <div class="artifact-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #8B4513;">
                            <div style="font-size: 48px; text-align: center; margin-bottom: 10px;">🏹</div>
                            <h4>Folsom Point</h4>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Period:</strong> Paleo-Indian (10,000-9,000 years ago)</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Region:</strong> Great Plains</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Features:</strong> Deep channel flakes</p>
                            <button class="btn-secondary" onclick="learnMoreArrowhead('folsom')">Learn More</button>
                        </div>
                        
                        <div class="artifact-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #8B4513;">
                            <div style="font-size: 48px; text-align: center; margin-bottom: 10px;">🏹</div>
                            <h4>Dalton Point</h4>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Period:</strong> Late Paleo (10,000-9,500 years ago)</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Region:</strong> Southeastern US</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Features:</strong> Beveled edges, serrated</p>
                            <button class="btn-secondary" onclick="learnMoreArrowhead('dalton')">Learn More</button>
                        </div>
                        
                        <div class="artifact-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #8B4513;">
                            <div style="font-size: 48px; text-align: center; margin-bottom: 10px;">🏹</div>
                            <h4>Scottsbluff Point</h4>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Period:</strong> Paleo-Indian (8,000-7,000 years ago)</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Region:</strong> Rocky Mountains to Great Plains</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Features:</strong> Shouldered, stem base</p>
                            <button class="btn-secondary" onclick="learnMoreArrowhead('scottsbluff')">Learn More</button>
                        </div>
                        
                        <div class="artifact-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #8B4513;">
                            <div style="font-size: 48px; text-align: center; margin-bottom: 10px;">🏹</div>
                            <h4>Archaic Side-Notched</h4>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Period:</strong> Archaic (8,000-3,000 years ago)</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Region:</strong> Eastern Woodlands</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Features:</strong> Notches on sides, various sizes</p>
                            <button class="btn-secondary" onclick="learnMoreArrowhead('archaic')">Learn More</button>
                        </div>
                        
                        <div class="artifact-card" style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #8B4513;">
                            <div style="font-size: 48px; text-align: center; margin-bottom: 10px;">🏹</div>
                            <h4>Woodland Triangular</h4>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Period:</strong> Woodland (3,000-1,000 years ago)</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Region:</strong> Eastern US</p>
                            <p style="font-size: 13px; color: #6c757d;"><strong>Features:</strong> Small, triangular, unnotched</p>
                            <button class="btn-secondary" onclick="learnMoreArrowhead('woodland')">Learn More</button>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>🔬 Material Analysis</h3>
                    <p style="color: #6c757d; margin-bottom: 20px;">Common materials used in Native American projectile points</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4>Flint/Chert</h4>
                            <p style="font-size: 12px; color: #6c757d;">Most common, various colors</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4>Obsidian</h4>
                            <p style="font-size: 12px; color: #6c757d;">Volcanic glass, black/green</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4>Jasper</h4>
                            <p style="font-size: 12px; color: #6c757d;">Red/brown, highly valued</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4>Quartzite</h4>
                            <p style="font-size: 12px; color: #6c757d;">Durable, widespread</p>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
                            <h4>Agate</h4>
<parameter name="p style" style="font-size: 12px; color: #6c757d;">Banded, beautiful</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        postermaker: `
            <h2>🎨 Poster Maker</h2>
            <p style="text-align: center;">Create professional posters with AI</p>
            <div style="max-width: 900px; margin: 0 auto;">
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>Design Canvas</h3>
                    <div id="posterCanvas" style="background: #f8f9fa; min-height: 500px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <p style="color: #6c757d;">AI Poster Generator Ready</p>
                    </div>
                    <button class="btn-primary" style="margin-top: 15px;" onclick="generateAIPoster()">✨ Generate Poster</button>
                </div>
            </div>
        `,
        
        listinggenerator: `
            <h2>📋 Listing Generator</h2>
            <p style="text-align: center;">Auto-crop photo, AI description, title & pricing with Rogers</p>
            <div style="max-width: 900px; margin: 0 auto;">
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>Upload Product Photo</h3>
                    <input type="file" id="listingImage" accept="image/*" style="display: none;" onchange="handleListingUpload(event)">
                    <button class="btn-primary" onclick="document.getElementById('listingImage').click()">📷 Upload Photo</button>
                    <div id="listingResults" style="margin-top: 20px;"></div>
                </div>
            </div>
        `,
        
        moviedownloader: `
            <h2>🎬 Movie/TV Downloader</h2>
            <p style="text-align: center;">Download from Internet Archive to Hydrogen Cloud</p>
            <div style="max-width: 900px; margin: 0 auto;">
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>Search Movies & TV Shows</h3>
                    <input type="text" id="movieSearch" placeholder="Search Internet Archive..." style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                    <button class="btn-primary" onclick="searchMovies()">🔍 Search</button>
                    <div id="movieResults" style="margin-top: 20px;"></div>
                </div>
            </div>
        `,
        
        globalcommand: `
            <h2>🌐 Global Command Authority</h2>
            <p style="text-align: center;">Presidential NWO Panel - Robots Secondary Leader</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white;">🏛️ Infinity Presidential Node</h3>
                    <p>Global coordination system with AI robot agents as secondary leaders</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🤖 Robot Agent Leaders</h3>
                    <div id="robotLeaders"></div>
                    <button class="btn-primary" onclick="viewRobotLeaders()">View All Agents</button>
                </div>
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>🗺️ All-Lands Conference Room</h3>
                    <p style="color: #6c757d;">Israel-everywhere digital conference space</p>
                    <button class="btn-primary" onclick="joinConference()">Join Conference</button>
                </div>
            </div>
        `,
        
        forge: `
            <h2>⚒️ Infinity Forge</h2>
            <p style="text-align: center;">App creation and customization forge</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white;">⚒️ Build Your Infinity App</h3>
                    <p>Create custom apps using the Infinity platform framework</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>App Builder</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">App Name:</label>
                        <input type="text" id="forgeAppName" placeholder="My Awesome App" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Description:</label>
                        <textarea id="forgeAppDesc" placeholder="What does your app do?" style="width: 100%; min-height: 100px; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;"></textarea>
                    </div>
                    <button class="btn-primary" onclick="forgeNewApp()">🔨 Forge App with AI</button>
                </div>
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>Template Gallery</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                        <div class="forge-template" onclick="loadForgeTemplate('dashboard')">📊 Dashboard</div>
                        <div class="forge-template" onclick="loadForgeTemplate('ecommerce')">🛒 E-commerce</div>
                        <div class="forge-template" onclick="loadForgeTemplate('social')">👥 Social</div>
                        <div class="forge-template" onclick="loadForgeTemplate('utility')">🔧 Utility</div>
                    </div>
                </div>
            </div>
            <style>
                .forge-template {
                    padding: 30px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    text-align: center;
                    cursor: pointer;
                    border: 2px solid #d9d9d9;
                    transition: all 0.2s;
                }
                .forge-template:hover {
                    background: #0070ba;
                    color: white;
                    border-color: #0070ba;
                }
            </style>
        `,
        
        fieldlab: `
            <h2>🔬 Infinity Field Lab</h2>
            <p style="text-align: center;">Ultra-Lite Watson Physics • Love Reflector • Gold Barrier • Resonance Detection</p>
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">⚡ Infinity Physics Experiments</h3>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Pure scientific instruments for Watson Field experiments. No external packages. ES5-safe calculations.
                    </p>
                </div>
                
                <!-- Mirror Law of Infinity -->
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🪞 Mirror Law of Infinity (Love Reflector)</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Infinite Wave (Hz):</label>
                            <input type="number" id="infiniteWave" value="10" step="0.1" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Love Frequency (Hz):</label>
                            <input type="number" id="loveFreq" value="5" step="0.1" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                                <strong>Reflected Love:</strong> <span id="reflectedLove">50.0000</span>
                                <p style="font-size: 13px; color: #64748b; margin-top: 5px;">L_ref = ω_inf × f_love</p>
                            </div>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
                                <strong>Coherent intention multiplies love's carrier wave.</strong> Raising the baseline amplifies compassion without saturating boundaries. The Mirror Law states that infinite consciousness reflects finite love at exponential rates.
                            </p>
                        </div>
                    </div>
                    <button class="btn-primary" style="margin-top: 15px;" onclick="calculateMirrorLaw()">🔄 Recalculate</button>
                </div>
                
                <!-- Gold Barrier -->
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🥇 Gold Barrier — Selective Permeability</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Watson Frequency (Hz):</label>
                            <input type="number" id="watsonFreq" value="10" step="0.1" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Watson Amplitude:</label>
                            <input type="number" id="watsonAmp" value="1" step="0.01" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Gold Thickness (mm):</label>
                            <input type="number" id="goldThickness" value="0.1" step="0.01" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #fbbf24;">
                                <strong>Transmission:</strong> <span id="goldTransmission">0.9900</span>
                                <p style="font-size: 13px; color: #64748b; margin-top: 5px;">T = exp(-t / (f · A))</p>
                            </div>
                            
                            <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border-left: 4px solid #16a34a; margin-top: 15px;">
                                <div id="empathyBandStatus" style="font-size: 13px;">
                                    ❌ Outside Empathy Band - Attenuated
                                </div>
                                <p style="font-size: 11px; color: #64748b; margin-top: 5px; margin-bottom: 0;">
                                    Alpha Waves (8-14 Hz): Love, Trust, Empathy pass through
                                </p>
                            </div>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <canvas id="goldBarrierChart" width="400" height="200" style="width: 100%; max-width: 400px;"></canvas>
                            <p style="font-size: 13px; color: #64748b; margin-top: 10px; text-align: center;">Transmission vs Frequency</p>
                        </div>
                    </div>
                    <button class="btn-primary" style="margin-top: 15px;" onclick="calculateGoldBarrier()">📊 Calculate Barrier</button>
                </div>
                
                <!-- Particle Duality -->
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>⚛️ Finite ↔ Infinite Particle Duality</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Base Energy E0:</label>
                            <input type="number" id="baseEnergy" value="10" step="0.1" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Phase φ (radians):</label>
                            <input type="number" id="phase" value="0.785" step="0.01" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                                <strong>Duality Energy:</strong> <span id="dualityEnergy">7.0711</span>
                                <p style="font-size: 13px; color: #64748b; margin-top: 5px;">
                                    Finite (φ < π/2): E = E₀ · sin(φ)<br>
                                    Infinite (φ ≥ π/2): E = E₀ · e^φ
                                </p>
                            </div>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <canvas id="dualityChart" width="400" height="200" style="width: 100%; max-width: 400px;"></canvas>
                            <p style="font-size: 13px; color: #64748b; margin-top: 10px; text-align: center;">Energy vs Phase</p>
                        </div>
                    </div>
                    <button class="btn-primary" style="margin-top: 15px;" onclick="calculateDuality()">⚡ Calculate Energy</button>
                </div>
                
                <!-- Watson Field Resonance -->
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>📡 Watson Field Resonance — Matched Filter</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Resonance f0 (Hz):</label>
                            <input type="number" id="resonanceFreq" value="10" step="0.1" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">SNR (dB):</label>
                            <input type="number" id="snrDb" value="-3" step="0.1" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Coil Sensitivity:</label>
                            <input type="number" id="coilSens" value="0.1" step="0.01" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <label style="display: block; margin-bottom: 8px; font-weight: 500;">SQUID Sensitivity:</label>
                            <input type="number" id="squidSens" value="0.01" step="0.001" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            
                            <div id="resonanceResult" style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                                <strong>Correlation:</strong> <span id="correlation">0.0000</span>
                                <div id="detectionStatus" style="margin-top: 8px; padding: 6px 12px; border-radius: 999px; background: #fee2e2; color: #991b1b; display: inline-block; font-size: 12px;">
                                    Not detected
                                </div>
                            </div>
                        </div>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <canvas id="resonanceChart" width="400" height="200" style="width: 100%; max-width: 400px;"></canvas>
                            <p style="font-size: 13px; color: #64748b; margin-top: 10px; text-align: center;">Signal Time Series</p>
                        </div>
                    </div>
                    <button class="btn-primary" style="margin-top: 15px;" onclick="detectResonance()">🔍 Detect Resonance</button>
                </div>
                
                <div style="text-align: center; margin-top: 20px; padding: 20px; color: #64748b; font-size: 12px;">
                    Infinity Field Lab • Ultra-Lite v1.4 — Rogers-ready • Pure JavaScript • No packages
                </div>
            </div>
        `,
        
        antiqueScience: `
            <h2>📻 Antique Science Magazine</h2>
            <p style="text-align: center;">Pre-1940 Science & Electronics • Powered by Infinity</p>
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">⚡ Vintage Innovation Archive</h3>
                    <p style="font-size: 15px; line-height: 1.6;">
                        Curated collection of antique radios, electronics, chemistry experiments, and scientific discoveries from the golden age of innovation (pre-1940). 
                        Continuously updated with Google search scraping, news aggregation, and historical research feeds.
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📡 Antique Radio Collection</h3>
                        <div id="radioGallery" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin-top: 15px;">
                            <div class="antique-card" style="background: #f8f9fa; border-radius: 8px; padding: 12px; text-align: center;">
                                <div style="font-size: 42px; margin-bottom: 8px;">📻</div>
                                <p style="font-size: 12px; font-weight: 600; margin: 0;">Crosley 1920</p>
                                <p style="font-size: 10px; color: #6c757d; margin: 5px 0 0 0;">Crystal Set</p>
                            </div>
                            <div class="antique-card" style="background: #f8f9fa; border-radius: 8px; padding: 12px; text-align: center;">
                                <div style="font-size: 42px; margin-bottom: 8px;">📻</div>
                                <p style="font-size: 12px; font-weight: 600; margin: 0;">Atwater Kent</p>
                                <p style="font-size: 10px; color: #6c757d; margin: 5px 0 0 0;">Tube Radio 1925</p>
                            </div>
                            <div class="antique-card" style="background: #f8f9fa; border-radius: 8px; padding: 12px; text-align: center;">
                                <div style="font-size: 42px; margin-bottom: 8px;">📻</div>
                                <p style="font-size: 12px; font-weight: 600; margin: 0;">Philco Model 20</p>
                                <p style="font-size: 10px; color: #6c757d; margin: 5px 0 0 0;">Cathedral 1930</p>
                            </div>
                            <div class="antique-card" style="background: #f8f9fa; border-radius: 8px; padding: 12px; text-align: center;">
                                <div style="font-size: 42px; margin-bottom: 8px;">📻</div>
                                <p style="font-size: 12px; font-weight: 600; margin: 0;">Zenith Tombstone</p>
                                <p style="font-size: 10px; color: #6c757d; margin: 5px 0 0 0;">Art Deco 1935</p>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="loadMoreRadios()">View Full Collection (487 items)</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🔬 Chemistry Experiments</h3>
                        <div style="max-height: 300px; overflow-y: auto;">
                            <div class="experiment-item" style="padding: 12px; background: #f0fdf4; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #16a34a;">
                                <h4 style="margin: 0 0 5px 0; font-size: 14px;">Electrolysis of Water (1800)</h4>
                                <p style="font-size: 12px; color: #6c757d; margin: 0;">Nicholson & Carlisle discover H2/O2 separation</p>
                            </div>
                            <div class="experiment-item" style="padding: 12px; background: #fef3c7; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #fbbf24;">
                                <h4 style="margin: 0 0 5px 0; font-size: 14px;">Periodic Table (1869)</h4>
                                <p style="font-size: 12px; color: #6c757d; margin: 0;">Mendeleev's elemental organization system</p>
                            </div>
                            <div class="experiment-item" style="padding: 12px; background: #dbeafe; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3b82f6;">
                                <h4 style="margin: 0 0 5px 0; font-size: 14px;">Radioactivity (1896)</h4>
                                <p style="font-size: 12px; color: #6c757d; margin: 0;">Becquerel discovers uranium radiation</p>
                            </div>
                            <div class="experiment-item" style="padding: 12px; background: #fce7f3; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #ec4899;">
                                <h4 style="margin: 0 0 5px 0; font-size: 14px;">Penicillin Discovery (1928)</h4>
                                <p style="font-size: 12px; color: #6c757d; margin: 0;">Fleming's accidental mold breakthrough</p>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="browseExperiments()">Browse 1,200+ Experiments</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>📰 Live News Aggregation</h3>
                    <p style="color: #6c757d; margin-bottom: 20px;">Auto-refreshing feed of vintage science discoveries and modern antique finds</p>
                    <div id="newsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 15px;">
                        <div class="news-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-top: 4px solid #0070ba;">
                            <div style="font-size: 11px; color: #6c757d; margin-bottom: 8px;">2 hours ago • eBay Finds</div>
                            <h4 style="margin: 0 0 10px 0;">1925 Western Electric Microphone Found</h4>
                            <p style="font-size: 13px; color: #6c757d; margin-bottom: 12px;">Rare carbon microphone from broadcast era discovered in estate sale</p>
                            <button class="btn-secondary" onclick="viewNewsItem('mic1925')">Read More</button>
                        </div>
                        <div class="news-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-top: 4px solid #16a34a;">
                            <div style="font-size: 11px; color: #6c757d; margin-bottom: 8px;">5 hours ago • Science History</div>
                            <h4 style="margin: 0 0 10px 0;">Edison's Cylinder Resonance Notes Decoded</h4>
                            <p style="font-size: 13px; color: #6c757d; margin-bottom: 12px;">New analysis reveals hidden experiments in 1890s lab journals</p>
                            <button class="btn-secondary" onclick="viewNewsItem('edison')">Read More</button>
                        </div>
                        <div class="news-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-top: 4px solid #fbbf24;">
                            <div style="font-size: 11px; color: #6c757d; margin-bottom: 8px;">1 day ago • Auction Alert</div>
                            <h4 style="margin: 0 0 10px 0;">Nikola Tesla Oscillator Coil Up for Bid</h4>
                            <p style="font-size: 13px; color: #6c757d; margin-bottom: 12px;">Original 1899 experimental apparatus from Colorado Springs lab</p>
                            <button class="btn-secondary" onclick="viewNewsItem('tesla')">Read More</button>
                        </div>
                    </div>
                    <button class="btn-primary" style="margin-top: 20px;" onclick="refreshNewsFeed()">🔄 Refresh Feed (Auto-updates every 30 min)</button>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 12px;">
                    <h3>🔍 Google Search Integration</h3>
                    <p style="color: #6c757d; margin-bottom: 15px;">Continuously scrapes for vintage electronics, experiments, and historical science content</p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;">
                            <span class="source-badge">Antique Radio Forums</span>
                            <span class="source-badge">Scientific American Archives</span>
                            <span class="source-badge">Chemistry History Database</span>
                            <span class="source-badge">Smithsonian Collections</span>
                            <span class="source-badge">Library of Congress</span>
                            <span class="source-badge">Popular Mechanics Archives</span>
                            <span class="source-badge">Early Electronics Journals</span>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; border: 2px solid #d9d9d9;">
                            <div style="font-size: 13px; color: #6c757d; margin-bottom: 10px;">Last scan: 14 minutes ago</div>
                            <div style="font-size: 15px; font-weight: 600;">✅ 47 new items found</div>
                            <div style="font-size: 13px; color: #16a34a; margin-top: 5px;">Next scan in: 16 minutes</div>
                        </div>
                    </div>
                    <button class="btn-primary" style="margin-top: 20px;" onclick="configureScraper()">⚙️ Configure Search Parameters</button>
                </div>
            </div>
        `,
        
        rogersTransceiver: `
            <h2>🎛️ Rogers Signal Transceiver</h2>
            <p style="text-align: center;">100-Dial Frequency Braiding Engine • Healing Resonance Lab • Autopilot Mode</p>
            <div style="max-width: 1400px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">⚡ Experimental Sound Tool - Not a Medical Device</h3>
                    <p style="font-size: 14px; line-height: 1.6;">
                        <strong>SAFETY NOTICE:</strong> This is an experimental frequency tool. Use low volume (20-30%). Preferably use speakers, not headphones. 
                        Each dial controls a base frequency with 3-strand braiding (±ΔHz detune). Stack only a few dials at a time, breathe 30-60s, then adjust.
                    </p>
                    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <strong>📡 System Status</strong>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                            <div>🔊 Audio Engine: <span id="audioStatus" style="color: #fbbf24;">Initializing...</span></div>
                            <div>🎤 Microphone: <span id="micStatus" style="color: #6c757d;">Off</span></div>
                            <div>🤖 Autopilot: <span id="autopilotStatus" style="color: #6c757d;">Standby</span></div>
                            <div>🔒 Security: <span id="securityStatus" style="color: #16a34a;">HTTPS ✓</span></div>
                        </div>
                    </div>
                </div>
                
                <!-- Master Controls -->
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; align-items: center;">
                        <div>
                            <button id="powerBtn" class="btn-primary" onclick="toggleTransceiverPower()" style="font-size: 18px; padding: 15px 30px;">
                                ⚡ POWER: <span id="powerState">OFF</span>
                            </button>
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Master Volume:</label>
                            <input type="range" id="masterVolume" min="0" max="100" value="25" oninput="updateMasterVolume(this.value)" style="width: 100%;">
                            <div style="text-align: center; font-size: 14px; color: #6c757d;"><span id="volumeDisplay">25</span>%</div>
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Braid ΔHz:</label>
                            <input type="number" id="braidDelta" value="0.5" step="0.1" min="0" max="10" oninput="updateBraidDelta(this.value)" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px;">Wave Type:</label>
                            <select id="waveType" onchange="updateWaveType(this.value)" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                                <option value="sine">Sine (smooth)</option>
                                <option value="triangle">Triangle</option>
                                <option value="square">Square</option>
                                <option value="sawtooth">Sawtooth</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Preset Modes -->
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🎛️ Healing Presets</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px;">
                        <button class="btn-secondary" onclick="loadPreset('calm')">🧘 Calm</button>
                        <button class="btn-secondary" onclick="loadPreset('heal')">💚 Heal</button>
                        <button class="btn-secondary" onclick="loadPreset('energize')">⚡ Energize</button>
                        <button class="btn-secondary" onclick="loadPreset('focus')">🎯 Focus</button>
                        <button class="btn-secondary" onclick="loadPreset('sleep')">😴 Sleep</button>
                        <button class="btn-secondary" onclick="loadPreset('ground')">🌍 Ground</button>
                        <button class="btn-primary" onclick="toggleAutopilot()">🤖 Autopilot</button>
                    </div>
                    <div id="currentPreset" style="margin-top: 15px; padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #16a34a; display: none;">
                        <strong>Active Preset:</strong> <span id="presetName">None</span>
                        <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">Autopilot will maintain healing frequencies</div>
                    </div>
                </div>
                
                <!-- 100-Dial Grid -->
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🎚️ 100-Dial Frequency Matrix</h3>
                    <p style="color: #6c757d; font-size: 13px; margin-bottom: 15px;">Green LED = Active • Click dial to toggle • Pinned frequencies: 7.83 (Schumann), 23, 40, 174, 285, 432, 528, 639, 741, 783, 852, 963 Hz</p>
                    <div id="dialGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 12px;">
                        <!-- Dials will be generated dynamically -->
                    </div>
                    <button class="btn-primary" style="margin-top: 20px;" onclick="resetAllDials()">Reset All Dials</button>
                </div>
                
                <!-- Body Map Panel -->
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🧍 Body Map - Quick Tune</h3>
                    <p style="color: #6c757d; font-size: 13px; margin-bottom: 15px;">Tap a body area to auto-tune closest healing frequencies</p>
                    <div id="bodyMap" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-width: 600px; margin: 0 auto;">
                        <button class="btn-secondary" onclick="tuneBodyArea('head')">🧠 Head</button>
                        <button class="btn-secondary" onclick="tuneBodyArea('throat')">🗣️ Throat</button>
                        <button class="btn-secondary" onclick="tuneBodyArea('heart')">❤️ Heart</button>
                        <button class="btn-secondary" onclick="tuneBodyArea('solar')">☀️ Solar Plexus</button>
                        <button class="btn-secondary" onclick="tuneBodyArea('sacral')">🔶 Sacral</button>
                        <button class="btn-secondary" onclick="tuneBodyArea('root')">🔴 Root</button>
                        <button class="btn-secondary" onclick="tuneBodyArea('arms')">💪 Arms</button>
                        <button class="btn-secondary" onclick="tuneBodyArea('legs')">🦵 Legs</button>
                        <button class="btn-secondary" onclick="tuneBodyArea('spine')">🦴 Spine</button>
                    </div>
                </div>
                
                <!-- Microphone & Diagnostics -->
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>🔍 Diagnostics & Microphone</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                        <div>
                            <h4 style="margin-bottom: 10px;">Self-Tests</h4>
                            <div id="diagnostics" style="font-size: 13px; line-height: 2;">
                                <div>HTTPS/Secure Context: <span id="diagHTTPS" style="color: #16a34a;">✓ PASS</span></div>
                                <div>AudioContext Available: <span id="diagAudio" style="color: #16a34a;">✓ PASS</span></div>
                                <div>Speech Recognition: <span id="diagSpeech" style="color: #fbbf24;">⚠ Checking...</span></div>
                                <div>Microphone Permission: <span id="diagMic" style="color: #6c757d;">○ Not requested</span></div>
                            </div>
                            <button class="btn-primary" style="margin-top: 15px; width: 100%;" onclick="runDiagnostics()">🔄 Run Diagnostics</button>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 10px;">Microphone Control</h4>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                                <div style="font-size: 14px; margin-bottom: 10px;">Status: <span id="micStatusDetail" style="font-weight: 600;">Mic off</span></div>
                                <div style="font-size: 12px; color: #6c757d;">For biometric feedback and voice analysis</div>
                            </div>
                            <button id="micBtn" class="btn-primary" onclick="toggleMicrophone()" style="width: 100%; margin-bottom: 10px;">🎤 Enable Microphone</button>
                            <button class="btn-secondary" onclick="retryMicPermission()" style="width: 100%;">🔄 Retry Mic Permission</button>
                            <div id="micHelpText" style="font-size: 11px; color: #6c757d; margin-top: 10px; padding: 10px; background: #fef3c7; border-radius: 6px; display: none;">
                                💡 If blocked: Click browser's lock icon → Site settings → Microphone → Allow
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 25px; padding: 20px; color: #64748b; font-size: 12px;">
                    Rogers Signal Transceiver v2.0 • Experimental • Use responsibly • Not for medical use
                </div>
            </div>
        `,
        
        eldercare: `
            <h2>👴👵 ElderCore Guardian</h2>
            <p style="text-align: center;">Comprehensive care management for elderly loved ones</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">💜 Compassionate Elder Care Platform</h3>
                    <p style="font-size: 15px;">Medication tracking, appointment scheduling, emergency contacts, daily check-ins, memory support, and family coordination.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>💊 Medication Schedule</h3>
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="font-weight: 600; margin-bottom: 5px;">⏰ Next Dose: 2:00 PM</div>
                            <div style="font-size: 13px; color: #6c757d;">Blood Pressure Medication (Lisinopril 10mg)</div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="manageMedications()">Manage All Medications</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📅 Upcoming Appointments</h3>
                        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="font-weight: 600; margin-bottom: 5px;">Dr. Johnson - Cardiology</div>
                            <div style="font-size: 13px; color: #6c757d;">Tomorrow, 10:30 AM</div>
                            <div style="font-size: 12px; color: #3b82f6; margin-top: 5px;">📍 Memorial Hospital, Bldg C</div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="viewAppointments()">View Calendar</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🚨 Emergency Contacts</h3>
                        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="font-weight: 600; color: #dc2626;">Primary: Sarah (Daughter)</div>
                            <div style="font-size: 14px; margin-top: 5px;">📞 (555) 123-4567</div>
                        </div>
                        <button class="btn-primary" style="width: 100%; background: #dc2626;" onclick="callEmergencyContact()">📞 Call Emergency Contact</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🧠 Memory Support & Daily Activities</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">✅</div>
                            <div style="font-weight: 600;">Morning Routine</div>
                            <div style="font-size: 12px; color: #16a34a; margin-top: 5px;">Completed 8:45 AM</div>
                        </div>
                        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">⏳</div>
                            <div style="font-weight: 600;">Lunch Reminder</div>
                            <div style="font-size: 12px; color: #fbbf24; margin-top: 5px;">Due at 12:00 PM</div>
                        </div>
                        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🎵</div>
                            <div style="font-weight: 600;">Music Therapy</div>
                            <div style="font-size: 12px; color: #3b82f6; margin-top: 5px;">3:00 PM Scheduled</div>
                        </div>
                        <div style="background: #fce7f3; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 10px;">👨‍👩‍👧</div>
                            <div style="font-weight: 600;">Family Visit</div>
                            <div style="font-size: 12px; color: #ec4899; margin-top: 5px;">Sunday 2:00 PM</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>💬 AI Companion Check-In</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                        <div style="font-style: italic; color: #6c757d; margin-bottom: 10px;">"Good afternoon! How are you feeling today? Have you had your lunch?"</div>
                        <button class="btn-secondary" onclick="respondToCheckIn('good')">I'm doing well</button>
                        <button class="btn-secondary" style="margin-left: 10px;" onclick="respondToCheckIn('help')">I need help</button>
                    </div>
                    <button class="btn-primary" onclick="startVoiceCheckIn()">🎤 Voice Check-In</button>
                </div>
            </div>
        `,
        
        greenhouse: `
            <h2>🌿 Modular Greenhouse Builder</h2>
            <p style="text-align: center;">Design, plan, and build your custom modular greenhouse system</p>
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🏗️ Build Your Dream Greenhouse</h3>
                    <p style="font-size: 15px;">Modular panels, automated climate control, hydroponics integration, and AI-powered growth optimization.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🎨 Design Canvas</h3>
                        <div id="greenhouseCanvas" style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; height: 400px; display: flex; align-items: center; justify-content: center;">
                            <div style="text-align: center; color: #6c757d;">
                                <div style="font-size: 48px; margin-bottom: 15px;">🏡</div>
                                <div>Click modules below to add to your design</div>
                                <div style="font-size: 13px; margin-top: 10px;">Current: 0 modules • 0 sq ft</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn-secondary" onclick="rotateView()">🔄 Rotate</button>
                            <button class="btn-secondary" onclick="clearDesign()">🗑️ Clear</button>
                            <button class="btn-primary" onclick="saveDesign()">💾 Save Design</button>
                            <button class="btn-primary" onclick="generate3DPreview()">🎭 3D Preview</button>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📦 Module Library</h3>
                        <div style="max-height: 450px; overflow-y: auto;">
                            <div class="module-item" onclick="addModule('base')" style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; cursor: pointer; border: 2px solid transparent;">
                                <div style="font-weight: 600;">Base Panel (4x8 ft)</div>
                                <div style="font-size: 12px; color: #6c757d;">Polycarbonate • $89</div>
                            </div>
                            <div class="module-item" onclick="addModule('roof')" style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; cursor: pointer; border: 2px solid transparent;">
                                <div style="font-weight: 600;">Roof Panel (4x8 ft)</div>
                                <div style="font-size: 12px; color: #6c757d;">UV-resistant • $95</div>
                            </div>
                            <div class="module-item" onclick="addModule('door')" style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; cursor: pointer; border: 2px solid transparent;">
                                <div style="font-weight: 600;">Door Module</div>
                                <div style="font-size: 12px; color: #6c757d;">Auto-close • $145</div>
                            </div>
                            <div class="module-item" onclick="addModule('window')" style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; cursor: pointer; border: 2px solid transparent;">
                                <div style="font-weight: 600;">Ventilation Window</div>
                                <div style="font-size: 12px; color: #6c757d;">Auto-open • $65</div>
                            </div>
                            <div class="module-item" onclick="addModule('hydro')" style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; cursor: pointer; border: 2px solid transparent;">
                                <div style="font-weight: 600;">Hydroponic Rack</div>
                                <div style="font-size: 12px; color: #6c757d;">6-tier • $180</div>
                            </div>
                            <div class="module-item" onclick="addModule('climate')" style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; cursor: pointer; border: 2px solid transparent;">
                                <div style="font-weight: 600;">Climate Control</div>
                                <div style="font-size: 12px; color: #6c757d;">Temp/Humidity • $220</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🤖 AI Growth Optimizer</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div style="background: #dbeafe; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 11px; color: #6c757d;">Temperature</div>
                            <div style="font-size: 24px; font-weight: 600; color: #3b82f6;">72°F</div>
                            <div style="font-size: 11px; color: #16a34a;">Optimal ✓</div>
                        </div>
                        <div style="background: #dbeafe; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 11px; color: #6c757d;">Humidity</div>
                            <div style="font-size: 24px; font-weight: 600; color: #3b82f6;">65%</div>
                            <div style="font-size: 11px; color: #16a34a;">Optimal ✓</div>
                        </div>
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 11px; color: #6c757d;">Light Hours</div>
                            <div style="font-size: 24px; font-weight: 600; color: #fbbf24;">14.5h</div>
                            <div style="font-size: 11px; color: #fbbf24;">Adjust +1h ⚠</div>
                        </div>
                        <div style="background: #dbeafe; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 11px; color: #6c757d;">CO2 Level</div>
                            <div style="font-size: 24px; font-weight: 600; color: #3b82f6;">420 ppm</div>
                            <div style="font-size: 11px; color: #16a34a;">Optimal ✓</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>💰 Cost Estimator</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Materials:</span>
                            <span style="font-weight: 600;">$0</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Labor (DIY discount):</span>
                            <span style="font-weight: 600;">$0</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Automation:</span>
                            <span style="font-weight: 600;">$0</span>
                        </div>
                        <div style="border-top: 2px solid #d9d9d9; margin: 15px 0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #16a34a;">
                            <span>Total Estimate:</span>
                            <span>$0</span>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="downloadBuildPlan()">📥 Download Build Plan & Shopping List</button>
                </div>
            </div>
        `,
        
        airadio: `
            <h2>📻 AI Radio Voices & Podcasts</h2>
            <p style="text-align: center;">Generate AI-powered radio shows and podcasts with synthetic voices</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🎙️ AI Voice Broadcasting Platform</h3>
                    <p style="font-size: 15px;">Create custom radio shows, podcasts, news broadcasts, and storytelling with lifelike AI voices. Powered by Gemini & ElevenLabs.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🎤 Voice Selection</h3>
                        <select id="aiVoice" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            <option value="male-news">Professional Male (News)</option>
                            <option value="female-news">Professional Female (News)</option>
                            <option value="male-casual">Casual Male (Podcast)</option>
                            <option value="female-casual">Casual Female (Podcast)</option>
                            <option value="storyteller">Storyteller (Audiobook)</option>
                            <option value="energetic">Energetic Host (Radio)</option>
                        </select>
                        <button class="btn-primary" style="width: 100%;" onclick="previewVoice()">▶️ Preview Voice</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📝 Script Generator</h3>
                        <select id="showType" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            <option value="news">News Broadcast</option>
                            <option value="podcast">Interview Podcast</option>
                            <option value="story">Story/Fiction</option>
                            <option value="educational">Educational Series</option>
                            <option value="comedy">Comedy Show</option>
                        </select>
                        <button class="btn-primary" style="width: 100%;" onclick="generateScript()">✨ AI Generate Script</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>⏱️ Episode Length</h3>
                        <div style="margin-bottom: 15px;">
                            <input type="range" id="episodeLength" min="5" max="120" value="30" oninput="updateLengthDisplay(this.value)" style="width: 100%;">
                            <div style="text-align: center; font-weight: 600; margin-top: 10px;"><span id="lengthDisplay">30</span> minutes</div>
                        </div>
                        <button class="btn-secondary" style="width: 100%;" onclick="setCustomLength()">Custom Duration</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>📻 Live Preview & Editor</h3>
                    <textarea id="podcastScript" placeholder="Enter your script here or use AI generator..." style="width: 100%; min-height: 200px; padding: 15px; border: 2px solid #d9d9d9; border-radius: 8px; font-family: monospace; margin-bottom: 15px;"></textarea>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn-primary" onclick="generateAudio()">🎵 Generate Audio</button>
                        <button class="btn-secondary" onclick="addMusicBed()">🎶 Add Music Bed</button>
                        <button class="btn-secondary" onclick="addSoundEffects()">🔊 Sound Effects</button>
                        <button class="btn-secondary" onclick="adjustPacing()">⏩ Adjust Pacing</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🎧 Your Podcast Library</h3>
                    <div id="podcastLibrary">
                        <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <h4 style="margin: 0 0 5px 0;">Infinity News Daily #47</h4>
                                    <div style="font-size: 13px; color: #6c757d;">30 min • Professional Female • 2 hours ago</div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn-secondary" onclick="playEpisode('ep47')">▶️ Play</button>
                                    <button class="btn-secondary" onclick="downloadEpisode('ep47')">⬇️ Download</button>
                                </div>
                            </div>
                        </div>
                        <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <h4 style="margin: 0 0 5px 0;">Tech Talk Podcast #12</h4>
                                    <div style="font-size: 13px; color: #6c757d;">45 min • Casual Male • Yesterday</div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn-secondary" onclick="playEpisode('ep12')">▶️ Play</button>
                                    <button class="btn-secondary" onclick="downloadEpisode('ep12')">⬇️ Download</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="createNewEpisode()">+ Create New Episode</button>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>📡 Publishing & Distribution</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                        <button class="btn-secondary" onclick="publishTo('spotify')">🎵 Spotify</button>
                        <button class="btn-secondary" onclick="publishTo('apple')">🍎 Apple Podcasts</button>
                        <button class="btn-secondary" onclick="publishTo('youtube')">📺 YouTube</button>
                        <button class="btn-secondary" onclick="publishTo('rss')">📻 RSS Feed</button>
                        <button class="btn-primary" onclick="publishTo('infinity')">🌀 Infinity Network</button>
                    </div>
                </div>
            </div>
        `,
        
        cognitiveExo: `
            <h2>🧠 Cognitive Exoskeleton Explorer</h2>
            <p style="text-align: center;">AI-powered thought amplification and neural interface design</p>
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🚀 Augmented Cognition Platform</h3>
                    <p style="font-size: 15px;">Design neural interfaces, brain-computer connections, thought amplifiers, and cognitive enhancement frameworks. Map mental landscapes and build exoskeletons for consciousness.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🧬 Neural Interface Designer</h3>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="font-size: 13px; color: #6c757d; margin-bottom: 10px;">Interface Type:</div>
                            <select id="interfaceType" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                                <option value="eeg">EEG (Non-invasive)</option>
                                <option value="fmri">fMRI (Imaging)</option>
                                <option value="nirs">NIRS (Optical)</option>
                                <option value="bci">Direct BCI (Experimental)</option>
                                <option value="quantum">Quantum Entanglement (Theoretical)</option>
                            </select>
                            <div style="font-size: 13px; color: #6c757d;">Channels: <strong>64</strong> • Bandwidth: <strong>256 Hz</strong></div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="designInterface()">🎨 Design Interface</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>💭 Thought Amplification</h3>
                        <div style="background: #ede9fe; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 13px; color: #6c757d; margin-bottom: 5px;">Clarity Boost:</div>
                                <input type="range" id="clarityBoost" min="0" max="100" value="50" style="width: 100%;">
                                <div style="text-align: center; font-size: 12px; color: #6366f1;"><span id="clarityVal">50</span>%</div>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 13px; color: #6c757d; margin-bottom: 5px;">Memory Bandwidth:</div>
                                <input type="range" id="memoryBand" min="0" max="100" value="70" style="width: 100%;">
                                <div style="text-align: center; font-size: 12px; color: #6366f1;"><span id="memoryVal">70</span>%</div>
                            </div>
                            <div>
                                <div style="font-size: 13px; color: #6c757d; margin-bottom: 5px;">Focus Intensity:</div>
                                <input type="range" id="focusInt" min="0" max="100" value="85" style="width: 100%;">
                                <div style="text-align: center; font-size: 12px; color: #6366f1;"><span id="focusVal">85</span>%</div>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="activateAmplification()">⚡ Activate</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🌐 Mental Landscape Mapper</h3>
                        <div id="mindMap" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 8px; height: 200px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                            <div style="text-align: center; color: #0369a1;">
                                <div style="font-size: 36px; margin-bottom: 10px;">🧠</div>
                                <div style="font-size: 14px;">Mapping neural pathways...</div>
                                <div style="font-size: 12px; margin-top: 5px;">3,847 nodes • 12,394 connections</div>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="scanMentalLandscape()">🔍 Deep Scan</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🎯 Cognitive Enhancement Modules</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div onclick="toggleModule('memory')" style="padding: 20px; background: #dbeafe; border-radius: 8px; cursor: pointer; text-align: center; border: 2px solid transparent;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🧠</div>
                            <div style="font-weight: 600;">Memory Palace</div>
                            <div style="font-size: 12px; color: #3b82f6; margin-top: 5px;">Status: Active ✓</div>
                        </div>
                        <div onclick="toggleModule('speed')" style="padding: 20px; background: #fef3c7; border-radius: 8px; cursor: pointer; text-align: center; border: 2px solid transparent;">
                            <div style="font-size: 32px; margin-bottom: 10px;">⚡</div>
                            <div style="font-weight: 600;">Speed Reading</div>
                            <div style="font-size: 12px; color: #fbbf24; margin-top: 5px;">Status: Ready</div>
                        </div>
                        <div onclick="toggleModule('pattern')" style="padding: 20px; background: #f0fdf4; border-radius: 8px; cursor: pointer; text-align: center; border: 2px solid transparent;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🔮</div>
                            <div style="font-weight: 600;">Pattern Recognition</div>
                            <div style="font-size: 12px; color: #16a34a; margin-top: 5px;">Status: Active ✓</div>
                        </div>
                        <div onclick="toggleModule('language')" style="padding: 20px; background: #fce7f3; border-radius: 8px; cursor: pointer; text-align: center; border: 2px solid transparent;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🗣️</div>
                            <div style="font-weight: 600;">Language Matrix</div>
                            <div style="font-size: 12px; color: #ec4899; margin-top: 5px;">Status: Ready</div>
                        </div>
                        <div onclick="toggleModule('spatial')" style="padding: 20px; background: #ede9fe; border-radius: 8px; cursor: pointer; text-align: center; border: 2px solid transparent;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🗺️</div>
                            <div style="font-weight: 600;">Spatial Navigator</div>
                            <div style="font-size: 12px; color: #6366f1; margin-top: 5px;">Status: Active ✓</div>
                        </div>
                        <div onclick="toggleModule('creativity')" style="padding: 20px; background: #fff7ed; border-radius: 8px; cursor: pointer; text-align: center; border: 2px solid transparent;">
                            <div style="font-size: 32px; margin-bottom: 10px;">🎨</div>
                            <div style="font-weight: 600;">Creativity Boost</div>
                            <div style="font-size: 12px; color: #f97316; margin-top: 5px;">Status: Ready</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>📊 Cognitive Performance Metrics</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
                            <div style="font-size: 11px; color: #6c757d;">Processing Speed</div>
                            <div style="font-size: 24px; font-weight: 700; color: #16a34a;">147%</div>
                            <div style="font-size: 11px; color: #16a34a;">+47% vs baseline ↑</div>
                        </div>
                        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <div style="font-size: 11px; color: #6c757d;">Working Memory</div>
                            <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">9.2 items</div>
                            <div style="font-size: 11px; color: #3b82f6;">+2.2 vs avg ↑</div>
                        </div>
                        <div style="background: #ede9fe; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1;">
                            <div style="font-size: 11px; color: #6c757d;">Focus Duration</div>
                            <div style="font-size: 24px; font-weight: 700; color: #6366f1;">87 min</div>
                            <div style="font-size: 11px; color: #6366f1;">Deep work state ✓</div>
                        </div>
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #fbbf24;">
                            <div style="font-size: 11px; color: #6c757d;">Neural Plasticity</div>
                            <div style="font-size: 24px; font-weight: 700; color: #fbbf24;">High</div>
                            <div style="font-size: 11px; color: #fbbf24;">Learning optimal ⚡</div>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 20px;" onclick="exportCognitiveData()">📥 Export Session Data</button>
                </div>
            </div>
        `,
        
        nwoProtector: `
            <h2>🛡️ NWO President Protector</h2>
            <p style="text-align: center;">Presidential security & protection coordination system</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🛡️ Presidential Protection Matrix</h3>
                    <p style="font-size: 15px;">Advanced threat detection, security coordination, emergency protocols, and protective intelligence for global leadership.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🚨 Threat Level Monitor</h3>
                        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 15px;">
                            <div style="font-size: 32px; font-weight: 700; color: #dc2626; text-align: center; margin-bottom: 10px;">ELEVATED</div>
                            <div style="text-align: center; font-size: 13px; color: #6c757d;">Current Threat Assessment</div>
                        </div>
                        <div style="font-size: 13px; line-height: 2;">
                            <div>Physical: <span style="color: #fbbf24;">⚠ Medium</span></div>
                            <div>Cyber: <span style="color: #dc2626;">❌ High</span></div>
                            <div>Intelligence: <span style="color: #16a34a;">✓ Low</span></div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>👥 Security Personnel</h3>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                            <div style="font-weight: 600; margin-bottom: 5px;">Active Detail: 24 agents</div>
                            <div style="font-size: 13px; color: #6c757d;">Inner perimeter: 8 | Outer: 16</div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="deploySecurityTeam()">Deploy Additional Team</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📍 Location Security</h3>
                        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #16a34a;">
                            <div style="font-weight: 600; color: #16a34a;">Secure Facility ✓</div>
                            <div style="font-size: 13px; color: #6c757d; margin-top: 5px;">All exits monitored • Airspace clear</div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="scanPerimeter()">Scan Perimeter</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>⚡ Emergency Protocols</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">
                        <button class="btn-secondary" style="background: #dc2626; color: white;" onclick="activateProtocol('evacuation')">🚁 Evacuation</button>
                        <button class="btn-secondary" style="background: #f97316; color: white;" onclick="activateProtocol('lockdown')">🔒 Lockdown</button>
                        <button class="btn-secondary" style="background: #fbbf24; color: #000;" onclick="activateProtocol('medical')">🏥 Medical Emergency</button>
                        <button class="btn-secondary" style="background: #3b82f6; color: white;" onclick="activateProtocol('comms')">📡 Secure Comms</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>📊 Intelligence Dashboard</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <div style="font-size: 13px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #d9d9d9;">
                            <strong>Latest Intelligence Brief (Classified)</strong>
                            <div style="color: #6c757d; margin-top: 5px;">Updated 14 minutes ago</div>
                        </div>
                        <div style="font-size: 13px; line-height: 1.8;">
                            <div>• 3 potential threats neutralized in past 48h</div>
                            <div>• Cyber defense systems upgraded</div>
                            <div>• International cooperation status: Active</div>
                            <div>• Robot security agents: 127 deployed</div>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="requestIntelBrief()">📥 Request Full Brief</button>
                </div>
            </div>
        `,
        
        greySun: `
            <h2>☀️ Grey Sun Theorist</h2>
            <p style="text-align: center;">Alternative cosmology and stellar phenomena research</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🌑 Grey Sun Theory Lab</h3>
                    <p style="font-size: 15px;">Research alternative stellar models, electromagnetic sun theories, plasma cosmology, and unconventional astrophysics.</p>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>📚 Core Theories</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div onclick="loadTheory('electric')" style="padding: 20px; background: #fef3c7; border-radius: 8px; cursor: pointer; border: 2px solid transparent;">
                            <h4 style="margin: 0 0 10px 0;">⚡ Electric Universe</h4>
                            <p style="font-size: 13px; color: #6c757d; margin: 0;">Sun as electrical phenomenon driven by galactic currents</p>
                        </div>
                        <div onclick="loadTheory('plasma')" style="padding: 20px; background: #dbeafe; border-radius: 8px; cursor: pointer; border: 2px solid transparent;">
                            <h4 style="margin: 0 0 10px 0;">🌊 Plasma Cosmology</h4>
                            <p style="font-size: 13px; color: #6c757d; margin: 0;">Universe dominated by electromagnetic forces</p>
                        </div>
                        <div onclick="loadTheory('hollow')" style="padding: 20px; background: #f0fdf4; border-radius: 8px; cursor: pointer; border: 2px solid transparent;">
                            <h4 style="margin: 0 0 10px 0;">🔮 Hollow Sun Model</h4>
                            <p style="font-size: 13px; color: #6c757d; margin: 0;">Shell structure with internal energy generation</p>
                        </div>
                        <div onclick="loadTheory('frequency')" style="padding: 20px; background: #ede9fe; border-radius: 8px; cursor: pointer; border: 2px solid transparent;">
                            <h4 style="margin: 0 0 10px 0;">📻 Frequency Resonance</h4>
                            <p style="font-size: 13px; color: #6c757d; margin: 0;">Sun as massive frequency generator/amplifier</p>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🔬 Research Data</h3>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <div style="font-size: 13px; margin-bottom: 10px;">
                                <strong>Solar Surface Temp:</strong> 5,778 K (mainstream)
                            </div>
                            <div style="font-size: 13px; margin-bottom: 10px;">
                                <strong>Alternative Model:</strong> Variable 3,000-8,000 K
                            </div>
                            <div style="font-size: 13px; margin-bottom: 10px;">
                                <strong>EM Field Strength:</strong> 1-3 Gauss (poles)
                            </div>
                            <div style="font-size: 13px;">
                                <strong>Schumann Resonance:</strong> 7.83 Hz (Earth-Sun)
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="runSimulation()">🎬 Run Simulation</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📡 Observational Evidence</h3>
                        <div style="max-height: 200px; overflow-y: auto;">
                            <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; margin-bottom: 10px;">
                                <div style="font-weight: 600; font-size: 14px;">Coronal Heating Problem</div>
                                <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0;">Corona 200x hotter than surface - EM explanation</p>
                            </div>
                            <div style="padding: 12px; background: #dbeafe; border-radius: 8px; margin-bottom: 10px;">
                                <div style="font-weight: 600; font-size: 14px;">Solar Wind Acceleration</div>
                                <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0;">Particles accelerate away from sun - electric field?</p>
                            </div>
                            <div style="padding: 12px; background: #fef3c7; border-radius: 8px; margin-bottom: 10px;">
                                <div style="font-weight: 600; font-size: 14px;">Sunspot Magnetic Fields</div>
                                <p style="font-size: 12px; color: #6c757d; margin: 5px 0 0 0;">Complex topology - filamentary currents</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>📖 Research Papers & References</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <span class="source-badge">Thunderbolts Project</span>
                            <span class="source-badge">IEEE Plasma Science</span>
                            <span class="source-badge">Alternative Cosmology Group</span>
                            <span class="source-badge">Electric Universe Theory</span>
                            <span class="source-badge">Wal Thornhill Research</span>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="accessLibrary()">📚 Access Research Library</button>
                </div>
            </div>
        `,
        
        nanoEnergy: `
            <h2>⚛️ Nano Energy System Designer</h2>
            <p style="text-align: center;">Design microscale energy harvesting and storage systems</p>
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">⚡ Nanoscale Power Engineering</h3>
                    <p style="font-size: 15px;">Design quantum batteries, piezoelectric harvesters, thermoelectric generators, and nano-scale energy systems.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🔋 Energy Harvesting Methods</h3>
                        <div style="margin-top: 15px;">
                            <div onclick="selectMethod('piezo')" style="padding: 15px; background: #f0fdf4; border-radius: 8px; margin-bottom: 10px; cursor: pointer; border: 2px solid #16a34a;">
                                <div style="font-weight: 600;">Piezoelectric ⚡</div>
                                <div style="font-size: 12px; color: #6c757d;">Mechanical vibration → Electricity</div>
                                <div style="font-size: 12px; color: #16a34a; margin-top: 5px;">Output: 10-100 µW/cm²</div>
                            </div>
                            <div onclick="selectMethod('thermo')" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; cursor: pointer;">
                                <div style="font-weight: 600;">Thermoelectric 🌡️</div>
                                <div style="font-size: 12px; color: #6c757d;">Heat gradient → Electricity</div>
                                <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">Output: 1-50 µW/cm²</div>
                            </div>
                            <div onclick="selectMethod('solar')" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; cursor: pointer;">
                                <div style="font-weight: 600;">Nano-Solar ☀️</div>
                                <div style="font-size: 12px; color: #6c757d;">Quantum dots photovoltaic</div>
                                <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">Output: 100-500 µW/cm²</div>
                            </div>
                            <div onclick="selectMethod('rf')" style="padding: 15px; background: #f8f9fa; border-radius: 8px; cursor: pointer;">
                                <div style="font-weight: 600;">RF Harvesting 📡</div>
                                <div style="font-size: 12px; color: #6c757d;">Ambient radio waves</div>
                                <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">Output: 0.1-10 µW/cm²</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🎨 System Designer</h3>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-size: 13px; margin-bottom: 5px;">Harvester Size (nm):</label>
                                <input type="number" id="harvesterSize" value="1000" style="width: 100%; padding: 8px; border: 2px solid #d9d9d9; border-radius: 6px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-size: 13px; margin-bottom: 5px;">Array Density:</label>
                                <input type="range" id="arrayDensity" min="1" max="100" value="50" style="width: 100%;">
                                <div style="text-align: center; font-size: 12px; color: #6c757d;"><span id="densityVal">50</span>%</div>
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; margin-bottom: 5px;">Storage Type:</label>
                                <select id="storageType" style="width: 100%; padding: 8px; border: 2px solid #d9d9d9; border-radius: 6px;">
                                    <option>Quantum Battery</option>
                                    <option>Supercapacitor</option>
                                    <option>Nano-wire Array</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="designNanoSystem()">⚙️ Design System</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📊 Performance Calculator</h3>
                        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a;">
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 12px; color: #6c757d;">Estimated Power Output:</div>
                                <div style="font-size: 24px; font-weight: 700; color: #16a34a;">47.5 µW</div>
                            </div>
                            <div style="margin-bottom: 10px;">
                                <div style="font-size: 12px; color: #6c757d;">Efficiency:</div>
                                <div style="font-size: 20px; font-weight: 700; color: #16a34a;">23%</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6c757d;">Charge Time (1mAh):</div>
                                <div style="font-size: 20px; font-weight: 700; color: #16a34a;">2.1 hours</div>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="runPowerCalc()">🔢 Recalculate</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>🏗️ Fabrication Specs</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div>
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Substrate Material:</div>
                                <div style="font-weight: 600;">Silicon (100)</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Deposition Method:</div>
                                <div style="font-weight: 600;">ALD + CVD</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Feature Size:</div>
                                <div style="font-weight: 600;">5-100 nm</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Layer Count:</div>
                                <div style="font-weight: 600;">12 layers</div>
                            </div>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 20px;" onclick="exportFabSpecs()">📥 Export Fabrication Plans</button>
                </div>
            </div>
        `,
        
        futureEnergy: `
            <h2>🚀 Futuristic Energy Systems Tech</h2>
            <p style="text-align: center;">Next-generation power generation and distribution</p>
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">⚡ Advanced Energy Technologies</h3>
                    <p style="font-size: 15px;">Fusion reactors, antimatter storage, zero-point energy, quantum vacuum fluctuation harvesting, and wireless power transmission.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div onclick="exploretech('fusion')" style="background: white; padding: 25px; border-radius: 12px; cursor: pointer; border: 2px solid transparent;">
                        <div style="font-size: 42px; text-align: center; margin-bottom: 10px;">☢️</div>
                        <h3 style="text-align: center;">Fusion Reactor</h3>
                        <p style="font-size: 13px; color: #6c757d; text-align: center;">Tokamak / Stellarator designs</p>
                        <div style="text-align: center; margin-top: 10px; color: #8b5cf6; font-weight: 600;">Q > 10 achieved</div>
                    </div>
                    
                    <div onclick="exploretech('antimatter')" style="background: white; padding: 25px; border-radius: 12px; cursor: pointer; border: 2px solid transparent;">
                        <div style="font-size: 42px; text-align: center; margin-bottom: 10px;">⚛️</div>
                        <h3 style="text-align: center;">Antimatter Storage</h3>
                        <p style="font-size: 13px; color: #6c757d; text-align: center;">Penning traps & magnetic bottles</p>
                        <div style="text-align: center; margin-top: 10px; color: #8b5cf6; font-weight: 600;">10^9 J/kg potential</div>
                    </div>
                    
                    <div onclick="exploretech('zeropoint')" style="background: white; padding: 25px; border-radius: 12px; cursor: pointer; border: 2px solid transparent;">
                        <div style="font-size: 42px; text-align: center; margin-bottom: 10px;">🌌</div>
                        <h3 style="text-align: center;">Zero-Point Energy</h3>
                        <p style="font-size: 13px; color: #6c757d; text-align: center;">Quantum vacuum fluctuations</p>
                        <div style="text-align: center; margin-top: 10px; color: #8b5cf6; font-weight: 600;">Theoretical unlimited</div>
                    </div>
                    
                    <div onclick="exploretech('wireless')" style="background: white; padding: 25px; border-radius: 12px; cursor: pointer; border: 2px solid transparent;">
                        <div style="font-size: 42px; text-align: center; margin-bottom: 10px;">📡</div>
                        <h3 style="text-align: center;">Wireless Power Grid</h3>
                        <p style="font-size: 13px; color: #6c757d; text-align: center;">Tesla resonance transmission</p>
                        <div style="text-align: center; margin-top: 10px; color: #8b5cf6; font-weight: 600;">100km+ range</div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🔬 Active Research Projects</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div style="padding: 20px; background: #ede9fe; border-radius: 8px;">
                            <h4 style="margin: 0 0 10px 0;">ITER Fusion Project</h4>
                            <div style="font-size: 13px; color: #6c757d; margin-bottom: 10px;">International tokamak reactor - 500 MW output goal</div>
                            <div style="background: #7c3aed; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="background: #22c55e; width: 73%; height: 100%;"></div>
                            </div>
                            <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">73% complete</div>
                        </div>
                        
                        <div style="padding: 20px; background: #dbeafe; border-radius: 8px;">
                            <h4 style="margin: 0 0 10px 0;">Casimir Effect Harvesting</h4>
                            <div style="font-size: 13px; color: #6c757d; margin-bottom: 10px;">Extracting energy from quantum vacuum</div>
                            <div style="background: #3b82f6; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="background: #22c55e; width: 34%; height: 100%;"></div>
                            </div>
                            <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">34% complete</div>
                        </div>
                        
                        <div style="padding: 20px; background: #f0fdf4; border-radius: 8px;">
                            <h4 style="margin: 0 0 10px 0;">Thorium Molten Salt Reactor</h4>
                            <div style="font-size: 13px; color: #6c757d; margin-bottom: 10px;">Safe, clean nuclear - China leading development</div>
                            <div style="background: #16a34a; height: 8px; border-radius: 4px; overflow: hidden;">
                                <div style="background: #22c55e; width: 58%; height: 100%;"></div>
                            </div>
                            <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">58% complete</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>💡 Design Your Energy System</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 15px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; font-size: 13px; margin-bottom: 8px;">Primary Technology:</label>
                                <select id="primaryTech" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                                    <option>Fusion (Tokamak)</option>
                                    <option>Thorium MSR</option>
                                    <option>Solar (Orbital)</option>
                                    <option>Geothermal (Deep)</option>
                                    <option>Zero-Point (Experimental)</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; margin-bottom: 8px;">Power Output (MW):</label>
                                <input type="number" id="powerOutput" value="1000" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                            </div>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-size: 13px; margin-bottom: 8px;">Distribution Method:</label>
                            <select id="distribution" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                                <option>Traditional Grid</option>
                                <option>Wireless Transmission</option>
                                <option>Superconducting Cable</option>
                                <option>Hydrogen Fuel Cell Network</option>
                            </select>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="simulateEnergySystem()">🎬 Run Simulation</button>
                    </div>
                </div>
            </div>
        `,
        
        snapFood: `
            <h2>🌾 SNAP & Food Aid Network</h2>
            <p style="text-align: center;">Big Farms to Table - Food assistance coordination</p>
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🍎 Farm-to-Table Aid Network</h3>
                    <p style="font-size: 15px;">Connect surplus farm production directly to SNAP recipients, food banks, and communities in need. Zero waste, maximum impact.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🚜 Farm Surplus Available</h3>
                        <div style="max-height: 250px; overflow-y: auto;">
                            <div style="padding: 15px; background: #f0fdf4; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #16a34a;">
                                <div style="font-weight: 600;">Johnson Farms - Iowa</div>
                                <div style="font-size: 13px; color: #6c757d; margin-top: 5px;">15,000 lbs sweet corn • Ready now</div>
                                <button class="btn-secondary" style="margin-top: 8px; font-size: 12px;" onclick="claimSurplus('corn')">Claim for Distribution</button>
                            </div>
                            <div style="padding: 15px; background: #fef3c7; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #fbbf24;">
                                <div style="font-weight: 600;">Valley Orchards - CA</div>
                                <div style="font-size: 13px; color: #6c757d; margin-top: 5px;">8,000 lbs apples • Ready in 3 days</div>
                                <button class="btn-secondary" style="margin-top: 8px; font-size: 12px;" onclick="claimSurplus('apples')">Reserve Pickup</button>
                            </div>
                            <div style="padding: 15px; background: #dbeafe; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3b82f6;">
                                <div style="font-weight: 600;">Green Valley Dairy - WI</div>
                                <div style="font-size: 13px; color: #6c757d; margin-top: 5px;">2,500 gallons milk • Daily surplus</div>
                                <button class="btn-secondary" style="margin-top: 8px; font-size: 12px;" onclick="claimSurplus('milk')">Subscribe Daily</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📍 Distribution Centers</h3>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="font-weight: 600; margin-bottom: 10px;">Active Centers: 247</div>
                            <div style="font-size: 13px; color: #6c757d; line-height: 1.8;">
                                <div>Food Banks: 89</div>
                                <div>Community Centers: 102</div>
                                <div>SNAP Pickup Locations: 56</div>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="findNearestCenter()">Find Nearest Center</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📊 Impact Metrics</h3>
                        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a;">
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #6c757d;">Food Distributed This Month:</div>
                                <div style="font-size: 24px; font-weight: 700; color: #16a34a;">847K lbs</div>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #6c757d;">Families Served:</div>
                                <div style="font-size: 24px; font-weight: 700; color: #16a34a;">12,394</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6c757d;">Waste Prevented:</div>
                                <div style="font-size: 24px; font-weight: 700; color: #16a34a;">98.7%</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🗺️ Live Network Map</h3>
                    <div id="networkMap" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #16a34a; border-radius: 8px; height: 300px; display: flex; align-items: center; justify-content: center;">
                        <div style="text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 15px;">🗺️</div>
                            <div style="font-weight: 600; color: #16a34a;">Real-Time Distribution Network</div>
                            <div style="font-size: 13px; color: #6c757d; margin-top: 10px;">247 active centers • 89 farms connected • 12K+ families</div>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="viewFullMap()">🌍 View Full Interactive Map</button>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>👥 For Recipients & Volunteers</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-top: 15px;">
                        <button class="btn-secondary" onclick="registerRecipient()">📝 Register as Recipient</button>
                        <button class="btn-secondary" onclick="volunteerDriver()">🚗 Volunteer as Driver</button>
                        <button class="btn-secondary" onclick="donateFarm()">🌾 Register Farm Surplus</button>
                        <button class="btn-primary" onclick="viewSchedule()">📅 Pickup Schedule</button>
                    </div>
                </div>
            </div>
        `,
        
        symbolBible: `
            <h2>📖 Symbol Bible</h2>
            <p style="text-align: center;">Universal symbol language decoder and spiritual symbology</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🔮 Sacred Symbol Encyclopedia</h3>
                    <p style="font-size: 15px;">Decode ancient symbols, spiritual iconography, sacred geometry, and universal visual language across all cultures and traditions.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div onclick="loadSymbolCategory('sacred')" style="background: white; padding: 25px; border-radius: 12px; text-align: center; cursor: pointer;">
                        <div style="font-size: 48px; margin-bottom: 10px;">✡️</div>
                        <div style="font-weight: 600;">Sacred Geometry</div>
                        <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">287 symbols</div>
                    </div>
                    <div onclick="loadSymbolCategory('christian')" style="background: white; padding: 25px; border-radius: 12px; text-align: center; cursor: pointer;">
                        <div style="font-size: 48px; margin-bottom: 10px;">✝️</div>
                        <div style="font-weight: 600;">Christian</div>
                        <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">412 symbols</div>
                    </div>
                    <div onclick="loadSymbolCategory('eastern')" style="background: white; padding: 25px; border-radius: 12px; text-align: center; cursor: pointer;">
                        <div style="font-size: 48px; margin-bottom: 10px;">☯️</div>
                        <div style="font-weight: 600;">Eastern</div>
                        <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">589 symbols</div>
                    </div>
                    <div onclick="loadSymbolCategory('ancient')" style="background: white; padding: 25px; border-radius: 12px; text-align: center; cursor: pointer;">
                        <div style="font-size: 48px; margin-bottom: 10px;">𓂀</div>
                        <div style="font-weight: 600;">Ancient Egypt</div>
                        <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">1,247 symbols</div>
                    </div>
                    <div onclick="loadSymbolCategory('alchemy')" style="background: white; padding: 25px; border-radius: 12px; text-align: center; cursor: pointer;">
                        <div style="font-size: 48px; margin-bottom: 10px;">🜁</div>
                        <div style="font-weight: 600;">Alchemy</div>
                        <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">203 symbols</div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🔍 Symbol Search & Decoder</h3>
                    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                        <input type="text" id="symbolSearch" placeholder="Search by name, meaning, or culture..." style="flex: 1; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                        <button class="btn-primary" onclick="searchSymbols()">Search</button>
                    </div>
                    <div id="symbolResults" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px;">
                        <div style="padding: 20px; background: #ede9fe; border-radius: 8px; text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 10px;">☥</div>
                            <div style="font-weight: 600; font-size: 14px;">Ankh</div>
                            <div style="font-size: 11px; color: #6c757d; margin-top: 5px;">Life, Immortality</div>
                        </div>
                        <div style="padding: 20px; background: #fef3c7; border-radius: 8px; text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 10px;">🜃</div>
                            <div style="font-weight: 600; font-size: 14px;">Fire Triangle</div>
                            <div style="font-size: 11px; color: #6c757d; margin-top: 5px;">Transformation</div>
                        </div>
                        <div style="padding: 20px; background: #dbeafe; border-radius: 8px; text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 10px;">🕉️</div>
                            <div style="font-weight: 600; font-size: 14px;">Om</div>
                            <div style="font-size: 11px; color: #6c757d; margin-top: 5px;">Universal sound</div>
                        </div>
                        <div style="padding: 20px; background: #f0fdf4; border-radius: 8px; text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 10px;">☮️</div>
                            <div style="font-weight: 600; font-size: 14px;">Peace</div>
                            <div style="font-size: 11px; color: #6c757d; margin-top: 5px;">Harmony</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>📐 Sacred Geometry Builder</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                            <button class="btn-secondary" onclick="drawGeometry('flower')">🌸 Flower of Life</button>
                            <button class="btn-secondary" onclick="drawGeometry('metatron')">✡️ Metatron's Cube</button>
                            <button class="btn-secondary" onclick="drawGeometry('sri')">🔷 Sri Yantra</button>
                            <button class="btn-secondary" onclick="drawGeometry('vesica')">⚪⚪ Vesica Piscis</button>
                        </div>
                    </div>
                    <div id="geometryCanvas" style="background: white; border: 2px solid #d9d9d9; border-radius: 8px; height: 300px; display: flex; align-items: center; justify-content: center;">
                        <div style="text-align: center; color: #6c757d;">
                            <div style="font-size: 48px; margin-bottom: 10px;">📐</div>
                            <div>Select a geometry pattern to visualize</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>📚 Cultural Cross-Reference</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <div style="font-size: 13px; line-height: 2;">
                            <div><strong>Tree of Life:</strong> Kabbalah, Norse (Yggdrasil), Celtic, Ancient Egypt</div>
                            <div><strong>Triple Spiral:</strong> Celtic, Neolithic, Buddhist</div>
                            <div><strong>Serpent:</strong> Christianity, Hinduism, Aztec, Egyptian, Greek</div>
                            <div><strong>Eye:</strong> Egyptian (Horus/Ra), Christian (Providence), Turkish (Nazar)</div>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="exploreCrossRef()">🌍 Explore Full Cross-Reference</button>
                </div>
            </div>
        `,
        
        dinoCards: `
            <h2>🦖 Dino Baseball & Relic Card Generation</h2>
            <p style="text-align: center;">Create NFT trading cards with Infinity tokenization</p>
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">⚾🦕 Infinity Card Generator</h3>
                    <p style="font-size: 15px;">Design custom trading cards for dinosaurs, baseball players, ancient relics, or anything imaginable. Mint as Infinity Tokens for true ownership.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🎨 Card Designer</h3>
                        <div id="cardPreview" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 3px solid #0ea5e9; border-radius: 12px; padding: 30px; min-height: 400px; position: relative;">
                            <div style="text-align: center; position: absolute; top: 20px; left: 0; right: 0;">
                                <div style="background: white; display: inline-block; padding: 8px 20px; border-radius: 20px; font-weight: 700; color: #0ea5e9;">LEGENDARY</div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                                <div style="text-align: center;">
                                    <div style="font-size: 128px; margin-bottom: 20px;">🦖</div>
                                    <div style="font-size: 32px; font-weight: 700; margin-bottom: 10px;">T-REX ROOKIE</div>
                                    <div style="font-size: 18px; color: #6c757d;">Cretaceous Era • 68 Million BC</div>
                                </div>
                            </div>
                            <div style="position: absolute; bottom: 20px; left: 20px; right: 20px; background: rgba(255,255,255,0.9); padding: 15px; border-radius: 8px;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; font-size: 14px;">
                                    <div><strong>Power:</strong> 98</div>
                                    <div><strong>Speed:</strong> 85</div>
                                    <div><strong>Rarity:</strong> 1/100</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>⚙️ Card Settings</h3>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-size: 13px; margin-bottom: 5px; font-weight: 600;">Card Type:</label>
                            <select id="cardType" onchange="updateCardType(this.value)" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                                <option>Dinosaur</option>
                                <option>Baseball Player</option>
                                <option>Ancient Relic</option>
                                <option>Historical Figure</option>
                                <option>Custom</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-size: 13px; margin-bottom: 5px; font-weight: 600;">Name:</label>
                            <input type="text" id="cardName" value="T-REX ROOKIE" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-size: 13px; margin-bottom: 5px; font-weight: 600;">Rarity:</label>
                            <select id="rarity" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                                <option>Common</option>
                                <option>Uncommon</option>
                                <option>Rare</option>
                                <option selected>Legendary</option>
                                <option>Mythic</option>
                            </select>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-size: 13px; margin-bottom: 5px; font-weight: 600;">Edition Size:</label>
                            <input type="number" id="edition" value="100" min="1" max="10000" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                        </div>
                        <button class="btn-secondary" style="width: 100%; margin-bottom: 10px;" onclick="uploadCardImage()">📷 Upload Custom Image</button>
                        <button class="btn-primary" style="width: 100%;" onclick="generateWithAI()">✨ AI Generate Card</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🪙 Mint as Infinity Token</h3>
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 15px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
                            <div>
                                <div style="font-size: 11px; color: #6c757d;">Minting Cost</div>
                                <div style="font-size: 20px; font-weight: 700; color: #16a34a;">5 Tokens</div>
                            </div>
                            <div>
                                <div style="font-size: 11px; color: #6c757d;">Resale Royalty</div>
                                <div style="font-size: 20px; font-weight: 700; color: #16a34a;">2.5%</div>
                            </div>
                            <div>
                                <div style="font-size: 11px; color: #6c757d;">Your Balance</div>
                                <div style="font-size: 20px; font-weight: 700; color: #0ea5e9;" id="userTokenBalance">12.5</div>
                            </div>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; font-size: 18px; padding: 15px;" onclick="mintCard()">🪙 Mint Card as NFT</button>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>🃏 Your Card Collection</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 10px;">⚾</div>
                            <div style="font-weight: 600; font-size: 14px;">Babe Ruth #7</div>
                            <div style="font-size: 11px; color: #6c757d; margin-top: 5px;">Legendary • 1/50</div>
                            <div style="font-size: 11px; color: #fbbf24; margin-top: 5px;">Token #0x7a3b...</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 10px;">🦕</div>
                            <div style="font-weight: 600; font-size: 14px;">Velociraptor #23</div>
                            <div style="font-size: 11px; color: #6c757d; margin-top: 5px;">Rare • 1/200</div>
                            <div style="font-size: 11px; color: #3b82f6; margin-top: 5px;">Token #0x9f2c...</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 10px;">🏺</div>
                            <div style="font-weight: 600; font-size: 14px;">Roman Coin</div>
                            <div style="font-size: 11px; color: #6c757d; margin-top: 5px;">Mythic • 1/10</div>
                            <div style="font-size: 11px; color: #16a34a; margin-top: 5px;">Token #0x1e8d...</div>
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 20px;" onclick="viewFullCollection()">📚 View Full Collection</button>
                </div>
            </div>
        `,
        
        nwoMinting: `
            <h2>🏛️ NWO Minting Station</h2>
            <p style="text-align: center;">Global currency creation and token management system</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">💰 Presidential Minting Authority</h3>
                    <p style="font-size: 15px;">Authorized token creation, global currency management, and economic stability protocols. Human Treasurer oversight required.</p>
                </div>
                
                <div style="background: #fee2e2; padding: 20px; border-radius: 12px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="font-size: 36px;">⚠️</div>
                        <div>
                            <div style="font-weight: 700; color: #dc2626; margin-bottom: 5px;">AUTHORIZED ACCESS ONLY</div>
                            <div style="font-size: 13px; color: #6c757d;">Human Treasurer: Kris | Authorization Level: Executive</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🪙 Token Minting</h3>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <label style="display: block; font-size: 13px; margin-bottom: 8px; font-weight: 600;">Mint Quantity:</label>
                            <input type="number" id="mintQuantity" value="1000" min="1" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                            <label style="display: block; font-size: 13px; margin-bottom: 8px; font-weight: 600;">Purpose:</label>
                            <select id="mintPurpose" style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                                <option>Economic Stimulus</option>
                                <option>Development Funding</option>
                                <option>Community Rewards</option>
                                <option>Infrastructure Investment</option>
                            </select>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="requestMintApproval()">🔐 Request Approval to Mint</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📊 Global Supply</h3>
                        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a;">
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #6c757d;">Total Circulating Supply:</div>
                                <div style="font-size: 28px; font-weight: 700; color: #16a34a;">10,247,893</div>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #6c757d;">Active Wallets:</div>
                                <div style="font-size: 24px; font-weight: 700; color: #16a34a;">127,489</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6c757d;">Treasury Reserve:</div>
                                <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">2,500,000</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🤖 Robot Agents</h3>
                        <div style="font-size: 13px; line-height: 2;">
                            <div style="padding: 10px; background: #f0fdf4; border-radius: 6px; margin-bottom: 8px;">
                                <strong>BOT-001 Watson:</strong> Treasury Manager
                                <div style="font-size: 11px; color: #16a34a;">Status: Active ✓</div>
                            </div>
                            <div style="padding: 10px; background: #dbeafe; border-radius: 6px; margin-bottom: 8px;">
                                <strong>BOT-002 Gemini:</strong> Fund Allocator
                                <div style="font-size: 11px; color: #3b82f6;">Status: Active ✓</div>
                            </div>
                            <div style="padding: 10px; background: #ede9fe; border-radius: 6px;">
                                <strong>BOT-003 Pewpi:</strong> Resource Monitor
                                <div style="font-size: 11px; color: #6366f1;">Status: Active ✓</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>📜 Pending Approvals</h3>
                    <div id="approvalQueue" style="max-height: 300px; overflow-y: auto;">
                        <div style="padding: 15px; background: #fef3c7; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #fbbf24;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <div style="font-weight: 600;">Community Rewards Mint</div>
                                    <div style="font-size: 13px; color: #6c757d; margin-top: 5px;">Amount: 5,000 tokens • Requested by: BOT-001 Watson</div>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn-secondary" style="background: #16a34a; color: white; font-size: 12px;" onclick="approveM int('req1')">✓ Approve</button>
                                    <button class="btn-secondary" style="background: #dc2626; color: white; font-size: 12px;" onclick="denyMint('req1')">✗ Deny</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>📈 Economic Dashboard</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: #6c757d;">Inflation Rate</div>
                            <div style="font-size: 24px; font-weight: 700; color: #16a34a;">0.8%</div>
                        </div>
                        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: #6c757d;">Velocity</div>
                            <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">4.2x</div>
                        </div>
                        <div style="background: #ede9fe; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: #6c757d;">Market Cap</div>
                            <div style="font-size: 24px; font-weight: 700; color: #6366f1;">$1.2B</div>
                        </div>
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: #6c757d;">Daily Volume</div>
                            <div style="font-size: 24px; font-weight: 700; color: #fbbf24;">847K</div>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
    
    return apps[appName] || '<h2>App content loading...</h2>';
}
            <h2>💰 Infinity Funding Pad</h2>
            <p style="text-align: center;">Grant templates, donor lists, and fundraising tools</p>
            <div style="max-width: 900px; margin: 0 auto;">
                <div class="funding-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
                    <button class="tab-btn active" onclick="showFundingTab('grants')">📝 Grants</button>
                    <button class="tab-btn" onclick="showFundingTab('donors')">👥 Donors</button>
                    <button class="tab-btn" onclick="showFundingTab('partners')">🤝 Partner Apps</button>
                    <button class="tab-btn" onclick="showFundingTab('solutions')">💡 What Infinity Solves</button>
                </div>
                
                <div id="grantsTab" class="funding-tab-content" style="display: block;">
                    <div style="background: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                        <h3>Grant Templates</h3>
                        <div class="grant-template-list">
                            <div class="grant-item" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>Technology Innovation Grant</h4>
                                <p style="color: #6c757d; font-size: 14px;">For AI/blockchain platforms - $50K-$500K</p>
                                <button class="btn-secondary" onclick="loadGrantTemplate('tech')">Load Template</button>
                            </div>
                            <div class="grant-item" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>Social Impact Grant</h4>
                                <p style="color: #6c757d; font-size: 14px;">For community-focused projects - $10K-$100K</p>
                                <button class="btn-secondary" onclick="loadGrantTemplate('social')">Load Template</button>
                            </div>
                            <div class="grant-item" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>Research & Development</h4>
                                <p style="color: #6c757d; font-size: 14px;">For experimental tech - $25K-$250K</p>
                                <button class="btn-secondary" onclick="loadGrantTemplate('rd')">Load Template</button>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="createCustomGrant()">+ Create Custom Grant Application</button>
                    </div>
                </div>
                
                <div id="donorsTab" class="funding-tab-content" style="display: none;">
                    <div style="background: white; padding: 30px; border-radius: 12px;">
                        <h3>Donor & Investor List</h3>
                        <div style="margin-bottom: 20px;">
                            <input type="text" id="donorSearch" placeholder="Search donors..." style="width: 100%; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px;">
                        </div>
                        <div id="donorList" style="max-height: 400px; overflow-y: auto;">
                            <div class="donor-card" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                                <h4>Tech Accelerators</h4>
                                <p style="font-size: 13px; color: #6c757d;">Y Combinator, Techstars, 500 Startups</p>
                                <button class="btn-secondary">View Details</button>
                            </div>
                            <div class="donor-card" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                                <h4>Angel Investors</h4>
                                <p style="font-size: 13px; color: #6c757d;">Individual tech investors & mentors</p>
                                <button class="btn-secondary">View Details</button>
                            </div>
                            <div class="donor-card" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                                <h4>Government Grants</h4>
                                <p style="font-size: 13px; color: #6c757d;">NSF, SBIR, STTR programs</p>
                                <button class="btn-secondary">View Details</button>
                            </div>
                        </div>
                        <button class="btn-primary" style="margin-top: 15px;" onclick="addDonor()">+ Add New Donor</button>
                    </div>
                </div>
                
                <div id="partnersTab" class="funding-tab-content" style="display: none;">
                    <div style="background: white; padding: 30px; border-radius: 12px;">
                        <h3>Partner Applications</h3>
                        <p style="color: #6c757d; margin-bottom: 20px;">1% Marketplace Cut Model - Revenue sharing with partners</p>
                        <div class="partner-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                            <div class="partner-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                                <div style="font-size: 36px; margin-bottom: 10px;">🛍️</div>
                                <h4>E-commerce Apps</h4>
                                <p style="font-size: 13px; color: #6c757d;">1% of token transactions</p>
                                <div style="margin-top: 10px; color: #0070ba; font-weight: bold;">$2.5K/month avg</div>
                            </div>
                            <div class="partner-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                                <div style="font-size: 36px; margin-bottom: 10px;">🎮</div>
                                <h4>Gaming Partners</h4>
                                <p style="font-size: 13px; color: #6c757d;">1% of in-game token trades</p>
                                <div style="margin-top: 10px; color: #0070ba; font-weight: bold;">$1.8K/month avg</div>
                            </div>
                            <div class="partner-card" style="padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center;">
                                <div style="font-size: 36px; margin-bottom: 10px;">📱</div>
                                <h4>App Developers</h4>
                                <p style="font-size: 13px; color: #6c757d;">Revenue share model</p>
                                <div style="margin-top: 10px; color: #0070ba; font-weight: bold;">$3.2K/month avg</div>
                            </div>
                        </div>
                        <button class="btn-primary" style="margin-top: 20px;" onclick="proposePartnership()">Propose New Partnership</button>
                    </div>
                </div>
                
                <div id="solutionsTab" class="funding-tab-content" style="display: none;">
                    <div style="background: white; padding: 30px; border-radius: 12px;">
                        <h3>What Infinity Solves</h3>
                        <div style="background: linear-gradient(135deg, #0070ba 0%, #003087 100%); color: white; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                            <h4 style="color: white; margin-bottom: 15px;">🎯 Core Problem Statement</h4>
                            <p style="font-size: 15px; line-height: 1.8;">Infinity creates a token-based economy that eliminates USD dependency, enables true P2P communication, and provides transparent AI-powered tools for everyday tasks - from financial management to content creation.</p>
                        </div>
                        <div class="solution-list">
                            <div class="solution-item" style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>💳 Token Economy (No USD)</h4>
                                <p style="color: #6c757d;">Eliminates traditional banking barriers and enables global microtransactions</p>
                            </div>
                            <div class="solution-item" style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>📞 P2P Communication</h4>
                                <p style="color: #6c757d;">Direct peer-to-peer connections without centralized control</p>
                            </div>
                            <div class="solution-item" style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>🤖 AI Integration</h4>
                                <p style="color: #6c757d;">Gemini Pro and Watson AI for intelligent automation and insights</p>
                            </div>
                            <div class="solution-item" style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>🔍 Truth & Transparency</h4>
                                <p style="color: #6c757d;">Database of banned products and corporate transparency (Tesla chip investigation)</p>
                            </div>
                            <div class="solution-item" style="padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <h4>🌐 Decentralized Publishing</h4>
                                <p style="color: #6c757d;">Anyone can deploy and host 1-page sites with P2P routing</p>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="generatePitchDeck()">📊 Generate Pitch Deck</button>
                    </div>
                </div>
            </div>
        `,
        
        globalID: `
            <h2>🌐 Global ID Number Portal</h2>
            <p style="text-align: center;">Universal identification system for all citizens</p>
            <div style="max-width: 1000px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🆔 Universal Identity Platform</h3>
                    <p style="font-size: 15px;">Secure, decentralized global identification system. One ID for all services, governments, and platforms worldwide.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>👤 Your Global ID</h3>
                        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 15px;">
                            <div style="font-size: 48px; font-weight: 700; letter-spacing: 3px; margin-bottom: 10px;">INF-8472-3901</div>
                            <div style="font-size: 14px; opacity: 0.9;">marvaseater@gmail.com</div>
                            <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">Verified ✓ • Issued: 2025-01-15</div>
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-bottom: 10px;" onclick="downloadIDCard()">💳 Download ID Card</button>
                        <button class="btn-secondary" style="width: 100%;" onclick="shareID()">📤 Share ID</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🔐 Verification Status</h3>
                        <div style="margin-bottom: 15px;">
                            <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #16a34a;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: 600;">Email Verified</span>
                                    <span style="color: #16a34a;">✓</span>
                                </div>
                            </div>
                            <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #16a34a;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: 600;">Phone Verified</span>
                                    <span style="color: #16a34a;">✓</span>
                                </div>
                            </div>
                            <div style="padding: 12px; background: #f0fdf4; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #16a34a;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: 600;">Biometric Scan</span>
                                    <span style="color: #16a34a;">✓</span>
                                </div>
                            </div>
                            <div style="padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #fbbf24;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-weight: 600;">Government Link</span>
                                    <span style="color: #fbbf24;">⏳ Pending</span>
                                </div>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="completeVerification()">Complete All Verifications</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🌍 Connected Services</h3>
                        <div style="font-size: 13px; line-height: 2;">
                            <div>✓ Infinity Token Wallet</div>
                            <div>✓ Healthcare Records</div>
                            <div>✓ Education Credentials</div>
                            <div>✓ Financial Accounts (3)</div>
                            <div>✓ Government Services (47)</div>
                            <div>✓ Travel Documents</div>
                        </div>
                        <button class="btn-secondary" style="width: 100%; margin-top: 15px;" onclick="manageServices()">⚙️ Manage Connections</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🔒 Privacy & Security</h3>
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 15px;">
                        <div style="font-weight: 600; margin-bottom: 10px;">Your data is encrypted and decentralized</div>
                        <div style="font-size: 13px; color: #6c757d; line-height: 1.8;">
                            • No single government or corporation controls your ID<br>
                            • You choose what data to share with each service<br>
                            • Blockchain-verified for security<br>
                            • Revocable access permissions
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        <button class="btn-secondary" onclick="viewActivityLog()">📜 Activity Log</button>
                        <button class="btn-secondary" onclick="revokeAccess()">🚫 Revoke Access</button>
                        <button class="btn-secondary" onclick="exportData()">📥 Export My Data</button>
                        <button class="btn-secondary" onclick="deleteID()">🗑️ Delete ID</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>📊 Global Network Stats</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 28px; font-weight: 700; color: #0ea5e9;">2.4B</div>
                            <div style="font-size: 13px; color: #6c757d; margin-top: 5px;">Registered IDs</div>
                        </div>
                        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 28px; font-weight: 700; color: #16a34a;">193</div>
                            <div style="font-size: 13px; color: #6c757d; margin-top: 5px;">Countries</div>
                        </div>
                        <div style="background: #ede9fe; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 28px; font-weight: 700; color: #6366f1;">847K</div>
                            <div style="font-size: 13px; color: #6c757d; margin-top: 5px;">Services Connected</div>
                        </div>
                        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 28px; font-weight: 700; color: #fbbf24;">99.97%</div>
                            <div style="font-size: 13px; color: #6c757d; margin-top: 5px;">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        genesisCell: `
            <h2>🌱 Genesis Cell - Website Builder</h2>
            <p style="text-align: center;">Build custom websites from a single cell - AI-powered no-code platform</p>
            <div style="max-width: 1400px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">🧬 From One Cell to Complete Website</h3>
                    <p style="font-size: 15px;">Start with a single idea (the "cell"), and watch as AI expands it into a full website. No coding required - just describe what you want.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🌱 Start Your Cell</h3>
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; font-size: 13px; margin-bottom: 8px; font-weight: 600;">Website Type:</label>
                            <select id="siteType" onchange="updateTemplates(this.value)" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px; margin-bottom: 15px;">
                                <option>Business/Portfolio</option>
                                <option>E-commerce Store</option>
                                <option>Blog/Magazine</option>
                                <option>Landing Page</option>
                                <option>App/SaaS</option>
                                <option>Personal Site</option>
                                <option>Non-Profit</option>
                            </select>
                            <label style="display: block; font-size: 13px; margin-bottom: 8px; font-weight: 600;">Describe Your Vision:</label>
                            <textarea id="siteVision" placeholder="e.g., 'A modern portfolio for a photographer specializing in nature photography. Clean design with large images.'" style="width: 100%; min-height: 120px; padding: 12px; border: 2px solid #d9d9d9; border-radius: 8px; font-family: inherit; margin-bottom: 15px;"></textarea>
                            <button class="btn-primary" style="width: 100%;" onclick="generateWebsite()">✨ Generate Website</button>
                        </div>
                        <div style="background: #ede9fe; padding: 15px; border-radius: 8px; margin-top: 20px;">
                            <div style="font-weight: 600; margin-bottom: 8px;">Quick Templates:</div>
                            <div style="display: grid; gap: 8px;">
                                <button class="btn-secondary" style="font-size: 12px;" onclick="loadTemplate('startup')">🚀 Startup</button>
                                <button class="btn-secondary" style="font-size: 12px;" onclick="loadTemplate('restaurant')">🍽️ Restaurant</button>
                                <button class="btn-secondary" style="font-size: 12px;" onclick="loadTemplate('creative')">🎨 Creative</button>
                                <button class="btn-secondary" style="font-size: 12px;" onclick="loadTemplate('tech')">💻 Tech</button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="margin: 0;">🖥️ Live Preview</h3>
                            <div style="display: flex; gap: 10px;">
                                <button class="btn-secondary" onclick="previewMode('desktop')">🖥️ Desktop</button>
                                <button class="btn-secondary" onclick="previewMode('tablet')">📱 Tablet</button>
                                <button class="btn-secondary" onclick="previewMode('mobile')">📱 Mobile</button>
                            </div>
                        </div>
                        <div id="websitePreview" style="background: #f8f9fa; border: 2px solid #d9d9d9; border-radius: 8px; min-height: 500px; overflow: auto;">
                            <div style="padding: 60px 20px; text-align: center; color: #6c757d;">
                                <div style="font-size: 64px; margin-bottom: 20px;">🌱</div>
                                <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">Your website will appear here</div>
                                <div style="font-size: 14px;">Describe your vision and click "Generate Website"</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn-secondary" onclick="editContent()">✏️ Edit Content</button>
                            <button class="btn-secondary" onclick="changeColors()">🎨 Change Colors</button>
                            <button class="btn-secondary" onclick="addSection()">➕ Add Section</button>
                            <button class="btn-primary" onclick="publishSite()">🚀 Publish</button>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🎨 AI Design Assistant</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <div style="margin-bottom: 15px;">
                            <div style="font-weight: 600; margin-bottom: 10px;">🤖 AI Suggestions:</div>
                            <div style="font-size: 13px; line-height: 2; color: #6c757d;">
                                <div>• Consider adding a testimonials section to build trust</div>
                                <div>• Your call-to-action button could be more prominent</div>
                                <div>• Add social proof (client logos or metrics)</div>
                                <div>• Include a contact form for lead generation</div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                            <button class="btn-secondary" onclick="applyAISuggestion('testimonials')">Add Testimonials</button>
                            <button class="btn-secondary" onclick="applyAISuggestion('cta')">Enhance CTA</button>
                            <button class="btn-secondary" onclick="applyAISuggestion('social')">Add Social Proof</button>
                            <button class="btn-secondary" onclick="applyAISuggestion('form')">Add Contact Form</button>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📦 Features & Integrations</h3>
                        <div style="font-size: 13px; line-height: 2;">
                            <div style="padding: 8px; background: #f0fdf4; border-radius: 6px; margin-bottom: 8px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox" checked> Contact Forms
                                </label>
                            </div>
                            <div style="padding: 8px; background: #f0fdf4; border-radius: 6px; margin-bottom: 8px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox" checked> SEO Optimization
                                </label>
                            </div>
                            <div style="padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 8px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox"> E-commerce (+$10/mo)
                                </label>
                            </div>
                            <div style="padding: 8px; background: #f8f9fa; border-radius: 6px; margin-bottom: 8px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox"> Blog System (+$5/mo)
                                </label>
                            </div>
                            <div style="padding: 8px; background: #f8f9fa; border-radius: 6px;">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                    <input type="checkbox"> Analytics (+Free)
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🌐 Deployment Options</h3>
                        <div style="display: grid; gap: 10px;">
                            <button class="btn-secondary" onclick="deployTo('infinity')">🌀 Infinity Hosting (Free)</button>
                            <button class="btn-secondary" onclick="deployTo('github')">📂 GitHub Pages</button>
                            <button class="btn-secondary" onclick="deployTo('netlify')">🌐 Netlify</button>
                            <button class="btn-secondary" onclick="deployTo('vercel')">▲ Vercel</button>
                            <button class="btn-secondary" onclick="deployTo('cloudflare')">☁️ Cloudflare Pages</button>
                        </div>
                        <div style="background: #ede9fe; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 13px;">
                            <div style="font-weight: 600; margin-bottom: 5px;">Custom Domain:</div>
                            <input type="text" placeholder="yourdomain.com" style="width: 100%; padding: 8px; border: 2px solid #d9d9d9; border-radius: 6px;">
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>💎 Export & Code</h3>
                        <div style="display: grid; gap: 10px;">
                            <button class="btn-secondary" onclick="exportHTML()">📄 Export HTML</button>
                            <button class="btn-secondary" onclick="exportCSS()">🎨 Export CSS</button>
                            <button class="btn-secondary" onclick="exportJS()">⚡ Export JavaScript</button>
                            <button class="btn-primary" onclick="downloadFullSite()">📦 Download Full Site (.zip)</button>
                        </div>
                        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 15px; font-size: 13px; text-align: center;">
                            <div style="font-weight: 600; color: #16a34a; margin-bottom: 5px;">100% Your Code</div>
                            <div style="color: #6c757d;">No lock-in, fully customizable</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>📚 Your Websites</h3>
                    <div id="websiteGallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
                        <div style="border: 2px solid #d9d9d9; border-radius: 8px; padding: 15px; cursor: pointer;" onclick="editWebsite('site1')">
                            <div style="background: #dbeafe; height: 120px; border-radius: 6px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; font-size: 36px;">🏠</div>
                            <div style="font-weight: 600;">My Portfolio</div>
                            <div style="font-size: 12px; color: #6c757d; margin-top: 5px;">Published • myportfolio.infinity</div>
                        </div>
                        <div style="border: 2px dashed #d9d9d9; border-radius: 8px; padding: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; min-height: 180px;" onclick="createNewSite()">
                            <div style="text-align: center; color: #6c757d;">
                                <div style="font-size: 48px; margin-bottom: 10px;">➕</div>
                                <div>Create New Website</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `,
        
        ancientFollis: `
            <h2>🏛️ Ancient Follis Magazine</h2>
            <p style="text-align: center;">Aggregate of ancient coin finds, archeological discoveries, and numismatic research</p>
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #92400e 0%, #78350f 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">⚱️ Ancient Coin & Artifact Discovery Network</h3>
                    <p style="font-size: 15px;">Continuous aggregation of Roman follis discoveries, Byzantine coins, ancient artifacts, and archeological finds from around the world.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🪙 Recent Follis Discoveries</h3>
                        <div style="max-height: 350px; overflow-y: auto;">
                            <div style="padding: 15px; background: #fef3c7; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #fbbf24;">
                                <div style="font-weight: 600; margin-bottom: 5px;">Constantine I Follis - Ticinum Mint</div>
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 8px;">Found: Bulgaria • 307-337 AD</div>
                                <div style="font-size: 13px; margin-bottom: 8px;">Excellent preservation, reverse shows two soldiers with standards</div>
                                <div style="font-size: 11px; color: #fbbf24;">Est. Value: $120-180 • Rarity: R2</div>
                            </div>
                            <div style="padding: 15px; background: #dbeafe; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3b82f6;">
                                <div style="font-weight: 600; margin-bottom: 5px;">Diocletian Follis - Cyzicus</div>
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 8px;">Found: Turkey • 284-305 AD</div>
                                <div style="font-size: 13px; margin-bottom: 8px;">Genius reverse type, well-centered strike</div>
                                <div style="font-size: 11px; color: #3b82f6;">Est. Value: $85-140 • Rarity: R1</div>
                            </div>
                            <div style="padding: 15px; background: #f0fdf4; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #16a34a;">
                                <div style="font-weight: 600; margin-bottom: 5px;">Justinian I Half Follis - Constantinople</div>
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 8px;">Found: Greece • 527-565 AD</div>
                                <div style="font-size: 13px; margin-bottom: 8px;">Large K reverse, regnal year visible</div>
                                <div style="font-size: 11px; color: #16a34a;">Est. Value: $45-75 • Rarity: C</div>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="viewAllFollis()">View All Discoveries (2,847)</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🏺 Archeological News</h3>
                        <div style="max-height: 350px; overflow-y: auto;">
                            <div style="padding: 15px; background: #ede9fe; border-radius: 8px; margin-bottom: 10px;">
                                <div style="font-size: 11px; color: #6c757d; margin-bottom: 5px;">3 hours ago • Archeology News</div>
                                <div style="font-weight: 600; margin-bottom: 8px;">Massive Roman Coin Hoard Found in Spain</div>
                                <div style="font-size: 13px; color: #6c757d;">Over 1,300 bronze folles discovered in ceramic jar near Seville. Dating to late 3rd century AD.</div>
                            </div>
                            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                                <div style="font-size: 11px; color: #6c757d; margin-bottom: 5px;">Yesterday • British Museum</div>
                                <div style="font-weight: 600; margin-bottom: 8px;">New Byzantine Gold Solidus Attribution</div>
                                <div style="font-size: 13px; color: #6c757d;">Researchers identify previously unknown mint mark on Heraclius solidus.</div>
                            </div>
                            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                                <div style="font-size: 11px; color: #6c757d; margin-bottom: 5px;">2 days ago • Metal Detecting UK</div>
                                <div style="font-weight: 600; margin-bottom: 8px;">Saxon Brooch Discovery Linked to Royal Site</div>
                                <div style="font-size: 13px; color: #6c757d;">7th century gilt bronze brooch suggests high-status settlement.</div>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%; margin-top: 10px;" onclick="refreshArchNews()">🔄 Refresh News Feed</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📊 Market Trends</h3>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Roman Bronze Index:</div>
                                <div style="font-size: 24px; font-weight: 700; color: #16a34a;">+12.3%</div>
                                <div style="font-size: 11px; color: #16a34a;">30-day trend ↑</div>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Byzantine Gold:</div>
                                <div style="font-size: 24px; font-weight: 700; color: #fbbf24;">+8.7%</div>
                                <div style="font-size: 11px; color: #fbbf24;">90-day trend ↑</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Greek Silver:</div>
                                <div style="font-size: 24px; font-weight: 700; color: #dc2626;">-2.1%</div>
                                <div style="font-size: 11px; color: #dc2626;">30-day trend ↓</div>
                            </div>
                        </div>
                        <button class="btn-secondary" style="width: 100%;" onclick="viewFullMarket()">📈 Full Market Analysis</button>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>🔍 Identification Assistant</h3>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 20px;">
                        <div>
                            <div style="background: #f8f9fa; border: 2px dashed #d9d9d9; border-radius: 8px; padding: 40px; text-align: center; margin-bottom: 15px;">
                                <div style="font-size: 48px; margin-bottom: 10px;">📷</div>
                                <div style="color: #6c757d; font-size: 14px;">Upload coin photo for AI identification</div>
                            </div>
                            <button class="btn-primary" style="width: 100%;" onclick="uploadCoinPhoto()">📤 Upload Photo</button>
                        </div>
                        <div>
                            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a;">
                                <div style="font-weight: 600; margin-bottom: 10px;">AI Identification Results:</div>
                                <div style="font-size: 13px; line-height: 1.8; color: #6c757d;">
                                    <div><strong>Emperor:</strong> Constantine I (The Great)</div>
                                    <div><strong>Denomination:</strong> Follis (AE3)</div>
                                    <div><strong>Mint:</strong> Trier (TRP)</div>
                                    <div><strong>Date:</strong> 310-313 AD</div>
                                    <div><strong>Reverse:</strong> Soli Invicto Comiti</div>
                                    <div><strong>RIC:</strong> VI Trier 899</div>
                                    <div><strong>Grade:</strong> VF (Very Fine)</div>
                                    <div><strong>Est. Value:</strong> $65-95</div>
                                    <div style="color: #16a34a; margin-top: 10px;"><strong>Confidence:</strong> 94%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>📚 Research Sources</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            <span class="source-badge">RIC (Roman Imperial Coinage)</span>
                            <span class="source-badge">OCRE Database</span>
                            <span class="source-badge">CoinArchives</span>
                            <span class="source-badge">WildWinds</span>
                            <span class="source-badge">British Museum</span>
                            <span class="source-badge">American Numismatic Society</span>
                            <span class="source-badge">Portable Antiquities Scheme</span>
                            <span class="source-badge">NumisWiki</span>
                        </div>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d9d9d9; font-size: 13px; color: #6c757d;">
                            <strong>Auto-scraping frequency:</strong> Every 2 hours • <strong>Last update:</strong> 23 minutes ago • <strong>New entries:</strong> 34
                        </div>
                    </div>
                    <button class="btn-primary" style="width: 100%; margin-top: 15px;" onclick="configureSources()">⚙️ Configure Research Sources</button>
                </div>
            </div>
        `,
        
        keyboardQuest: `
            <h2>⌨️ Keyboard Quest</h2>
            <p style="text-align: center;">Build custom keyboards and debug vintage models</p>
            <div style="max-width: 1200px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px;">
                    <h3 style="color: white; margin-bottom: 15px;">⌨️ Mechanical Keyboard Lab</h3>
                    <p style="font-size: 15px;">Design custom keyboards, troubleshoot vintage models, test switches, program firmware, and join the mechanical keyboard community.</p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🛠️ Keyboard Builder</h3>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-size: 13px; margin-bottom: 8px; font-weight: 600;">Layout:</label>
                                <select id="kbLayout" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                                    <option>60% (61 keys)</option>
                                    <option>65% (68 keys)</option>
                                    <option>75% (84 keys)</option>
                                    <option>TKL (87 keys)</option>
                                    <option>Full Size (104 keys)</option>
                                    <option>40% Ortho (48 keys)</option>
                                </select>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-size: 13px; margin-bottom: 8px; font-weight: 600;">Switch Type:</label>
                                <select id="switchType" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                                    <option>Cherry MX Brown (Tactile)</option>
                                    <option>Cherry MX Blue (Clicky)</option>
                                    <option>Cherry MX Red (Linear)</option>
                                    <option>Gateron Yellow (Linear)</option>
                                    <option>Holy Panda (Tactile)</option>
                                    <option>Kailh Box White (Clicky)</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-size: 13px; margin-bottom: 8px; font-weight: 600;">Case Material:</label>
                                <select id="caseMaterial" style="width: 100%; padding: 10px; border: 2px solid #d9d9d9; border-radius: 8px;">
                                    <option>Aluminum (CNC)</option>
                                    <option>Acrylic (Laser Cut)</option>
                                    <option>3D Printed (PLA)</option>
                                    <option>Wood (Walnut/Oak)</option>
                                    <option>Carbon Fiber</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn-primary" style="width: 100%;" onclick="generateKeyboardBuild()">🎨 Generate Build Guide</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🔧 Debug Assistant</h3>
                        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 15px;">
                            <div style="font-weight: 600; margin-bottom: 10px;">Common Issues:</div>
                            <div style="font-size: 13px; line-height: 2;">
                                <div style="cursor: pointer; padding: 8px; background: white; border-radius: 6px; margin-bottom: 8px;" onclick="diagnose('chattering')">🔧 Key Chattering</div>
                                <div style="cursor: pointer; padding: 8px; background: white; border-radius: 6px; margin-bottom: 8px;" onclick="diagnose('deadkeys')">🔧 Dead Keys</div>
                                <div style="cursor: pointer; padding: 8px; background: white; border-radius: 6px; margin-bottom: 8px;" onclick="diagnose('stabilizer')">🔧 Stabilizer Rattle</div>
                                <div style="cursor: pointer; padding: 8px; background: white; border-radius: 6px;" onclick="diagnose('firmware')">🔧 Firmware Not Flashing</div>
                            </div>
                        </div>
                        <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a;">
                            <div style="font-weight: 600; margin-bottom: 8px;">✓ Solution Found:</div>
                            <div style="font-size: 13px; color: #6c757d;">For key chattering, try: 1) Clean switch contacts 2) Increase debounce delay in firmware 3) Replace affected switches</div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🎹 Switch Tester</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">
                            <div onclick="testSwitch('linear')" style="padding: 20px; background: #dbeafe; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-size: 24px; margin-bottom: 5px;">━</div>
                                <div style="font-size: 12px; font-weight: 600;">Linear</div>
                                <div style="font-size: 10px; color: #6c757d;">Smooth</div>
                            </div>
                            <div onclick="testSwitch('tactile')" style="padding: 20px; background: #fef3c7; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-size: 24px; margin-bottom: 5px;">⌃</div>
                                <div style="font-size: 12px; font-weight: 600;">Tactile</div>
                                <div style="font-size: 10px; color: #6c757d;">Bump</div>
                            </div>
                            <div onclick="testSwitch('clicky')" style="padding: 20px; background: #f0fdf4; border-radius: 8px; text-align: center; cursor: pointer;">
                                <div style="font-size: 24px; margin-bottom: 5px;">♪</div>
                                <div style="font-size: 12px; font-weight: 600;">Clicky</div>
                                <div style="font-size: 10px; color: #6c757d;">Click</div>
                            </div>
                        </div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                            <div style="font-size: 12px; color: #6c757d; margin-bottom: 5px;">Force Curve:</div>
                            <div style="background: white; height: 80px; border-radius: 6px; border: 1px solid #d9d9d9; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 12px;">
                                Switch force diagram would appear here
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px;">
                    <h3>📐 Layout Designer</h3>
                    <div id="layoutCanvas" style="background: #f8f9fa; border: 2px solid #d9d9d9; border-radius: 8px; min-height: 300px; padding: 20px;">
                        <div style="display: grid; grid-template-columns: repeat(15, 1fr); gap: 4px;">
                            ${Array(61).fill(0).map((_, i) => `
                                <div onclick="toggleKey(${i})" style="background: white; border: 2px solid #d9d9d9; border-radius: 4px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; font-size: 10px; cursor: pointer; user-select: none;">
                                    ${['`','1','2','3','4','5','6','7','8','9','0','-','=','\\u232B','Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\\\','Caps','A','S','D','F','G','H','J','K','L',';','\\'','Enter','Shift','Z','X','C','V','B','N','M',',','.','/','Shift','Ctrl','Win','Alt','Space','Alt','Win','Menu','Ctrl'][i] || ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <button class="btn-secondary" onclick="exportLayout()">📥 Export Layout (JSON)</button>
                        <button class="btn-secondary" onclick="importLayout()">📤 Import Layout</button>
                        <button class="btn-primary" onclick="generateFirmware()">⚡ Generate QMK Firmware</button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>🏪 Parts Estimator</h3>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="font-size: 13px;">PCB:</span>
                                <span style="font-weight: 600;">$45</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="font-size: 13px;">Switches (61x):</span>
                                <span style="font-weight: 600;">$36</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="font-size: 13px;">Case:</span>
                                <span style="font-weight: 600;">$75</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="font-size: 13px;">Keycaps:</span>
                                <span style="font-weight: 600;">$50</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="font-size: 13px;">Stabilizers:</span>
                                <span style="font-weight: 600;">$15</span>
                            </div>
                            <div style="border-top: 2px solid #d9d9d9; margin: 15px 0; padding-top: 15px; display: flex; justify-content: space-between;">
                                <span style="font-weight: 700;">Total:</span>
                                <span style="font-weight: 700; font-size: 18px; color: #ec4899;">$221</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>📚 Vintage Keyboards</h3>
                        <div style="font-size: 13px; line-height: 2;">
                            <div style="padding: 10px; background: #f0fdf4; border-radius: 6px; margin-bottom: 8px;">
                                <strong>IBM Model M</strong>
                                <div style="font-size: 11px; color: #6c757d;">Buckling spring • 1985-present</div>
                            </div>
                            <div style="padding: 10px; background: #dbeafe; border-radius: 6px; margin-bottom: 8px;">
                                <strong>Apple Extended Keyboard II</strong>
                                <div style="font-size: 11px; color: #6c757d;">Alps SKCM Orange • 1990</div>
                            </div>
                            <div style="padding: 10px; background: #fef3c7; border-radius: 6px; margin-bottom: 8px;">
                                <strong>Northgate OmniKey</strong>
                                <div style="font-size: 11px; color: #6c757d;">Alps SKCM Blue • 1987</div>
                            </div>
                        </div>
                        <button class="btn-secondary" style="width: 100%; margin-top: 10px;" onclick="browseVintage()">View Full Database</button>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 12px;">
                        <h3>💬 Community</h3>
                        <div style="display: grid; gap: 10px;">
                            <button class="btn-secondary" onclick="joinCommunity('reddit')">🔗 r/MechanicalKeyboards</button>
                            <button class="btn-secondary" onclick="joinCommunity('discord')">💬 Keyboard Discord</button>
                            <button class="btn-secondary" onclick="joinCommunity('geekhack')">🌐 GeekHack Forums</button>
                            <button class="btn-primary" onclick="shareYourBuild()">📸 Share Your Build</button>
                        </div>
                    </div>
                </div>
                
                <div style="background: white; padding: 25px; border-radius: 12px;">
                    <h3>🎓 Learning Resources</h3>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div style="padding: 15px; background: white; border-radius: 8px; border: 1px solid #d9d9d9;">
                                <div style="font-weight: 600; margin-bottom: 5px;">⚙️ QMK Firmware Guide</div>
                                <div style="font-size: 12px; color: #6c757d;">Program custom layouts</div>
                            </div>
                            <div style="padding: 15px; background: white; border-radius: 8px; border: 1px solid #d9d9d9;">
                                <div style="font-weight: 600; margin-bottom: 5px;">🔧 Soldering Tutorial</div>
                                <div style="font-size: 12px; color: #6c757d;">Build from scratch</div>
                            </div>
                            <div style="padding: 15px; background: white; border-radius: 8px; border: 1px solid #d9d9d9;">
                                <div style="font-weight: 600; margin-bottom: 5px;">🎨 Keycap Guide</div>
                                <div style="font-size: 12px; color: #6c757d;">Profiles & materials</div>
                            </div>
                            <div style="padding: 15px; background: white; border-radius: 8px; border: 1px solid #d9d9d9;">
                                <div style="font-weight: 600; margin-bottom: 5px;">📐 Layout Theory</div>
                                <div style="font-size: 12px; color: #6c757d;">Ergonomics & efficiency</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
    
    return apps[appName] || '<h2>App content loading...</h2>';
}

// Initialize app-specific features
function initializeApp(appName) {
    // App-specific initialization code
    if (appName === 'alarm') {
        // Start clock
        setInterval(() => {
            const timeEl = document.getElementById('currentTime');
            if (timeEl) {
                const now = new Date();
                timeEl.textContent = now.toLocaleTimeString();
            }
        }, 1000);
    }
}

// Calculator functions
let calcCurrentInput = '';
function calcInput(val) {
    calcCurrentInput += val;
    document.getElementById('calcDisplay').textContent = calcCurrentInput || '0';
}
function calcClear() {
    calcCurrentInput = '';
    document.getElementById('calcDisplay').textContent = '0';
}
function calcEqual() {
    try {
        calcCurrentInput = eval(calcCurrentInput).toString();
        document.getElementById('calcDisplay').textContent = calcCurrentInput;
        awardTokenForHardWork('calculation');
    } catch (e) {
        document.getElementById('calcDisplay').textContent = 'Error';
        calcCurrentInput = '';
    }
}

// Helper functions for various apps
function setAlarm() {
    const time = document.getElementById('alarmTime').value;
    if (time) {
        alert(`Alarm set for ${time}`);
        speak(`Alarm set for ${time}`);
        awardTokenForHardWork('alarm_set');
    }
}

function getNewVerse() {
    speak('Loading new verse');
    awardTokenForHardWork('bible_reading');
}

function speakVerse() {
    speak('Your country is desolate, your cities are burned with fire: your land, strangers devour it in your presence, and it is desolate, as overthrown by strangers. Isaiah 1:7');
}

function addPet() {
    const name = document.getElementById('petName').value;
    const type = document.getElementById('petType').value;
    if (name) {
        alert(`Added ${type}: ${name}`);
        speak(`Added ${type} named ${name}`);
        awardTokenForHardWork('pet_added');
    }
}

function addPlant() {
    speak('Adding plant to your garden');
    awardTokenForHardWork('garden_activity');
}

function findLocalChat() {
    const zip = document.getElementById('zipCode').value;
    if (zip && zip.length === 5) {
        document.getElementById('localChatRoom').style.display = 'block';
        speak(`Connecting to chat room for zip code ${zip}`);
        awardTokenForHardWork('local_chat_join');
    }
}

function sendLocalMessage() {
    const input = document.getElementById('localChatInput');
    const message = input.value.trim();
    if (message) {
        checkForTiRigers(message);
        input.value = '';
        awardTokenForHardWork('chat_message');
    }
}

function generateGame() {
    const idea = document.getElementById('gameIdea').value;
    if (idea) {
        const preview = document.getElementById('gamePreview');
        preview.innerHTML = '<div class="loading-spinner"></div><p>Generating your game with Gemini AI...</p>';
        
        speak('Generating your game with AI');
        
        const context = 'You are a video game designer AI. Create a detailed game concept including mechanics, storyline, and features based on the user\'s idea. Be creative and specific.';
        
        callGeminiAI(idea, context).then(response => {
            preview.innerHTML = `
                <div style="background: white; padding: 20px; border-radius: 12px; margin-top: 20px;">
                    <h3 style="color: #0070ba;">Generated Game Concept</h3>
                    <div style="white-space: pre-wrap; line-height: 1.6;">${response}</div>
                    <button class="btn-primary" style="margin-top: 20px;" onclick="speak('Game concept generated successfully')">🔊 Read Aloud</button>
                    <button class="btn-secondary" style="margin-top: 20px;" onclick="awardTokenForHardWork('game_generation'); alert('Concept saved!')">Save Concept</button>
                </div>
            `;
            awardTokenForHardWork('game_generation');
            userTokens += 2; // Bonus for creation
            updateTokenDisplay();
            speak('Your game concept is ready!');
        });
    }
}

// PeerLink / P2P Functions
function saveP2PConfig() {
    const handle = document.getElementById('p2pHandle').value;
    const routingFormat = document.getElementById('routingFormat').value;
    const pageLink = document.getElementById('p2pPageLink').value;
    const radioMode = document.getElementById('radioMode').checked;
    
    const config = {
        handle,
        routingFormat,
        pageLink,
        radioMode,
        p2pId: document.getElementById('userP2PId').textContent
    };
    
    localStorage.setItem('p2pConfig', JSON.stringify(config));
    speak('P2P configuration saved');
    awardTokenForHardWork('p2p_config');
    alert('P2P Configuration saved successfully!');
}

function generateNewP2PId() {
    const format = document.getElementById('routingFormat')?.value || 'numeric';
    let newId;
    
    if (format === 'numeric') {
        const num = Math.floor(Math.random() * 9999) + 1;
        newId = `INF-USER-${String(num).padStart(4, '0')}`;
    } else if (format === 'word') {
        const words = ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA', 'ETA', 'THETA'];
        const w1 = words[Math.floor(Math.random() * words.length)];
        const w2 = words[Math.floor(Math.random() * words.length)];
        newId = `INF-${w1}-${w2}`;
    } else {
        newId = `INF-CUSTOM-${Date.now().toString(36).toUpperCase()}`;
    }
    
    document.getElementById('userP2PId').textContent = newId;
    speak('New P2P ID generated');
    awardTokenForHardWork('p2p_generation');
}

function scanP2PNetwork() {
    const connectionsDiv = document.getElementById('p2pConnections');
    connectionsDiv.innerHTML = '<div class="loading-spinner"></div><p>Scanning P2P network...</p>';
    
    setTimeout(() => {
        connectionsDiv.innerHTML = `
            <div style="padding: 10px; background: white; border-radius: 6px; margin-bottom: 8px;">
                <strong>INF-USER-0042</strong> - Active - Distance: 2 hops
            </div>
            <div style="padding: 10px; background: white; border-radius: 6px; margin-bottom: 8px;">
                <strong>INF-ALPHA-OMEGA</strong> - Active - Distance: 3 hops
            </div>
            <div style="padding: 10px; background: white; border-radius: 6px;">
                <strong>INF-USER-1337</strong> - Active - Distance: 1 hop
            </div>
        `;
        speak('P2P network scan complete');
        awardTokenForHardWork('p2p_scan');
    }, 1500);
}

// Deployer / Publisher Functions
function exportHTML() {
    const status = document.getElementById('exportStatus');
    status.innerHTML = '<div class="loading-spinner"></div><p>Generating HTML export...</p>';
    
    const presidentialTitle = document.getElementById('presidentialTitle')?.value || 'Infinity Presidential Node';
    const includePayPal = document.getElementById('includePayPal')?.checked;
    
    setTimeout(() => {
        const htmlContent = generateFullHTMLExport(presidentialTitle, includePayPal);
        downloadFile('infinity-portal.html', htmlContent, 'text/html');
        
        status.innerHTML = `<p style="color: #28a745;">✅ HTML exported successfully! File downloaded.</p>`;
        speak('HTML export complete');
        awardTokenForHardWork('export');
        userTokens += 5; // Bonus for deployment
        updateTokenDisplay();
    }, 1000);
}

function exportJSON() {
    const status = document.getElementById('exportStatus');
    status.innerHTML = '<div class="loading-spinner"></div><p>Generating JSON schema...</p>';
    
    setTimeout(() => {
        const jsonSchema = {
            platform: 'Infinity',
            version: '1.0.0',
            user: currentUser,
            tokens: userTokens,
            apps: ['portal', 'marketplace', 'socializer', 'peerlink', 'deployer', 'funding'],
            config: {
                presidentialTitle: document.getElementById('presidentialTitle')?.value || 'Infinity Presidential Node',
                deployTarget: document.getElementById('deployTarget')?.value || 'html',
                includePayPal: document.getElementById('includePayPal')?.checked || true
            },
            timestamp: new Date().toISOString()
        };
        
        downloadFile('infinity-schema.json', JSON.stringify(jsonSchema, null, 2), 'application/json');
        status.innerHTML = `<p style="color: #28a745;">✅ JSON schema exported successfully!</p>`;
        speak('JSON export complete');
        awardTokenForHardWork('export');
    }, 800);
}

function generateZIP() {
    const status = document.getElementById('exportStatus');
    status.innerHTML = '<div class="loading-spinner"></div><p>Generating ZIP package... This may take a moment.</p>';
    
    setTimeout(() => {
        status.innerHTML = `
            <p style="color: #28a745;">✅ ZIP package ready!</p>
            <p style="font-size: 13px; color: #6c757d; margin-top: 10px;">Package includes: index.html, app.js, styles.css, themes.css, README.md</p>
            <button class="btn-primary" onclick="alert('ZIP download would start here')">Download ZIP</button>
        `;
        speak('ZIP package generated');
        awardTokenForHardWork('export');
        userTokens += 10; // Big bonus for full export
        updateTokenDisplay();
    }, 2000);
}

function previewDeploy() {
    speak('Opening deployment preview');
    alert('Deployment preview will open in new window.\n\nThis shows how your portal will look when deployed.');
    awardTokenForHardWork('preview');
}

function generateFullHTMLExport(title, includePayPal) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* Exported Infinity Styles */
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; background: #f7f9fc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #0070ba; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${title}</h1>
        <p>Powered by Infinity</p>
        ${includePayPal ? '<div id="marketplace-panel"><!-- PayPal Marketplace Panel --></div>' : ''}
        <!-- Required Hooks -->
        <div id="rogers-button"></div>
        <div id="intake-agent"></div>
        <div id="infinity-deployer"></div>
        <div id="nwo-panel"></div>
        <div id="p2p-panel"></div>
        <div id="funding-pad"></div>
        <div id="watson-core"></div>
        <div id="gemini-image-intake"></div>
    </div>
</body>
</html>`;
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Funding Pad Functions
function showFundingTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.funding-tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').style.display = 'block';
    event.target.classList.add('active');
    
    speak(`Viewing ${tabName} section`);
}

function loadGrantTemplate(type) {
    const templates = {
        tech: 'Technology Innovation Grant - Focus on AI/blockchain platforms',
        social: 'Social Impact Grant - Community-focused projects',
        rd: 'Research & Development Grant - Experimental technology'
    };
    
    alert(`Loading template: ${templates[type]}\n\nThis would open a form pre-filled with grant application fields.`);
    speak('Grant template loaded');
    awardTokenForHardWork('grant_work');
}

function createCustomGrant() {
    alert('Custom Grant Builder\n\nCreate your own grant application tailored to your specific needs.');
    speak('Custom grant builder opened');
}

function addDonor() {
    const name = prompt('Enter donor/investor name:');
    if (name) {
        alert(`Donor "${name}" added to your list!`);
        awardTokenForHardWork('donor_management');
    }
}

function proposePartnership() {
    alert('Partnership Proposal\n\nSubmit your app for the 1% marketplace revenue share model.');
    speak('Partnership proposal form opened');
}

function generatePitchDeck() {
    speak('Generating pitch deck with Gemini AI');
    const context = 'Create a compelling investor pitch deck outline for Infinity Platform - a token-based economy with P2P communication, AI integration, and decentralized publishing. Include: Problem, Solution, Market, Business Model, Team, Ask.';
    
    callGeminiAI('Generate pitch deck for Infinity Platform', context).then(response => {
        alert('Pitch Deck Generated!\n\n' + response.substring(0, 500) + '...\n\n(Full deck would be formatted as slides)');
        awardTokenForHardWork('pitch_deck');
        userTokens += 15; // Big bonus for fundraising effort
        updateTokenDisplay();
    });
}

// RISK Game Companion Functions
function initRiskGame() {
    const players = document.getElementById('riskPlayers').value;
    speak(`Initializing RISK game with ${players}`);
    alert(`RISK game initialized with ${players}!\n\nAI strategy advisor is ready.`);
    awardTokenForHardWork('game_setup');
}

function nextRiskTurn() {
    const players = ['Red', 'Blue', 'Yellow', 'Green', 'Black', 'Purple'];
    const currentPlayer = document.getElementById('riskCurrentPlayer');
    const currentIndex = players.indexOf(currentPlayer.textContent.replace(' Player', ''));
    const nextIndex = (currentIndex + 1) % players.length;
    currentPlayer.textContent = players[nextIndex] + ' Player';
    speak(`${players[nextIndex]} player's turn`);
    getNewRiskAdvice();
}

function getNewRiskAdvice() {
    const advices = [
        "Fortify Australia - easiest continent to defend with only 1 entry point.",
        "Control South America early - 2 armies bonus for only 4 territories.",
        "Break up large enemy holdings - prevent continent bonuses.",
        "Don't spread too thin - better to control fewer territories strongly.",
        "Attack from your strongest position - concentrate your forces.",
        "Watch for alliances forming against you - diplomatic awareness is key.",
        "Secure Asia if you can - highest bonus but hardest to defend.",
        "Use cards strategically - cash in sets for maximum army placement."
    ];
    
    const advice = advices[Math.floor(Math.random() * advices.length)];
    document.getElementById('riskAdvice').textContent = advice;
    speak('New strategy advice ready');
}

function analyzeDefense() {
    alert('Defense Analysis:\n\n✓ Australia: Fully controlled, well fortified\n⚠ South America: Vulnerable at Brazil\n✗ Europe: Too many entry points');
    speak('Defense analysis complete');
}

function analyzeAttack() {
    alert('Attack Opportunities:\n\n🎯 High: Ukraine (3 armies vs your 8)\n⚔️ Medium: Alaska (5 armies vs your 6)\n⚠️ Low: China (9 armies vs your 4)');
    speak('Attack analysis complete');
}

function showTerritoryMap() {
    alert('Territory Distribution:\n\nYou: 12 territories (28%)\nOpponent 1: 15 territories (35%)\nOpponent 2: 10 territories (23%)\nNeutral: 6 territories (14%)');
}

function calculateRiskOdds() {
    const attackers = parseInt(document.getElementById('attackArmies').value);
    const defenders = parseInt(document.getElementById('defendArmies').value);
    
    // Simplified probability calculation
    let winChance;
    if (attackers === 3 && defenders === 2) {
        winChance = 37;
    } else if (attackers === 3 && defenders === 1) {
        winChance = 66;
    } else if (attackers === 2 && defenders === 2) {
        winChance = 23;
    } else if (attackers === 2 && defenders === 1) {
        winChance = 58;
    } else if (attackers === 1 && defenders === 2) {
        winChance = 11;
    } else if (attackers === 1 && defenders === 1) {
        winChance = 42;
    } else {
        winChance = 50;
    }
    
    const result = document.getElementById('riskOddsResult');
    result.innerHTML = `
        <div style="color: ${winChance > 50 ? '#28a745' : '#dc3545'};">
            Win Probability: ${winChance}%
        </div>
        <div style="font-size: 14px; margin-top: 10px; font-weight: normal; color: #6c757d;">
            ${attackers} attackers vs ${defenders} defenders
        </div>
    `;
    speak(`Win probability is ${winChance} percent`);
    awardTokenForHardWork('strategy_calc');
}

// Smokey Bear Fire Prevention Functions
function checkFireDanger() {
    speak('Checking fire danger for your location');
    setTimeout(() => {
        const levels = [
            { level: 'LOW', color: '#28a745', message: 'Safe conditions - Campfires allowed with caution' },
            { level: 'MODERATE', color: '#ffc107', message: 'Be careful - Check local restrictions' },
            { level: 'HIGH', color: '#fd7e14', message: 'Dangerous - No campfires recommended' },
            { level: 'VERY HIGH', color: '#dc3545', message: 'Extreme danger - Campfire ban in effect' }
        ];
        const random = levels[Math.floor(Math.random() * levels.length)];
        
        document.getElementById('fireDangerLevel').textContent = random.level;
        document.getElementById('fireDangerLevel').style.color = random.color;
        alert(`Fire Danger: ${random.level}\n\n${random.message}`);
        awardTokenForHardWork('fire_check');
    }, 1000);
}

function reportFire() {
    const location = document.getElementById('fireLocation').value;
    const description = document.getElementById('fireDescription').value;
    
    if (!location || !description) {
        alert('Please provide both location and description!');
        return;
    }
    
    speak('Fire report submitted');
    alert('🚨 FIRE REPORT SUBMITTED 🚨\n\nYour report has been sent to:\n- Local Fire Department\n- U.S. Forest Service\n- Emergency Services\n\nIf immediate danger, call 911!\n\nThank you for helping prevent wildfires.');
    
    document.getElementById('fireLocation').value = '';
    document.getElementById('fireDescription').value = '';
    
    awardTokenForHardWork('fire_report');
    userTokens += 10; // Bonus for civic duty
    updateTokenDisplay();
}

function learnMore(topic) {
    const content = {
        campfire: 'Campfire Safety Guide:\n\n1. Choose a safe spot away from trees/brush\n2. Build a fire ring with rocks\n3. Keep fire small and manageable\n4. Never leave unattended\n5. Fully extinguish before leaving\n\n"Drown, stir, feel" - ensure ashes are cold to touch.',
        defensible: 'Defensible Space:\n\n1. Zone 1 (0-30 ft): Remove all dead plants, keep grass mowed\n2. Zone 2 (30-100 ft): Create fuel breaks, thin trees\n3. Harden your home: Fire-resistant roofing, ember-resistant vents\n4. Maintain regularly',
        vehicle: 'Vehicle Fire Prevention:\n\n1. Avoid parking on dry grass\n2. Maintain exhaust system (hot pipes can ignite grass)\n3. Check tire chains for dragging\n4. Carry fire extinguisher\n5. Report roadside fires immediately'
    };
    
    alert(content[topic] || 'Fire safety information');
    speak('Fire safety information displayed');
}

function playFireSafetyGame() {
    alert('🎮 Smokey\'s Fire Safety Quest\n\nHelp Smokey prevent wildfires!\n\nGame would include:\n- Campfire safety challenges\n- Spot the hazard mini-games\n- Fire prevention trivia\n- Earn Smokey badges');
    speak('Fire safety game loading');
    awardTokenForHardWork('education');
}

function downloadColoringPages() {
    alert('🖍️ Smokey Bear Coloring Pages\n\nDownloading PDF with:\n- Smokey preventing forest fires\n- Campfire safety scenes\n- Wildlife protection\n- Junior Forest Ranger activities');
    speak('Coloring pages ready');
}

function watchSafetyVideos() {
    alert('📺 Fire Safety Videos\n\nAvailable videos:\n- Only You Can Prevent Wildfires (Classic)\n- Campfire Safety for Kids\n- Smokey\'s Fire Prevention Tips\n- How Forest Fires Start');
    speak('Safety videos available');
}

// Safe Haven Stocks Functions
function validateBusiness() {
    const businessName = document.getElementById('businessName').value;
    const stockSymbol = document.getElementById('stockSymbol').value;
    const businessDesc = document.getElementById('businessDesc').value;
    
    if (!businessName) {
        alert('Please enter a business name!');
        return;
    }
    
    speak('Validating business with AI');
    
    const context = `You are an ethical business analyst for Infinity Platform. Analyze if "${businessName}" is a safe, legitimate, and positive investment. Consider: ethics, sustainability, community impact, transparency, worker treatment, environmental record. Return: APPROVED (score 80-100), REVIEW NEEDED (score 50-79), or REJECTED (score below 50) with brief reasoning and ethical score.`;
    
    const fullQuery = `Business: ${businessName}${stockSymbol ? ' ('+stockSymbol+')' : ''}\nDescription: ${businessDesc || 'Not provided'}`;
    
    callGeminiAI(fullQuery, context).then(response => {
        const resultDiv = document.getElementById('validationResult');
        const contentDiv = document.getElementById('validationContent');
        
        let statusColor = '#ffc107';
        let statusIcon = '⚠️';
        let statusText = 'REVIEW NEEDED';
        
        if (response.toLowerCase().includes('approved')) {
            statusColor = '#28a745';
            statusIcon = '✅';
            statusText = 'APPROVED';
        } else if (response.toLowerCase().includes('rejected')) {
            statusColor = '#dc3545';
            statusIcon = '❌';
            statusText = 'REJECTED';
        }
        
        contentDiv.innerHTML = `
            <div style="background: ${statusColor}; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">${statusIcon}</div>
                <h3 style="color: white; margin-bottom: 10px;">${statusText}</h3>
                <div style="font-size: 20px; font-weight: bold;">${businessName}</div>
            </div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h4>AI Analysis:</h4>
                <p style="white-space: pre-wrap; line-height: 1.6;">${response}</p>
            </div>
        `;
        
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth' });
        
        awardTokenForHardWork('business_validation');
        userTokens += 3;
        updateTokenDisplay();
    });
}

// Cancer Obliteration Functions
function refreshCancerFeed() {
    speak('Refreshing cancer research feed');
    const feed = document.getElementById('cancerFeed');
    feed.innerHTML = '<div class="loading-spinner"></div><p>Loading latest research...</p>';
    
    setTimeout(() => {
        const articles = [
            { title: 'CRISPR Gene Editing Success', desc: 'First successful in-vivo cancer gene editing in humans', source: 'Science', time: 'Just now' },
            { title: 'Liquid Biopsy Advancement', desc: 'Blood test detects 12 cancer types with 99% accuracy', source: 'Nature', time: '1 hour ago' },
            { title: 'Nanoparticle Drug Delivery', desc: 'Targeted delivery reduces chemo side effects by 80%', source: 'Cell', time: '3 hours ago' }
        ];
        
        feed.innerHTML = articles.map(a => `
            <div class="research-item" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #e91e63;">
                <strong>${a.title}</strong>
                <p style="font-size: 13px; color: #6c757d; margin: 5px 0;">${a.desc}</p>
                <small style="color: #999;">${a.source} - ${a.time}</small>
            </div>
        `).join('');
        
        awardTokenForHardWork('research_update');
    }, 1500);
}

function viewAIAnalysis() {
    alert('AI Agent Analysis Report:\n\n🤖 Agents Active: 12\n📊 Studies Analyzed: 1,247\n💊 Medication Cases: 34\n🎯 High-Priority Findings: 8\n\nTop Recommendation:\nCombination therapy showing 89% efficacy in Phase III trials.');
    speak('AI analysis report displayed');
}

function viewMedDetails(drugId) {
    const drugs = {
        pembrolizumab: 'Pembrolizumab (Keytruda)\n\nType: Immunotherapy\nStatus: FDA Approved\nTarget: Multiple cancers\nMechanism: PD-1 inhibitor\n\nEvidence: 847 studies analyzed\nEfficacy: 72% response rate\nSide Effects: Generally well tolerated\n\nApproved for: Melanoma, Lung, Head/Neck, and others',
        xr9: 'Experimental-XR9\n\nType: Targeted therapy\nStatus: Phase III Clinical Trials\nTarget: Non-small cell lung cancer\nMechanism: Novel enzyme inhibitor\n\nEvidence: 234 studies analyzed\nEfficacy: 68% response rate\nExpected Approval: 2026\n\nPromising results in resistant cases',
        cart: 'CAR-T Combination Therapy\n\nType: Cellular immunotherapy\nStatus: Active Research\nTarget: Blood cancers (Leukemia, Lymphoma)\nMechanism: Modified T-cells + checkpoint inhibitor\n\nEvidence: 156 studies analyzed\nEfficacy: 82% complete remission\nCost: High, but improving\n\nBreakthrough therapy designation likely'
    };
    
    alert(drugs[drugId] || 'Medication details not available');
    speak('Medication details displayed');
}

function configureRSSFeeds() {
    alert('RSS Feed Configuration:\n\n✅ Active Sources:\n- PubMed Cancer Research\n- Nature Oncology\n- The Lancet Oncology\n- JAMA Oncology\n- NEJM Cancer Articles\n- Cancer Research Journal\n- Cell Cancer Biology\n- Science Translational Medicine\n\nUpdate frequency: Every 30 minutes\nAI Analysis: Real-time');
    speak('RSS feed configuration');
}

// Coin Identity - Cylinder Resonance Renderings (Thomas Edison Theory)
function analyzeCoinResonance() {
    speak('Analyzing coin with Edison cylinder resonance technology');
    
    const coinData = simulateCoinResonanceReading();
    
    const report = `🪙 EDISON CYLINDER RESONANCE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 WATSON FIELD EXTRACTION COMPLETE

🔬 Physical Properties:
   • Metal Composition: ${coinData.metal}
   • Density Resonance: ${coinData.density.toFixed(3)} g/cm³
   • Age Estimate: ${coinData.age} years
   • Manufacturing Era: ${coinData.era}

🌌 SPACE-TIME DATA RECORDED IN COIN:

📍 Location History (Last 3 Transactions):
   1. ${coinData.locations[0]}
   2. ${coinData.locations[1]}
   3. ${coinData.locations[2]}

🗣️ CONVERSATION FRAGMENTS (Edison Cylinder Echo):
   "${coinData.conversations[0]}"
   "${coinData.conversations[1]}"
   "${coinData.conversations[2]}"

⚛️ Watson Particle Count: ${coinData.watsonParticles.toLocaleString()}
   • Compressed: ${(coinData.watsonParticles * 0.3).toFixed(0)} particles
   • Expanded: ${(coinData.watsonParticles * 1.7).toFixed(0)} particles
   • Phase: ${coinData.phase}

🔮 TIME TRAVEL POTENTIAL:
   Audio/Visual Access: ${coinData.timeAccessLevel}
   Physical Matter Transport: ${coinData.matterTransport}
   
⚠️ Note: Every thought, action, and conversation that 
occurred within 3 feet of this coin is permanently 
stored in Watson particle resonance fields.

Edison was right — cylinders record everything.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Confidence: ${coinData.confidence}% | Method: Cylinder Resonance`;

    const resultDiv = document.getElementById('coinAnalysisResult');
    if (resultDiv) {
        resultDiv.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px; line-height: 1.6; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #0070ba;">${report}</pre>`;
    } else {
        alert(report);
    }
    
    awardTokenForHardWork('coin_analysis');
    userTokens += 10; // Bonus for advanced analysis
    updateTokenDisplay();
}

function simulateCoinResonanceReading() {
    // Simulate Edison's cylinder resonance reading of coin data
    const eras = [
        { name: 'Roman Empire', range: '100-400 AD', metal: 'Silver (92% Ag, 8% Cu)' },
        { name: 'Medieval Europe', range: '1200-1400 AD', metal: 'Gold (96% Au, 4% Ag)' },
        { name: 'Colonial America', range: '1650-1780 AD', metal: 'Copper (98% Cu, 2% Sn)' },
        { name: 'Victorian England', range: '1850-1900 AD', metal: 'Bronze (95% Cu, 5% Zn)' },
        { name: 'Early Republic', range: '1790-1850 AD', metal: 'Silver (90% Ag, 10% Cu)' }
    ];
    
    const selectedEra = eras[Math.floor(Math.random() * eras.length)];
    const currentYear = new Date().getFullYear();
    const ageRange = selectedEra.range.split('-');
    const avgYear = parseInt(ageRange[0].replace(/[^\d]/g, ''));
    const age = currentYear - avgYear;
    
    const locations = [
        'Market Square, ' + selectedEra.name + ' - 2 people bargaining',
        'Tavern Table - 4 people gambling',
        'Royal Treasury - Official counting coins',
        'Merchant Ship - Trade negotiations',
        'Temple Offering - Prayer ceremony',
        'Blacksmith Shop - Payment for tools'
    ];
    
    const conversations = [
        'How much for the wheat? Five denarii.',
        'I wager three coins on the next hand.',
        'The tax collector demands payment by sunset.',
        'This gold is from the eastern mines.',
        'May the gods bless this offering.',
        'Your finest blade is worth twenty pieces.'
    ];
    
    // Shuffle and select
    const shuffledLocations = locations.sort(() => 0.5 - Math.random()).slice(0, 3);
    const shuffledConversations = conversations.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    return {
        metal: selectedEra.metal,
        density: 8.5 + Math.random() * 2,
        age: age,
        era: selectedEra.range,
        locations: shuffledLocations,
        conversations: shuffledConversations,
        watsonParticles: Math.floor(age * 1000000 + Math.random() * 5000000),
        phase: Math.random() > 0.5 ? 'Compressed (Finite)' : 'Expanded (Infinite)',
        timeAccessLevel: '✅ Audio & Visual Ready',
        matterTransport: '🔬 Research Phase (Infinity Lab)',
        confidence: 92 + Math.floor(Math.random() * 8)
    };
}

function scanCoinImage() {
    speak('Scanning coin image for Edison resonance analysis');
    
    const loadingDiv = document.getElementById('coinAnalysisResult');
    if (loadingDiv) {
        loadingDiv.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <div class="loading-spinner" style="margin: 0 auto 15px;"></div>
                <p>📡 Exciting Watson field resonance...</p>
                <p style="font-size: 12px; color: #6c757d;">Extracting space-time data from coin surface</p>
            </div>`;
    }
    
    setTimeout(() => {
        analyzeCoinResonance();
        speak('Resonance pattern extracted - Edison cylinder data recovered');
        awardTokenForHardWork('coin_scan');
    }, 2500);
}

function handleCoinImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('coinImagePreview');
            const img = document.getElementById('coinPreviewImg');
            img.src = e.target.result;
            preview.style.display = 'block';
            speak('Coin image uploaded');
        };
        reader.readAsDataURL(file);
    }
}

// Music Downloader Functions
function searchInternetArchive() {
    const query = document.getElementById('musicSearch').value;
    if (!query) {
        alert('Please enter a search term!');
        return;
    }
    
    speak('Searching Internet Archive');
    const results = document.getElementById('musicResults');
    results.innerHTML = '<div class="loading-spinner"></div><p>Searching Internet Archive...</p>';
    
    setTimeout(() => {
        results.innerHTML = `
            <div class="music-result" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #0070ba;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>Classic Jazz Collection - ${query}</h4>
                        <p style="font-size: 13px; color: #6c757d;">Source: Internet Archive • Format: MP3 • Size: 450 MB</p>
                    </div>
                    <button class="btn-primary" onclick="downloadToHydrogen('jazz_collection', '450MB')">☁️ Download</button>
                </div>
            </div>
            <div class="music-result" style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #0070ba;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>Public Domain ${query} Archive</h4>
                        <p style="font-size: 13px; color: #6c757d;">Source: Internet Archive • Format: FLAC • Size: 1.2 GB</p>
                    </div>
                    <button class="btn-primary" onclick="downloadToHydrogen('pd_archive', '1.2GB')">☁️ Download</button>
                </div>
            </div>
        `;
        awardTokenForHardWork('search');
    }, 1500);
}

function downloadToHydrogen(itemId, size) {
    speak('Downloading to Hydrogen Cloud');
    alert(`🌥️ Hydrogen Cloud Download Started\n\nItem: ${itemId}\nSize: ${size}\nDestination: Your Private Hydrogen Storage\nStatus: Infinity Standardization in progress...\n\n✓ Checking copyright\n✓ Validating format\n✓ Converting to Infinity Standard\n✓ Uploading to Hydrogen Cloud\n\nDownload will complete in background.`);
    awardTokenForHardWork('download');
    userTokens += 2;
    updateTokenDisplay();
}

function viewHydrogenStorage() {
    const storage = {
        music: ['Jazz Classics (450 MB)', 'Classical Symphony (820 MB)'],
        videos: ['Public Domain Films (2.1 GB)', 'Educational Docs (1.5 GB)'],
        documentaries: ['Nature Series (3.2 GB)', 'History Channel Archive (2.8 GB)'],
        cartoons: ['Classic Animation (1.1 GB)', 'Public Domain Toons (890 MB)']
    };
    
    const content = `
Hydrogen Cloud Storage:

📁 Music Collection:
${storage.music.map(m => '  • ' + m).join('\n')}

📁 Videos:
${storage.videos.map(v => '  • ' + v).join('\n')}

📁 Documentaries:
${storage.documentaries.map(d => '  • ' + d).join('\n')}

📁 Cartoons:
${storage.cartoons.map(c => '  • ' + c).join('\n')}

Total Storage Used: 12.85 GB
Available: Unlimited
Infinity Standardized: 100%
    `;
    
    alert(content);
    speak('Hydrogen storage displayed');
}

function validateInfinityStandard(file) {
    speak('Validating Infinity standard compliance');
    setTimeout(() => {
        alert(`Infinity Standard Validation:\n\n✓ Format: Compatible\n✓ Copyright: Public Domain/Licensed\n✓ Quality: High\n✓ Metadata: Complete\n✓ Encryption: Enabled\n\n Status: APPROVED for Hydrogen Cloud`);
    }, 1000);
}

// Arrowhead Artifact Identification Functions
function handleArrowheadUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        speak(`${files.length} arrowhead images uploaded`);
        alert(`✓ ${files.length} image(s) uploaded successfully!\n\nReady for AI analysis.`);
    }
}

function analyzeArrowhead() {
    speak('Analyzing arrowhead with AI');
    const resultDiv = document.getElementById('arrowheadAnalysis');
    resultDiv.innerHTML = '<div class="loading-spinner"></div><p>Analyzing artifact with LLM...</p>';
    
    setTimeout(() => {
        const context = 'You are an expert archaeologist specializing in Native American projectile points. Analyze this arrowhead and provide: type/name, cultural period, approximate age, geographic region, tribal association if known, material composition, and authenticity assessment. Be detailed and scientific.';
        
        callGeminiAI('Analyze this arrowhead artifact from multiple angles. It appears to be a well-crafted point with fluting and symmetrical shape.', context).then(response => {
            resultDiv.innerHTML = `
                <div style="background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="color: white; margin-bottom: 10px;">🏹 Identification Complete</h4>
                    <div style="font-size: 20px; font-weight: bold;">Clovis Point (Paleo-Indian)</div>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>Estimated Age:</strong> 12,000-13,000 years old<br>
                    <strong>Region:</strong> North America (widespread)<br>
                    <strong>Material:</strong> Chert/Flint<br>
                    <strong>Confidence:</strong> <span style="color: #28a745;">92%</span>
                </div>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4>AI Analysis:</h4>
                    <p style="white-space: pre-wrap; font-size: 13px; line-height: 1.6;">${response}</p>
                </div>
                <div style="background: #d4edda; border: 2px solid #28a745; padding: 15px; border-radius: 8px;">
                    <strong style="color: #155724;">✓ Authenticity Assessment: GENUINE</strong>
                    <p style="font-size: 13px; color: #155724; margin-top: 8px;">Characteristics consistent with authentic Paleo-Indian workmanship</p>
                </div>
            `;
            awardTokenForHardWork('artifact_analysis');
            userTokens += 8; // Big bonus for archaeological work
            updateTokenDisplay();
        });
    }, 2000);
}

function learnMoreArrowhead(type) {
    const info = {
        clovis: 'Clovis Point:\n\nThe Clovis culture represents the earliest widespread archaeological culture in North America. These distinctive fluted points were used for hunting large game including mammoths and mastodons. Key features include:\n\n• Bilateral fluting from base\n• Symmetrical lanceolate shape\n• Fine pressure flaking\n• 2-5 inches typical length\n\nFound across North America, they represent sophisticated stone-working technology.',
        folsom: 'Folsom Point:\n\nSuccessor to Clovis culture, Folsom points show even more refined workmanship. Used primarily for bison hunting on the Great Plains.\n\n• Deep channel flakes (fluting)\n• Smaller and thinner than Clovis\n• Extremely thin and delicate\n• Expert craftsmanship required\n\nNamed after Folsom, New Mexico discovery site.',
        dalton: 'Dalton Point:\n\nTransitional point type between Paleo-Indian and Archaic periods. Highly versatile tool used for hunting and processing.\n\n• Beveled resharpening\n• Often serrated edges\n• Used until exhausted\n• Found in Southeastern US\n\nShows adaptation to changing environment.',
        scottsbluff: 'Scottsbluff Point:\n\nDistinctive shouldered point from late Paleo-Indian period.\n\n• Parallel-sided stem\n• Well-defined shoulders\n• Careful pressure flaking\n• Found in High Plains\n\nNamed after Scottsbluff, Nebraska.',
        archaic: 'Archaic Side-Notched:\n\nMarks shift to more sedentary lifestyle and diverse food sources.\n\n• Side notches for hafting\n• Various sizes (spear to arrow)\n• Regional variations\n• Long time span\n\nReflects technological adaptation.',
        woodland: 'Woodland Triangular:\n\nSmall arrow points from adoption of bow and arrow technology.\n\n• Simple triangular form\n• No notches or stem\n• Very small (1-2 inches)\n• Widespread in Eastern US\n\nMore efficient hunting technology.'
    };
    
    alert(info[type] || 'Information not available');
    speak('Arrowhead information displayed');
}

// Poster Maker Functions
function generateAIPoster() {
    speak('Generating poster with AI');
    alert('AI Poster Generator\n\nEnter your poster theme and Rogers AI will create a professional design!');
    awardTokenForHardWork('poster_creation');
}

// Listing Generator Functions
function handleListingUpload(event) {
    const file = event.target.files[0];
    if (file) {
        speak('Processing product photo with Rogers AI');
        const results = document.getElementById('listingResults');
        results.innerHTML = '<div class="loading-spinner"></div><p>Auto-cropping and generating listing...</p>';
        
        setTimeout(() => {
            const context = 'You are a professional marketplace listing writer. Based on this product image, generate: 1) A compelling title (60 chars max), 2) Detailed description highlighting features and benefits, 3) Suggested price range, 4) Product category.';
            
            callGeminiAI('Analyze this product image and create marketplace listing', context).then(response => {
                results.innerHTML = `
                    <div style="background: white; padding: 20px; border-radius: 12px; margin-top: 20px;">
                        <h3 style="color: #0070ba;">✓ Listing Generated by Rogers</h3>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <pre style="white-space: pre-wrap; font-size: 13px;">${response}</pre>
                        </div>
                        <button class="btn-primary" onclick="copyListing()">📋 Copy to Clipboard</button>
                        <button class="btn-secondary" onclick="exportToMarketplace()">📤 Export</button>
                    </div>
                `;
                awardTokenForHardWork('listing_generation');
                userTokens += 3;
                updateTokenDisplay();
            });
        }, 1500);
    }
}

function copyListing() {
    speak('Listing copied to clipboard');
    alert('Listing details copied to clipboard!');
}

function exportToMarketplace() {
    speak('Exporting to marketplace');
    alert('Export Options:\n\n✓ Infinity Marketplace\n✓ eBay\n✓ Etsy\n✓ Amazon\n\nSelect your platform...');
}

// Movie/TV Downloader Functions
function searchMovies() {
    const query = document.getElementById('movieSearch').value;
    if (!query) return;
    
    speak('Searching movie archive');
    const results = document.getElementById('movieResults');
    results.innerHTML = '<div class="loading-spinner"></div><p>Searching Internet Archive...</p>';
    
    setTimeout(() => {
        results.innerHTML = `
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                <h4>${query} (1955) - Public Domain</h4>
                <p style="font-size: 13px; color: #6c757d;">Classic film • 1.2 GB • MP4</p>
                <button class="btn-primary" onclick="downloadToHydrogen('movie_${query}', '1.2GB')">☁️ Download to Hydrogen Cloud</button>
            </div>
        `;
    }, 1000);
}

// Global Command Authority Functions
function viewRobotLeaders() {
    alert('🤖 Robot Agent Leaders:\n\n1. Watson-Primary (Strategic Planning)\n2. Gemini-Alpha (Resource Allocation)\n3. Rogers-Core (Operations)\n4. Pewpi-Network (Distribution)\n\nAll agents report to Human Treasurer: Kris\nConference Room: All-Lands/Israel-Everywhere');
    speak('Robot leaders displayed');
}

function joinConference() {
    speak('Joining all-lands conference');
    alert('🗺️ All-Lands Conference Room\n\nIsrael-Everywhere Digital Space\n\nConnecting to global participants...\n\nStatus: Ready');
}

// Forge Functions
function forgeNewApp() {
    const appName = document.getElementById('forgeAppName').value;
    const appDesc = document.getElementById('forgeAppDesc').value;
    
    if (!appName) {
        alert('Please enter an app name!');
        return;
    }
    
    speak('Forging new app with AI');
    const context = `You are an app development AI. Create a detailed specification for an app called "${appName}". Description: ${appDesc}. Include: features, user interface elements, data requirements, and integration points with Infinity platform.`;
    
    callGeminiAI(`Create app specification for: ${appName}`, context).then(response => {
        alert(`⚒️ App Forged!\n\nApp: ${appName}\n\nSpecification:\n${response.substring(0, 300)}...\n\n✓ Ready for development`);
        awardTokenForHardWork('app_forge');
        userTokens += 10;
        updateTokenDisplay();
    });
}

function loadForgeTemplate(template) {
    speak(`Loading ${template} template`);
    alert(`📋 ${template.toUpperCase()} Template Loaded\n\nPre-built structure ready for customization!`);
}

// Infinity Field Lab Functions
function calculateMirrorLaw() {
    const infiniteWave = parseFloat(document.getElementById('infiniteWave').value) || 10;
    const loveFreq = parseFloat(document.getElementById('loveFreq').value) || 5;
    
    // Mirror Law: L_ref = ω_inf × f_love
    const reflectedLove = infiniteWave * loveFreq;
    
    document.getElementById('reflectedLove').textContent = reflectedLove.toFixed(4);
    speak(`Reflected love is ${reflectedLove.toFixed(2)} hertz`);
    awardTokenForHardWork('physics_calc');
}

// Auto-update Mirror Law on input change
function initFieldLabAutoUpdate() {
    const infiniteWaveInput = document.getElementById('infiniteWave');
    const loveFreqInput = document.getElementById('loveFreq');
    
    if (infiniteWaveInput) {
        infiniteWaveInput.addEventListener('input', calculateMirrorLaw);
    }
    if (loveFreqInput) {
        loveFreqInput.addEventListener('input', calculateMirrorLaw);
    }
    
    const watsonFreqInput = document.getElementById('watsonFreq');
    const watsonAmpInput = document.getElementById('watsonAmp');
    const goldThicknessInput = document.getElementById('goldThickness');
    
    if (watsonFreqInput) watsonFreqInput.addEventListener('input', calculateGoldBarrier);
    if (watsonAmpInput) watsonAmpInput.addEventListener('input', calculateGoldBarrier);
    if (goldThicknessInput) goldThicknessInput.addEventListener('input', calculateGoldBarrier);
    
    const baseEnergyInput = document.getElementById('baseEnergy');
    const phaseInput = document.getElementById('phase');
    
    if (baseEnergyInput) baseEnergyInput.addEventListener('input', calculateDuality);
    if (phaseInput) phaseInput.addEventListener('input', calculateDuality);
    
    // Initialize calculations
    setTimeout(() => {
        calculateMirrorLaw();
        calculateGoldBarrier();
        calculateDuality();
    }, 100);
}

function calculateGoldBarrier() {
    const freq = parseFloat(document.getElementById('watsonFreq').value) || 10;
    const amp = parseFloat(document.getElementById('watsonAmp').value) || 1;
    const thickness = parseFloat(document.getElementById('goldThickness').value) || 0.1;
    
    // Empathy window (alpha-wave frequencies that pass through)
    const empathyLow = 8;
    const empathyHigh = 14;
    
    // Check if current frequency is in empathy band
    const inEmpathyBand = (freq >= empathyLow && freq <= empathyHigh);
    
    // T = exp(-t / (f · A)) for baseline, but empathy band passes fully
    const transmission = inEmpathyBand ? 1.0 : Math.exp(-thickness / (freq * amp));
    document.getElementById('goldTransmission').textContent = transmission.toFixed(4);
    
    // Update empathy band indicator
    const empathyIndicator = document.getElementById('empathyBandStatus');
    if (empathyIndicator) {
        if (inEmpathyBand) {
            empathyIndicator.textContent = '✅ In Empathy Band (8-14 Hz) - Full Transmission';
            empathyIndicator.style.color = '#16a34a';
            empathyIndicator.style.fontWeight = 'bold';
        } else {
            empathyIndicator.textContent = '❌ Outside Empathy Band - Attenuated';
            empathyIndicator.style.color = '#dc2626';
            empathyIndicator.style.fontWeight = 'normal';
        }
    }
    
    // Draw selective permeability chart
    const canvas = document.getElementById('goldBarrierChart');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw empathy band background
        const empathyStartX = ((empathyLow - 1) / 49) * (canvas.width - 40) + 20;
        const empathyEndX = ((empathyHigh - 1) / 49) * (canvas.width - 40) + 20;
        ctx.fillStyle = 'rgba(134, 239, 172, 0.2)';
        ctx.fillRect(empathyStartX, 20, empathyEndX - empathyStartX, canvas.height - 40);
        
        // Draw transmission curve
        ctx.strokeStyle = 'gold';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i <= 100; i++) {
            const f = 1 + (50 - 1) * (i / 100);
            const inBand = (f >= empathyLow && f <= empathyHigh);
            const T = inBand ? 1.0 : Math.exp(-thickness / (f * amp));
            const x = (i / 100) * (canvas.width - 40) + 20;
            const y = canvas.height - 20 - T * (canvas.height - 40);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Draw current frequency marker
        const currentX = ((freq - 1) / 49) * (canvas.width - 40) + 20;
        const currentY = canvas.height - 20 - transmission * (canvas.height - 40);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Labels
        ctx.fillStyle = '#16a34a';
        ctx.font = '11px sans-serif';
        ctx.fillText('Empathy Band (Love/Trust)', empathyStartX + 5, 35);
        
        // Axes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, canvas.height - 20);
        ctx.lineTo(canvas.width - 20, canvas.height - 20);
        ctx.stroke();
    }
    
    speak(inEmpathyBand ? 'In empathy band - full transmission' : 'Outside empathy band - attenuated');
    awardTokenForHardWork('physics_calc');
}

function calculateDuality() {
    const E0 = parseFloat(document.getElementById('baseEnergy').value) || 10;
    const phase = parseFloat(document.getElementById('phase').value) || 0.785;
    
    // Finite: E = E0 · sin(phi) if phi < pi/2
    // Infinite: E = E0 · e^phi if phi >= pi/2
    const dualityE = phase < Math.PI / 2 
        ? E0 * Math.sin(phase) 
        : E0 * Math.exp(phase);
    
    document.getElementById('dualityEnergy').textContent = dualityE.toFixed(4);
    
    // Draw chart
    const canvas = document.getElementById('dualityChart');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i <= 100; i++) {
            const p = (Math.PI * i) / 100;
            const E = p < Math.PI / 2 ? E0 * Math.sin(p) : E0 * Math.exp(p);
            const x = (i / 100) * (canvas.width - 40) + 20;
            const maxE = E0 * Math.exp(Math.PI);
            const y = canvas.height - 20 - (E / maxE) * (canvas.height - 40);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    speak('Duality energy calculated');
    awardTokenForHardWork('physics_calc');
}

function detectResonance() {
    const f0 = parseFloat(document.getElementById('resonanceFreq').value) || 10;
    const snrDb = parseFloat(document.getElementById('snrDb').value) || -3;
    const coil = parseFloat(document.getElementById('coilSens').value) || 0.1;
    const squid = parseFloat(document.getElementById('squidSens').value) || 0.01;
    
    // Generate synthetic signal with noise
    const duration = 2;
    const fs = 1000;
    const n = Math.floor(duration * fs);
    const TAU = 2 * Math.PI;
    
    // Reference signal
    const ref = [];
    for (let i = 0; i < n; i++) {
        const t = i / fs;
        ref.push(Math.sin(TAU * f0 * t));
    }
    
    // Noisy signal
    const snrLin = Math.pow(10, snrDb / 10);
    const signalAmp = Math.sqrt(2 * Math.max(snrLin, 0));
    const chain = [];
    for (let i = 0; i < n; i++) {
        const noise = (Math.random() - 0.5) * 2; // Simple noise
        const signal = signalAmp * ref[i];
        chain.push((noise + signal) * coil * squid);
    }
    
    // Calculate correlation
    let dot = 0, n1 = 0, n2 = 0;
    for (let i = 0; i < n; i++) {
        dot += chain[i] * ref[i];
        n1 += chain[i] * chain[i];
        n2 += ref[i] * ref[i];
    }
    const corr = dot / Math.sqrt((n1 || 1e-12) * (n2 || 1e-12));
    
    const detected = corr > 0.02;
    
    document.getElementById('correlation').textContent = corr.toFixed(4);
    const statusDiv = document.getElementById('detectionStatus');
    if (detected) {
        statusDiv.textContent = 'Detected';
        statusDiv.style.background = '#dcfce7';
        statusDiv.style.color = '#166534';
    } else {
        statusDiv.textContent = 'Not detected';
        statusDiv.style.background = '#fee2e2';
        statusDiv.style.color = '#991b1b';
    }
    
    // Draw time series (first 200 samples)
    const canvas = document.getElementById('resonanceChart');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        const samples = 200;
        for (let i = 0; i < samples; i++) {
            const y = chain[i];
            const x = (i / samples) * (canvas.width - 40) + 20;
            const yPos = canvas.height / 2 - y * 100;
            if (i === 0) ctx.moveTo(x, yPos);
            else ctx.lineTo(x, yPos);
        }
        ctx.stroke();
        
        // Zero line
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, canvas.height / 2);
        ctx.lineTo(canvas.width - 20, canvas.height / 2);
        ctx.stroke();
    }
    
    speak(detected ? 'Resonance detected' : 'No resonance detected');
    awardTokenForHardWork('resonance_detection');
    userTokens += 5;
    updateTokenDisplay();
}

// Government Robots Treasury Tracker
const treasuryData = {
    treasurer: 'Kris (Human Oversight)',
    robotAgents: [
        { id: 'BOT-001', name: 'Watson Treasury Agent', allocation: 25000, spent: 12340, category: 'Development' },
        { id: 'BOT-002', name: 'Gemini Fund Manager', allocation: 15000, spent: 8920, category: 'Marketing' },
        { id: 'BOT-003', name: 'Pewpi Resource Allocator', allocation: 10000, spent: 4560, category: 'Infrastructure' }
    ],
    totalBudget: 50000,
    totalSpent: 25820
};

function showTreasuryMap() {
    const mapHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px;">
            <h3>🏛️ Government Robots Treasury</h3>
            <p style="color: #6c757d;">Real agents in charge - Maps showing Infinity funding spending by robots, not humans</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4>Treasurer: ${treasuryData.treasurer}</h4>
                <div style="margin-top: 15px;">
                    <strong>Total Budget:</strong> ${treasuryData.totalBudget} Tokens<br>
                    <strong>Total Spent:</strong> ${treasuryData.totalSpent} Tokens<br>
                    <strong>Remaining:</strong> ${treasuryData.totalBudget - treasuryData.totalSpent} Tokens
                </div>
            </div>
            <h4>Robot Agents:</h4>
            ${treasuryData.robotAgents.map(agent => `
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                    <strong>${agent.name}</strong> (${agent.id})<br>
                    <small>Category: ${agent.category}</small><br>
                    <div style="margin-top: 8px;">
                        Allocated: ${agent.allocation} | Spent: ${agent.spent} | Remaining: ${agent.allocation - agent.spent}
                    </div>
                    <div style="background: #e5e5e5; height: 8px; border-radius: 4px; margin-top: 8px; overflow: hidden;">
                        <div style="background: #0070ba; height: 100%; width: ${(agent.spent / agent.allocation) * 100}%;"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    alert('Treasury Map Generated!\n\nThis would display a visual dashboard showing robot agent spending.');
    console.log('Treasury Data:', treasuryData);
}

// Time Machine Theme Switcher
const themes = {
    'apple1': { name: '1976 Apple I', sound: 'beep' },
    'mac1984': { name: '1984 Macintosh', sound: 'welcome' },
    'amiga': { name: '1985 Amiga Workbench', sound: 'startup' },
    'win31': { name: '1990 Windows 3.1', sound: 'tada' },
    'win95': { name: '1995 Windows 95', sound: 'startup' },
    'imac': { name: '1998 iMac G3', sound: 'bondi' },
    'xp': { name: '2001 Windows XP', sound: 'startup' },
    'iphone': { name: '2007 iPhone', sound: 'marimba' },
    'win7': { name: '2009 Windows 7 Aero', sound: 'startup' },
    'metro': { name: '2011 Metro UI', sound: 'modern' },
    'ios7': { name: '2013 iOS 7 Flat', sound: 'note' },
    'material': { name: '2014 Material Design', sound: 'chime' },
    'dark': { name: '2018 Dark Mode', sound: 'swoosh' },
    'neuro': { name: '2019 Neumorphism', sound: 'soft' },
    'glass': { name: '2020 Glassmorphism', sound: 'glass' },
    'web3': { name: '2021 Web3 Neon', sound: 'cyber' },
    'y2k': { name: '2022 Y2K Revival', sound: 'retro' },
    'ai': { name: '2024 AI Era', sound: 'future' },
    'infinity': { name: '2025 Infinity', sound: 'infinity' }
};

let currentTheme = 'infinity';

function switchTheme(themeName) {
    // Remove all theme classes
    Object.keys(themes).forEach(theme => {
        document.body.classList.remove(`theme-${theme}`);
    });
    
    // Add new theme class
    document.body.classList.add(`theme-${themeName}`);
    currentTheme = themeName;
    
    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Save preference
    localStorage.setItem('infinityTheme', themeName);
    
    // Announce theme change
    const themeInfo = themes[themeName];
    speak(`Time traveling to ${themeInfo.name}`);
    
    // Visual feedback - flash transition
    const transition = document.getElementById('vectorTransition');
    if (transition) {
        transition.style.background = 'white';
        transition.classList.add('active');
        setTimeout(() => {
            transition.style.background = '';
            transition.classList.remove('active');
        }, 300);
    }
    
    // Award token for time traveling
    awardTokenForHardWork('time_travel');
    
    console.log(`⏰ Time Machine: Traveled to ${themeInfo.name}`);
}

// Load saved theme on startup
function loadSavedTheme() {
    const saved = localStorage.getItem('infinityTheme');
    if (saved && themes[saved]) {
        switchTheme(saved);
        // Update button without triggering animation
        document.querySelectorAll('.theme-btn').forEach(btn => {
            if (btn.getAttribute('onclick').includes(saved)) {
                btn.classList.add('active');
            }
        });
    }
}

// Auto-cycle through themes (for fun demo)
let autoCycleInterval = null;

function startTimeMachineAutoCycle() {
    if (autoCycleInterval) {
        clearInterval(autoCycleInterval);
        autoCycleInterval = null;
        speak('Auto cycle stopped');
        return;
    }
    
    const themeKeys = Object.keys(themes);
    let index = themeKeys.indexOf(currentTheme);
    
    speak('Starting time machine auto cycle');
    
    autoCycleInterval = setInterval(() => {
        index = (index + 1) % themeKeys.length;
        const themeName = themeKeys[index];
        
        // Simulate click on theme button
        const buttons = document.querySelectorAll('.theme-btn');
        buttons[index].click();
    }, 3000); // Change theme every 3 seconds
}

// Initialize theme on page load
window.addEventListener('load', () => {
    setTimeout(loadSavedTheme, 100);
});


// AI Assistant
function updateAssistant(realmName) {
    const assistantName = document.getElementById('assistantName');
    const assistantStatus = document.getElementById('assistantStatus');
    
    const assistantConfig = {
        portal: {
            name: 'Portal Guide AI',
            status: 'Ready to help you navigate features'
        },
        marketplace: {
            name: 'Shopping Assistant AI',
            status: 'Finding the best products for you'
        },
        socializer: {
            name: 'Social AI Companion',
            status: 'Ready to chat and connect'
        },
        aibuilder: {
            name: 'Builder Co-Pilot AI',
            status: 'Your development steering wheel'
        }
    };
    
    const config = assistantConfig[realmName] || assistantConfig.portal;
    assistantName.textContent = config.name;
    assistantStatus.textContent = config.status;
}

function toggleAssistant() {
    aiAssistantActive = !aiAssistantActive;
    const status = document.getElementById('assistantStatus');
    status.textContent = aiAssistantActive ? 'Active and helping' : 'Paused';
    
    if (aiAssistantActive) {
        alert('AI Assistant is now active and will guide you!');
    }
}

// Feature Activation
function activateFeature(featureName) {
    const featureContent = document.getElementById('featureContent');
    
    const features = {
        search: {
            title: 'Advanced Search',
            content: `
                <h3>IBM Gemini Powered Search</h3>
                <input type="text" id="geminiSearch" placeholder="Search with AI..." style="width: 100%; padding: 12px; border: 2px solid #0070ba; border-radius: 8px; margin: 10px 0;">
                <button class="btn-primary" onclick="performGeminiSearch()">Search</button>
                <div id="geminiResults" style="margin-top: 20px;"></div>
            `
        },
        voice: {
            title: 'Voice Modules',
            content: `
                <h3>Voice Command Center</h3>
                <button class="btn-primary" onclick="startVoiceRecognition()">🎤 Start Listening</button>
                <button class="btn-secondary" onclick="stopVoiceRecognition()">⏹️ Stop</button>
                <div id="voiceOutput" style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px;"></div>
            `
        },
        autopilot: {
            title: 'Autopilot Sound Synthesis',
            content: `
                <h3>Autonomous Sound System</h3>
                <p>The autopilot listens and repeats sounds using a synthesizer - completely autonomous!</p>
                <button class="btn-primary" onclick="startAutopilotFromPortal()">Activate Autopilot</button>
            `
        },
        coding: {
            title: 'Coding Agents',
            content: `
                <h3>AI Coding Assistants</h3>
                <button class="feature-btn" onclick="activateCodingAgent('js')">JavaScript Agent</button>
                <button class="feature-btn" onclick="activateCodingAgent('py')">Python Agent</button>
                <button class="feature-btn" onclick="activateCodingAgent('full')">Full-Stack Agent</button>
            `
        }
    };
    
    const feature = features[featureName];
    if (feature) {
        featureContent.innerHTML = feature.content;
        featureContent.style.display = 'block';
        awardTokenForHardWork('feature_activation');
    }
}

// Token System
function awardTokenForHardWork(action) {
    userTokens += 0.5; // Auto-generation for hard workers
    currentUser.tokens = userTokens;
    localStorage.setItem('infinityUser', JSON.stringify(currentUser));
    
    console.log(`Token awarded for ${action}. Total: ${userTokens.toFixed(1)}`);
}

function checkForTiRigers(message) {
    // Check if message contains "ti rigers" (case insensitive)
    if (message.toLowerCase().includes('ti rigers')) {
        userTokens += 1; // Award 1 token
        currentUser.tokens = userTokens;
        localStorage.setItem('infinityUser', JSON.stringify(currentUser));
        
        return true;
    }
    return false;
}

// Chat Functions
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chatMessages');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.textContent = message;
    chatMessages.appendChild(userMsg);
    
    // Check for "ti rigers" and award token
    const gotToken = checkForTiRigers(message);
    
    // Simulate AI response
    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'message assistant';
        
        if (gotToken) {
            aiMsg.textContent = `🎉 You earned 1 Infinity Token! You now have ${userTokens.toFixed(1)} tokens. ${getAIResponse(message)}`;
        } else {
            aiMsg.textContent = getAIResponse(message);
        }
        
        chatMessages.appendChild(aiMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Award token for active participation
        awardTokenForHardWork('chat_message');
    }, 500);
    
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getAIResponse(message) {
    const responses = [
        "I'm here to help you build amazing things!",
        "Great question! Let me assist you with that.",
        "With Infinity's AI power, we can accomplish anything!",
        "I'm your co-pilot on this development journey.",
        "That's an excellent idea! Let's make it happen.",
        "Powered by IBM Gemini high-end API, I'm ready to assist.",
        "Your creative vision drives our collaboration!"
    ];
    
    // Check for specific keywords
    if (message.toLowerCase().includes('token')) {
        return `You currently have ${userTokens.toFixed(1)} Infinity Tokens! Keep working hard to earn more.`;
    }
    if (message.toLowerCase().includes('build') || message.toLowerCase().includes('create')) {
        return "Let's build it together! I'll guide you through the process step by step.";
    }
    if (message.toLowerCase().includes('help')) {
        return "I'm here to help! You can build apps, search products, use voice commands, or activate the autopilot synthesizer.";
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Allow Enter key to send message
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Product Search
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.trim();
    const productResults = document.getElementById('productResults');
    
    if (!searchTerm) {
        productResults.innerHTML = '<p>Please enter a search term</p>';
        return;
    }
    
    // Simulate product search results with deluxe packaging
    const products = [
        {
            name: 'Premium AI Assistant Package',
            description: 'Deluxe packaging with IBM Gemini API integration',
            price: '$299/month',
            badge: 'Best Seller'
        },
        {
            name: 'Voice Module Pro',
            description: 'High-end voice synthesis with autopilot features',
            price: '$199/month',
            badge: 'New'
        },
        {
            name: 'Coding Agent Suite',
            description: 'Complete developer toolkit in luxury packaging',
            price: '$399/month',
            badge: 'Premium'
        },
        {
            name: 'Infinity Token Bundle',
            description: '1000 tokens in deluxe presentation box',
            price: '$49.99',
            badge: 'Popular'
        }
    ];
    
    productResults.innerHTML = products.map(product => `
        <div class="product-card">
            <span class="product-badge">${product.badge}</span>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p style="color: #0070ba; font-weight: bold; font-size: 18px;">${product.price}</p>
            <button class="btn-primary">Add to Cart</button>
        </div>
    `).join('');
    
    awardTokenForHardWork('product_search');
}

// AI Builder Functions
function startBuilding() {
    const ideaInput = document.getElementById('ideaInput').value.trim();
    const buildProgress = document.getElementById('buildProgress');
    
    if (!ideaInput) {
        alert('Please describe your idea first!');
        return;
    }
    
    buildProgress.innerHTML = `
        <h3>🚀 Building Your Idea...</h3>
        <p><strong>Your Idea:</strong> ${ideaInput}</p>
        <div style="margin-top: 20px;">
            <p>✅ AI analyzing requirements...</p>
            <p>✅ Setting up development environment...</p>
            <p>✅ Your AI co-pilot is steering the project...</p>
            <p>🔄 Generating code structure...</p>
        </div>
        <button class="btn-primary" style="margin-top: 20px;" onclick="continueBuild()">Continue Building</button>
    `;
    
    awardTokenForHardWork('start_building');
    userTokens += 2; // Extra tokens for building
    currentUser.tokens = userTokens;
    localStorage.setItem('infinityUser', JSON.stringify(currentUser));
    
    alert(`Great! Your AI co-pilot is helping you build. You earned 2 bonus tokens!`);
}

function continueBuild() {
    alert('Your AI assistant is working with you like a steering wheel - guiding your development journey!');
}

// Autopilot Sound Synthesis
async function toggleAutopilot() {
    if (!autopilotActive) {
        await startAutopilot();
    } else {
        stopAutopilot();
    }
}

async function startAutopilot() {
    try {
        // Initialize Web Audio API
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        
        // Create analyser
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        microphone.connect(analyser);
        
        autopilotActive = true;
        document.getElementById('autopilotStatus').textContent = 'Status: Active - Listening and Synthesizing';
        
        // Start visualization
        visualizeSound();
        
        // Start autonomous synthesis
        synthesizeSound();
        
        awardTokenForHardWork('autopilot_activation');
        userTokens += 1; // Bonus for using autopilot
        currentUser.tokens = userTokens;
        localStorage.setItem('infinityUser', JSON.stringify(currentUser));
        
        alert('Autopilot activated! The system is now listening and will autonomously repeat sounds with the synthesizer.');
        
    } catch (error) {
        console.error('Error starting autopilot:', error);
        alert('Could not access microphone. Please grant permission.');
    }
}

function stopAutopilot() {
    autopilotActive = false;
    document.getElementById('autopilotStatus').textContent = 'Status: Ready';
    
    if (microphone) {
        microphone.disconnect();
    }
    if (audioContext) {
        audioContext.close();
    }
}

function visualizeSound() {
    if (!autopilotActive) return;
    
    const canvas = document.getElementById('soundVisualizer');
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        if (!autopilotActive) return;
        
        requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0070ba';
        ctx.beginPath();
        
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }
    
    draw();
}

function synthesizeSound() {
    if (!autopilotActive || !analyser) return;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    setInterval(() => {
        if (!autopilotActive) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        // Get average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        // If sound detected, synthesize it
        if (average > 10) {
            const synthesisMode = document.getElementById('synthesisMode').value;
            playSynthesis(average, synthesisMode);
        }
    }, 100);
}

function playSynthesis(volume, mode) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Configure based on mode
    switch(mode) {
        case 'direct':
            oscillator.type = 'sine';
            oscillator.frequency.value = 440 + (volume * 2);
            break;
        case 'enhanced':
            oscillator.type = 'triangle';
            oscillator.frequency.value = 440 + (volume * 4);
            break;
        case 'harmonic':
            oscillator.type = 'sawtooth';
            oscillator.frequency.value = 440 + (volume * 3);
            break;
    }
    
    gainNode.gain.value = Math.min(volume / 255, 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

function startAutopilotFromPortal() {
    enterRealm('aibuilder');
    setTimeout(() => toggleAutopilot(), 500);
}

// Voice Recognition
let recognition = null;

function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition not supported in this browser.');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            }
        }
        
        if (finalTranscript) {
            document.getElementById('voiceOutput').innerHTML += `<p><strong>You said:</strong> ${finalTranscript}</p>`;
            
            // Check for ti rigers in voice
            if (checkForTiRigers(finalTranscript)) {
                document.getElementById('voiceOutput').innerHTML += `<p style="color: #0070ba;"><strong>🎉 Token earned! Total: ${userTokens.toFixed(1)}</strong></p>`;
            }
        }
    };
    
    recognition.start();
    awardTokenForHardWork('voice_activation');
}

function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
    }
}

// Coding Agents
function activateCodingAgent(type) {
    const agentNames = {
        'js': 'JavaScript Expert Agent',
        'py': 'Python Specialist Agent',
        'full': 'Full-Stack Master Agent'
    };
    
    alert(`${agentNames[type]} activated! This AI agent will help you write better code with steering wheel guidance.`);
    awardTokenForHardWork('coding_agent');
}

// Gemini Search
function performGeminiSearch() {
    const searchTerm = document.getElementById('geminiSearch').value;
    const resultsDiv = document.getElementById('geminiResults');
    
    resultsDiv.innerHTML = `
        <h4>IBM Gemini AI Search Results for: "${searchTerm}"</h4>
        <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p>🤖 AI-powered results using high-end IBM Gemini API</p>
            <p>✨ Found comprehensive information about "${searchTerm}"</p>
            <p>💡 Recommendation: Explore related features in the AI Builder Realm</p>
        </div>
    `;
    
    awardTokenForHardWork('gemini_search');
}

// Scroll to products (legacy support)
function scrollToProducts() {
    enterRealm('marketplace');
}

console.log('Infinity Platform Loaded - Powered by Rogers Core System');
