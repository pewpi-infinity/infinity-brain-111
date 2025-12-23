// Infinity Vector App - Main Application Logic
// Local-first, encrypted, browser-based authentication and navigation

class InfinityVectorApp {
    constructor() {
        this.isAuthenticated = false;
        this.currentZone = null;
        this.vectorNodes = [
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'projects', label: 'Projects', icon: '📁' },
            { id: 'data', label: 'Data', icon: '📊' },
            { id: 'tools', label: 'Tools', icon: '🔧' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
        ];
        
        this.init();
    }

    init() {
        // Check if user is already authenticated
        this.checkAuthentication();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize vector navigation
        this.initializeVectorNav();
    }

    setupEventListeners() {
        // Sign-in event
        const signInBtn = document.getElementById('signInBtn');
        const passphraseInput = document.getElementById('passphrase');
        
        signInBtn.addEventListener('click', () => this.handleSignIn());
        passphraseInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSignIn();
            }
        });

        // Sign-out event
        const signOutBtn = document.getElementById('signOutBtn');
        signOutBtn.addEventListener('click', () => this.handleSignOut());
    }

    async handleSignIn() {
        const passphraseInput = document.getElementById('passphrase');
        const passphrase = passphraseInput.value;

        if (!passphrase || passphrase.length < 8) {
            this.showError('Please enter a passphrase (minimum 8 characters)');
            return;
        }

        try {
            // Hash and store the passphrase locally using Web Crypto API
            // Note: This is a simplified auth for the starter kit. 
            // For production, implement proper authentication with salted hashes.
            const hashedData = await this.hashPassphrase(passphrase);
            
            // Store hashed passphrase in localStorage
            localStorage.setItem('infinity_auth', hashedData);
            localStorage.setItem('infinity_auth_timestamp', Date.now());

            // Clear input and error
            passphraseInput.value = '';
            this.clearError();

            // Authenticate user
            this.authenticate();
        } catch (error) {
            console.error('Authentication error:', error);
            this.showError('Authentication failed. Please try again.');
        }
    }

    async hashPassphrase(passphrase) {
        // Create a hash using SubtleCrypto API
        // This is a simplified approach for the starter kit
        // Production apps should use salted hashes with proper key derivation (PBKDF2, etc.)
        const encoder = new TextEncoder();
        const data = encoder.encode(passphrase);
        
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex;
    }

    showError(message) {
        let errorDiv = document.getElementById('authError');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'authError';
            errorDiv.className = 'auth-error';
            const form = document.getElementById('signInForm');
            form.insertBefore(errorDiv, form.firstChild);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    clearError() {
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    checkAuthentication() {
        const authData = localStorage.getItem('infinity_auth');
        const authTimestamp = localStorage.getItem('infinity_auth_timestamp');
        
        // Check if auth exists and is less than 24 hours old
        if (authData && authTimestamp) {
            const now = Date.now();
            const age = now - parseInt(authTimestamp);
            const twentyFourHours = 24 * 60 * 60 * 1000;
            
            if (age < twentyFourHours) {
                this.authenticate();
                return;
            }
        }
        
        // Show sign-in modal if not authenticated
        this.showSignInModal();
    }

    authenticate() {
        this.isAuthenticated = true;
        
        // Hide sign-in modal
        document.getElementById('signInModal').style.display = 'none';
        
        // Show main app
        document.getElementById('app').style.display = 'flex';
        
        // Load default zone
        this.loadZone('home');
    }

    showSignInModal() {
        document.getElementById('signInModal').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }

    handleSignOut() {
        // Clear authentication
        localStorage.removeItem('infinity_auth');
        localStorage.removeItem('infinity_auth_timestamp');
        
        this.isAuthenticated = false;
        this.currentZone = null;
        
        // Show sign-in modal
        this.showSignInModal();
    }

    initializeVectorNav() {
        const vectorContainer = document.getElementById('vectorContainer');
        
        // Clear existing nodes
        vectorContainer.innerHTML = '';
        
        // Create vector nodes dynamically
        this.vectorNodes.forEach(node => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'vector-node';
            nodeElement.dataset.zone = node.id;
            nodeElement.innerHTML = `${node.icon} ${node.label}`;
            
            // Add click event
            nodeElement.addEventListener('click', () => this.loadZone(node.id));
            
            vectorContainer.appendChild(nodeElement);
        });
    }

    loadZone(zoneId) {
        // Update current zone
        this.currentZone = zoneId;
        
        // Update active node
        document.querySelectorAll('.vector-node').forEach(node => {
            node.classList.remove('active');
            if (node.dataset.zone === zoneId) {
                node.classList.add('active');
            }
        });
        
        // Load zone content
        const activeZone = document.getElementById('activeZone');
        activeZone.innerHTML = this.getZoneContent(zoneId);
    }

    getZoneContent(zoneId) {
        const zoneConfigs = {
            home: {
                title: 'Home Dashboard',
                description: 'Welcome to your Infinity Vector workspace. Navigate through your vector spaces using the navigation above.',
                content: `
                    <div class="zone-grid">
                        <div class="zone-card">
                            <h3>🚀 Quick Start</h3>
                            <p>Get started with your first vector project in minutes.</p>
                        </div>
                        <div class="zone-card">
                            <h3>📈 Analytics</h3>
                            <p>View your usage statistics and insights.</p>
                        </div>
                        <div class="zone-card">
                            <h3>🔔 Notifications</h3>
                            <p>Stay updated with your latest activities.</p>
                        </div>
                        <div class="zone-card">
                            <h3>💡 Resources</h3>
                            <p>Access documentation and learning materials.</p>
                        </div>
                    </div>
                `
            },
            projects: {
                title: 'Projects',
                description: 'Manage and organize your vector projects in one place.',
                content: `
                    <div class="zone-grid">
                        <div class="zone-card">
                            <h3>➕ New Project</h3>
                            <p>Create a new vector project from scratch.</p>
                        </div>
                        <div class="zone-card">
                            <h3>📂 My Projects</h3>
                            <p>View and manage your existing projects.</p>
                        </div>
                        <div class="zone-card">
                            <h3>🌟 Templates</h3>
                            <p>Start from pre-built project templates.</p>
                        </div>
                    </div>
                `
            },
            data: {
                title: 'Data Management',
                description: 'Visualize and manage your vector data efficiently.',
                content: `
                    <div class="zone-grid">
                        <div class="zone-card">
                            <h3>📊 Datasets</h3>
                            <p>Browse and manage your data collections.</p>
                        </div>
                        <div class="zone-card">
                            <h3>🔍 Search</h3>
                            <p>Find and filter your vector data.</p>
                        </div>
                        <div class="zone-card">
                            <h3>📈 Visualizations</h3>
                            <p>Create charts and graphs from your data.</p>
                        </div>
                        <div class="zone-card">
                            <h3>⬆️ Import/Export</h3>
                            <p>Transfer data in and out of the system.</p>
                        </div>
                    </div>
                `
            },
            tools: {
                title: 'Development Tools',
                description: 'Utilities and tools for vector development.',
                content: `
                    <div class="zone-grid">
                        <div class="zone-card">
                            <h3>🛠️ Vector Builder</h3>
                            <p>Visual tool for creating vector structures.</p>
                        </div>
                        <div class="zone-card">
                            <h3>🧪 Testing Suite</h3>
                            <p>Test and validate your vector implementations.</p>
                        </div>
                        <div class="zone-card">
                            <h3>📝 Code Editor</h3>
                            <p>Edit vector definitions and configurations.</p>
                        </div>
                        <div class="zone-card">
                            <h3>🔧 Debug Console</h3>
                            <p>Troubleshoot and debug your vectors.</p>
                        </div>
                    </div>
                `
            },
            settings: {
                title: 'Settings',
                description: 'Configure your Infinity Vector preferences and options.',
                content: `
                    <div class="zone-grid">
                        <div class="zone-card">
                            <h3>👤 Profile</h3>
                            <p>Manage your account and preferences.</p>
                        </div>
                        <div class="zone-card">
                            <h3>🔒 Security</h3>
                            <p>Update authentication and privacy settings.</p>
                        </div>
                        <div class="zone-card">
                            <h3>🎨 Appearance</h3>
                            <p>Customize the look and feel of the app.</p>
                        </div>
                        <div class="zone-card">
                            <h3>🔔 Notifications</h3>
                            <p>Configure notification preferences.</p>
                        </div>
                    </div>
                `
            }
        };

        const config = zoneConfigs[zoneId] || zoneConfigs.home;

        return `
            <div class="zone-content">
                <h2>${config.title}</h2>
                <p>${config.description}</p>
                ${config.content}
            </div>
        `;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.infinityApp = new InfinityVectorApp();
});

// Prevent accidental navigation away
window.addEventListener('beforeunload', (e) => {
    if (window.infinityApp && window.infinityApp.isAuthenticated) {
        // Only show warning if there's unsaved work
        // For now, we'll allow navigation
        return undefined;
    }
});
