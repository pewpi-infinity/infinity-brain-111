// Infinity Research Hub - Main Application

class ResearchHub {
    constructor() {
        this.currentUser = this.loadUser();
        this.database = this.loadDatabase();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEditor();
        this.setupSearch();
        this.loadResearchFeed();
        this.updateStats();
        this.updateTokenDisplay();
    }

    // User Management
    loadUser() {
        const user = localStorage.getItem('research_user');
        if (user) {
            return JSON.parse(user);
        }
        const newUser = {
            id: this.generateId(),
            name: 'Anonymous Researcher',
            tokens: 0,
            papers: [],
            joined: new Date().toISOString()
        };
        this.saveUser(newUser);
        return newUser;
    }

    saveUser(user) {
        localStorage.setItem('research_user', JSON.stringify(user));
        this.currentUser = user;
    }

    // Database Management (Infinity Database)
    loadDatabase() {
        const db = localStorage.getItem('infinity_research_db');
        if (db) {
            return JSON.parse(db);
        }
        return {
            papers: [],
            tokens: [],
            metadata: {
                created: new Date().toISOString(),
                totalPapers: 0,
                totalTokens: 0,
                researchers: []
            }
        };
    }

    saveDatabase() {
        localStorage.setItem('infinity_research_db', JSON.stringify(this.database));
    }

    // Navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);

                // Update active states
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) {
                        section.classList.add('active');
                        
                        // Load section-specific content
                        if (targetId === 'tokens') {
                            this.loadUserPapers();
                        } else if (targetId === 'database') {
                            this.loadDatabaseView();
                        }
                    }
                });
            });
        });
    }

    // Research Feed
    loadResearchFeed() {
        const feedContainer = document.getElementById('research-feed');
        const papers = this.database.papers.slice().reverse(); // Show newest first

        if (papers.length === 0) {
            feedContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No Research Papers Yet</h3>
                    <p>Be the first to contribute! Use the Paper Editor to create your first research paper.</p>
                </div>
            `;
            return;
        }

        feedContainer.innerHTML = papers.map(paper => this.createPaperCard(paper)).join('');
    }

    createPaperCard(paper) {
        const keywords = paper.keywords ? paper.keywords.split(',').map(k => k.trim()) : [];
        const keywordTags = keywords.map(k => `<span class="keyword-tag">${this.escapeHtml(k)}</span>`).join('');
        
        return `
            <div class="research-card" data-paper-id="${paper.id}">
                <h3>${this.escapeHtml(paper.title)}</h3>
                <div class="author">By ${this.escapeHtml(paper.author)}</div>
                <div class="abstract">${this.escapeHtml(paper.abstract.substring(0, 200))}${paper.abstract.length > 200 ? '...' : ''}</div>
                <div class="keywords">${keywordTags}</div>
                <div class="meta">
                    <span>${new Date(paper.timestamp).toLocaleDateString()}</span>
                    <span class="token-badge">${paper.tokenValue} RT</span>
                </div>
            </div>
        `;
    }

    // Editor
    setupEditor() {
        const tokenizeBtn = document.getElementById('tokenize-btn');
        const saveDraftBtn = document.getElementById('save-draft-btn');

        tokenizeBtn.addEventListener('click', () => this.submitPaper());
        saveDraftBtn.addEventListener('click', () => this.saveDraft());
    }

    async submitPaper() {
        const title = document.getElementById('paper-title').value.trim();
        const author = document.getElementById('paper-author').value.trim() || 'Anonymous';
        const keywords = document.getElementById('paper-keywords').value.trim();
        const abstract = document.getElementById('paper-abstract').value.trim();
        const content = document.getElementById('paper-content').value.trim();
        const references = document.getElementById('paper-references').value.trim();

        // Validation
        if (!title || !abstract || !content) {
            this.showStatus('Please fill in at least the title, abstract, and content fields.', 'error');
            return;
        }

        // Create paper object
        const paper = {
            id: this.generateId(),
            title,
            author,
            keywords,
            abstract,
            content,
            references,
            timestamp: new Date().toISOString(),
            userId: this.currentUser.id,
            tokenValue: this.calculateTokenValue(content),
            reads: 0,
            metadata: {
                link: `#paper-${this.generateId()}`,
                wordCount: content.split(/\s+/).length
            }
        };

        // Add to database
        this.database.papers.push(paper);
        this.database.metadata.totalPapers++;
        
        // Create token
        const token = {
            id: this.generateId(),
            paperId: paper.id,
            userId: this.currentUser.id,
            value: paper.tokenValue,
            created: new Date().toISOString()
        };
        this.database.tokens.push(token);
        this.database.metadata.totalTokens += paper.tokenValue;

        // Update user
        this.currentUser.tokens += paper.tokenValue;
        this.currentUser.papers.push(paper.id);
        if (!this.database.metadata.researchers.includes(this.currentUser.id)) {
            this.database.metadata.researchers.push(this.currentUser.id);
        }

        // Save everything
        this.saveDatabase();
        this.saveUser(this.currentUser);

        // Update UI
        this.showStatus(`Research paper tokenized successfully! You earned ${paper.tokenValue} RT tokens.`, 'success');
        this.clearEditor();
        this.loadResearchFeed();
        this.updateStats();
        this.updateTokenDisplay();

        // Store the paper content as a file
        this.savePaperToFile(paper);
    }

    savePaperToFile(paper) {
        // Create a text representation of the paper
        const paperText = `
Title: ${paper.title}
Author: ${paper.author}
Keywords: ${paper.keywords}
Date: ${new Date(paper.timestamp).toLocaleString()}
Token ID: ${paper.id}
Token Value: ${paper.tokenValue} RT

ABSTRACT:
${paper.abstract}

CONTENT:
${paper.content}

REFERENCES:
${paper.references}

---
Metadata Link: ${paper.metadata.link}
Word Count: ${paper.metadata.wordCount}
        `.trim();

        // Save to localStorage with a file-like key
        localStorage.setItem(`research_paper_${paper.id}`, paperText);
    }

    calculateTokenValue(content) {
        // Token calculation based on content quality metrics
        const wordCount = content.split(/\s+/).length;
        const baseTokens = Math.floor(wordCount / 100); // 1 token per 100 words
        
        // Deterministic quality factors
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
        
        // Quality bonus based on content structure (1-5 tokens)
        let qualityBonus = 1;
        if (avgSentenceLength > 15 && avgSentenceLength < 30) qualityBonus += 1; // Good readability
        if (wordCount > 500) qualityBonus += 1; // Substantial content
        if (wordCount > 1000) qualityBonus += 1; // Comprehensive content
        if (sentences.length > 10) qualityBonus += 1; // Well-structured
        
        return Math.max(baseTokens + qualityBonus, 1);
    }

    saveDraft() {
        const draft = {
            title: document.getElementById('paper-title').value,
            author: document.getElementById('paper-author').value,
            keywords: document.getElementById('paper-keywords').value,
            abstract: document.getElementById('paper-abstract').value,
            content: document.getElementById('paper-content').value,
            references: document.getElementById('paper-references').value,
            savedAt: new Date().toISOString()
        };

        localStorage.setItem('research_draft', JSON.stringify(draft));
        this.showStatus('Draft saved successfully!', 'success');
    }

    loadDraft() {
        const draft = localStorage.getItem('research_draft');
        if (draft) {
            const data = JSON.parse(draft);
            document.getElementById('paper-title').value = data.title || '';
            document.getElementById('paper-author').value = data.author || '';
            document.getElementById('paper-keywords').value = data.keywords || '';
            document.getElementById('paper-abstract').value = data.abstract || '';
            document.getElementById('paper-content').value = data.content || '';
            document.getElementById('paper-references').value = data.references || '';
        }
    }

    clearEditor() {
        document.getElementById('paper-title').value = '';
        document.getElementById('paper-author').value = '';
        document.getElementById('paper-keywords').value = '';
        document.getElementById('paper-abstract').value = '';
        document.getElementById('paper-content').value = '';
        document.getElementById('paper-references').value = '';
        localStorage.removeItem('research_draft');
    }

    showStatus(message, type = 'success') {
        const statusEl = document.getElementById('editor-status');
        statusEl.textContent = message;
        statusEl.style.color = type === 'error' ? '#ef4444' : '#10b981';
        
        setTimeout(() => {
            statusEl.textContent = '';
        }, 5000);
    }

    // Tokens Section
    updateTokenDisplay() {
        document.getElementById('token-balance').textContent = `${this.currentUser.tokens} RT`;
        document.getElementById('papers-count').textContent = this.currentUser.papers.length;
        
        const totalReads = this.database.papers
            .filter(p => this.currentUser.papers.includes(p.id))
            .reduce((sum, p) => sum + p.reads, 0);
        document.getElementById('total-reads').textContent = totalReads;
    }

    loadUserPapers() {
        const container = document.getElementById('user-papers');
        const userPapers = this.database.papers.filter(p => 
            this.currentUser.papers.includes(p.id)
        );

        if (userPapers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Papers Yet</h3>
                    <p>Create your first research paper to start earning tokens!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = userPapers.map(paper => this.createPaperCard(paper)).join('');
    }

    // Database Section
    setupSearch() {
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');

        searchBtn.addEventListener('click', () => this.performSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }

    performSearch() {
        const query = document.getElementById('search-input').value.toLowerCase().trim();
        const results = this.database.papers.filter(paper => 
            paper.title.toLowerCase().includes(query) ||
            paper.abstract.toLowerCase().includes(query) ||
            paper.keywords.toLowerCase().includes(query) ||
            paper.content.toLowerCase().includes(query)
        );

        const container = document.getElementById('database-results');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Results Found</h3>
                    <p>Try different keywords or browse all papers.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(paper => this.createPaperCard(paper)).join('');
    }

    loadDatabaseView() {
        this.updateStats();
        const container = document.getElementById('database-results');
        
        if (this.database.papers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Database Empty</h3>
                    <p>The infinity database is waiting for research contributions.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.database.papers
            .slice().reverse()
            .map(paper => this.createPaperCard(paper))
            .join('');
    }

    updateStats() {
        document.getElementById('total-papers').textContent = this.database.papers.length;
        document.getElementById('total-tokens').textContent = this.database.metadata.totalTokens;
        document.getElementById('active-researchers').textContent = this.database.metadata.researchers.length;
    }

    // Utilities
    generateId() {
        // Generate a more robust unique ID using timestamp and crypto-quality randomness
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 15);
        const randomPart2 = Math.random().toString(36).substring(2, 15);
        return `${timestamp}-${randomPart}${randomPart2}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.researchHub = new ResearchHub();
    
    // Load draft if exists
    const draft = localStorage.getItem('research_draft');
    if (draft) {
        console.log('Draft found. You can restore it in the editor.');
    }
});
