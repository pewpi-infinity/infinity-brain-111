// Main Application JavaScript
// Handles video/audio players, multi-page research, and term extraction

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    setupNavigation();
    setupVideoPlayer();
    setupAudioPlayer();
    setupResearchPortal();
    loadResources();
    console.log('Mongoose Research Hub initialized');
}

// Navigation between sections
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');
            
            // Update active states
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection + '-section') {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Video Player Functionality
function setupVideoPlayer() {
    const videoPlayer = document.getElementById('main-video-player');
    const videoUrl = document.getElementById('video-url');
    const addVideoBtn = document.getElementById('add-video');
    const videoList = document.getElementById('video-list');
    const playBtn = document.getElementById('video-play');
    const pauseBtn = document.getElementById('video-pause');
    const stopBtn = document.getElementById('video-stop');
    const volumeSlider = document.getElementById('video-volume');
    
    let videoPlaylist = [];
    
    // Add video to playlist
    addVideoBtn.addEventListener('click', () => {
        const url = videoUrl.value.trim();
        if (url) {
            addVideoToPlaylist(url);
            videoUrl.value = '';
        }
    });
    
    function addVideoToPlaylist(url) {
        const videoId = videoPlaylist.length + 1;
        const videoItem = {
            id: videoId,
            url: url,
            title: `Video ${videoId}: ${url.substring(0, 50)}...`
        };
        
        videoPlaylist.push(videoItem);
        
        const li = document.createElement('li');
        li.textContent = videoItem.title;
        li.dataset.videoId = videoId;
        li.addEventListener('click', () => {
            playVideo(videoItem.url);
            document.querySelectorAll('#video-list li').forEach(item => item.classList.remove('active'));
            li.classList.add('active');
        });
        
        videoList.appendChild(li);
    }
    
    function playVideo(url) {
        // Handle different video sources
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            alert('For YouTube videos, please use the embedded player format or download the video.');
        } else {
            videoPlayer.src = url;
            videoPlayer.load();
            videoPlayer.play();
        }
    }
    
    // Player controls
    playBtn.addEventListener('click', () => videoPlayer.play());
    pauseBtn.addEventListener('click', () => videoPlayer.pause());
    stopBtn.addEventListener('click', () => {
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
    });
    
    volumeSlider.addEventListener('input', (e) => {
        videoPlayer.volume = e.target.value / 100;
    });
    
    // Add some example videos
    addVideoToPlaylist('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    addVideoToPlaylist('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');
}

// Audio Player Functionality
function setupAudioPlayer() {
    const audioPlayer = document.getElementById('main-audio-player');
    const audioUrl = document.getElementById('audio-url');
    const addAudioBtn = document.getElementById('add-audio');
    const audioList = document.getElementById('audio-list');
    const playBtn = document.getElementById('audio-play');
    const pauseBtn = document.getElementById('audio-pause');
    const stopBtn = document.getElementById('audio-stop');
    const volumeSlider = document.getElementById('audio-volume');
    const speedBtn = document.getElementById('audio-speed');
    
    let audioPlaylist = [];
    let currentSpeed = 1.0;
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    let speedIndex = 2; // Start at 1.0x
    
    // Add audio to playlist
    addAudioBtn.addEventListener('click', () => {
        const url = audioUrl.value.trim();
        if (url) {
            addAudioToPlaylist(url);
            audioUrl.value = '';
        }
    });
    
    function addAudioToPlaylist(url) {
        const audioId = audioPlaylist.length + 1;
        const audioItem = {
            id: audioId,
            url: url,
            title: `Audio ${audioId}: ${url.substring(0, 50)}...`
        };
        
        audioPlaylist.push(audioItem);
        
        const li = document.createElement('li');
        li.textContent = audioItem.title;
        li.dataset.audioId = audioId;
        li.addEventListener('click', () => {
            playAudio(audioItem.url);
            document.querySelectorAll('#audio-list li').forEach(item => item.classList.remove('active'));
            li.classList.add('active');
        });
        
        audioList.appendChild(li);
    }
    
    function playAudio(url) {
        audioPlayer.src = url;
        audioPlayer.load();
        audioPlayer.play();
    }
    
    // Player controls
    playBtn.addEventListener('click', () => audioPlayer.play());
    pauseBtn.addEventListener('click', () => audioPlayer.pause());
    stopBtn.addEventListener('click', () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    });
    
    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value / 100;
    });
    
    speedBtn.addEventListener('click', () => {
        speedIndex = (speedIndex + 1) % speeds.length;
        currentSpeed = speeds[speedIndex];
        audioPlayer.playbackRate = currentSpeed;
        speedBtn.textContent = `Speed: ${currentSpeed}x`;
    });
    
    // Live spaces example
    const liveSpacesList = document.getElementById('live-spaces-list');
    const liveSpaces = [
        { name: 'Science Friday Podcast', url: 'https://www.sciencefriday.com' },
        { name: 'Radiolab', url: 'https://radiolab.org' },
        { name: 'StarTalk Radio', url: 'https://www.startalkradio.net' },
        { name: 'The Infinite Monkey Cage', url: 'https://www.bbc.co.uk/programmes/b00snr0w' },
        { name: 'Ologies Podcast', url: 'https://www.alieward.com/ologies' }
    ];
    
    liveSpaces.forEach(space => {
        const div = document.createElement('div');
        div.innerHTML = `<a href="${space.url}" target="_blank">${space.name}</a>`;
        div.style.padding = '0.5rem';
        div.style.marginBottom = '0.5rem';
        liveSpacesList.appendChild(div);
    });
}

// Research Portal - Multi-page functionality
function setupResearchPortal() {
    const searchInput = document.getElementById('search-input');
    const startResearchBtn = document.getElementById('start-research');
    const clearPagesBtn = document.getElementById('clear-pages');
    const extractTermsBtn = document.getElementById('extract-terms');
    const expandResearchBtn = document.getElementById('expand-research');
    const researchGrid = document.getElementById('research-grid');
    const pageCountSpan = document.getElementById('page-count');
    const extractedTermsDiv = document.getElementById('extracted-terms');
    const combinedTermsList = document.getElementById('combined-terms-list');
    
    let activePagesCount = 0;
    let extractedTerms = [];
    const maxPages = 40;
    
    // Start research with multiple pages
    startResearchBtn.addEventListener('click', () => {
        const searchTerms = searchInput.value.trim();
        if (!searchTerms) {
            alert('Please enter search terms');
            return;
        }
        
        if (activePagesCount >= maxPages) {
            alert(`Maximum ${maxPages} pages reached. Please clear some pages first.`);
            return;
        }
        
        // Split search terms and create research pages
        const terms = searchTerms.split(',').map(t => t.trim()).filter(t => t);
        
        terms.forEach(term => {
            if (activePagesCount < maxPages) {
                createResearchPage(term);
            }
        });
    });
    
    function createResearchPage(searchTerm) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'research-page';
        pageDiv.dataset.searchTerm = searchTerm;
        
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}`;
        
        pageDiv.innerHTML = `
            <button class="close-btn">×</button>
            <h4>${searchTerm}</h4>
            <iframe src="${searchUrl}" sandbox="allow-scripts allow-same-origin"></iframe>
            <div style="margin-top: 0.5rem; font-size: 0.8rem;">
                <a href="${searchUrl}" target="_blank">Open in new tab</a>
            </div>
        `;
        
        // Add close functionality
        pageDiv.querySelector('.close-btn').addEventListener('click', () => {
            pageDiv.remove();
            activePagesCount--;
            updatePageCount();
        });
        
        researchGrid.appendChild(pageDiv);
        activePagesCount++;
        updatePageCount();
    }
    
    function updatePageCount() {
        pageCountSpan.textContent = activePagesCount;
    }
    
    // Clear all pages
    clearPagesBtn.addEventListener('click', () => {
        researchGrid.innerHTML = '';
        activePagesCount = 0;
        updatePageCount();
        extractedTerms = [];
        extractedTermsDiv.innerHTML = '';
        combinedTermsList.innerHTML = '';
    });
    
    // Extract terms from research pages
    extractTermsBtn.addEventListener('click', () => {
        const pages = document.querySelectorAll('.research-page');
        extractedTerms = [];
        
        if (pages.length === 0) {
            alert('No research pages open. Start research first.');
            return;
        }
        
        // Simulate term extraction (in real implementation, would parse page content)
        pages.forEach(page => {
            const searchTerm = page.dataset.searchTerm;
            const relatedTerms = generateRelatedTerms(searchTerm);
            extractedTerms.push(...relatedTerms);
        });
        
        // Remove duplicates
        extractedTerms = [...new Set(extractedTerms)];
        
        // Display extracted terms
        extractedTermsDiv.innerHTML = `
            <h4>Extracted Terms (${extractedTerms.length}):</h4>
            <p>${extractedTerms.join(', ')}</p>
        `;
        
        // Generate combined terms
        generateCombinedTerms();
    });
    
    // Generate related terms based on search term
    function generateRelatedTerms(term) {
        const termLower = term.toLowerCase();
        const related = [];
        
        // Add base term variations
        related.push(term);
        
        // Science-related combinations
        if (termLower.includes('science') || termLower.includes('physics') || termLower.includes('chemistry')) {
            related.push(`${term} research`, `${term} experiments`, `${term} theory`, `${term} applications`, `${term} discoveries`);
        }
        
        // Technology-related combinations
        if (termLower.includes('tech') || termLower.includes('computer') || termLower.includes('ai')) {
            related.push(`${term} innovation`, `${term} development`, `${term} industry`, `${term} future`, `${term} trends`);
        }
        
        // Nature-related combinations
        if (termLower.includes('nature') || termLower.includes('environment') || termLower.includes('water')) {
            related.push(`${term} conservation`, `${term} ecosystem`, `${term} biodiversity`, `${term} climate`, `${term} sustainability`);
        }
        
        // Space-related combinations
        if (termLower.includes('space') || termLower.includes('solar') || termLower.includes('gravity')) {
            related.push(`${term} exploration`, `${term} missions`, `${term} astronomy`, `${term} physics`, `${term} discovery`);
        }
        
        return related.slice(0, 5); // Return 5 terms per search
    }
    
    // Generate combined search terms
    function generateCombinedTerms() {
        if (extractedTerms.length < 2) {
            alert('Need at least 2 terms to combine');
            return;
        }
        
        combinedTermsList.innerHTML = '<p>Generating combined terms...</p>';
        
        const combinations = [];
        
        // Create 2-term combinations
        for (let i = 0; i < extractedTerms.length && i < 20; i++) {
            for (let j = i + 1; j < extractedTerms.length && j < 20; j++) {
                combinations.push(`${extractedTerms[i]} + ${extractedTerms[j]}`);
            }
        }
        
        // Limit to first 50 combinations
        const displayCombinations = combinations.slice(0, 50);
        
        combinedTermsList.innerHTML = '';
        displayCombinations.forEach(combo => {
            const tag = document.createElement('span');
            tag.className = 'term-tag';
            tag.textContent = combo;
            tag.style.cursor = 'pointer';
            tag.addEventListener('click', () => {
                if (activePagesCount < maxPages) {
                    createResearchPage(combo);
                }
            });
            combinedTermsList.appendChild(tag);
        });
    }
    
    // Expand research with combined terms
    expandResearchBtn.addEventListener('click', () => {
        const combinations = document.querySelectorAll('.term-tag');
        
        if (combinations.length === 0) {
            alert('Please extract and combine terms first');
            return;
        }
        
        if (activePagesCount >= maxPages) {
            alert(`Maximum ${maxPages} pages reached. Please clear some pages first.`);
            return;
        }
        
        // Add up to 10 new pages from combined terms
        let added = 0;
        combinations.forEach(tag => {
            if (added < 10 && activePagesCount < maxPages) {
                createResearchPage(tag.textContent);
                added++;
            }
        });
    });
    
    // Add some default search suggestions
    const suggestions = [
        'quantum physics',
        'artificial intelligence',
        'climate change',
        'space exploration',
        'renewable energy',
        'biotechnology',
        'nanotechnology',
        'oceanography'
    ];
    
    searchInput.placeholder = `Try: ${suggestions.join(', ')}`;
}

// Load research resources
function loadResources() {
    const db = typeof websitesDatabase !== 'undefined' ? websitesDatabase : null;
    
    if (!db) {
        console.warn('Websites database not loaded');
        return;
    }
    
    // Load science links
    loadCategoryLinks('science-links', db.science);
    
    // Load technology links
    loadCategoryLinks('tech-links', db.technology);
    
    // Load nature links
    loadCategoryLinks('nature-links', db.nature);
    
    // Load weather links
    loadCategoryLinks('weather-links', db.weather);
    
    // Load space links
    loadCategoryLinks('space-links', db.space);
    
    // Load computing links
    loadCategoryLinks('computing-links', db.computing);
}

function loadCategoryLinks(elementId, links) {
    const ul = document.getElementById(elementId);
    if (!ul || !links) return;
    
    links.forEach(link => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.textContent = link.name;
        a.title = link.topics.join(', ');
        li.appendChild(a);
        ul.appendChild(li);
    });
}

// Utility function to search across all databases
function searchDatabases(query) {
    const results = [];
    const db = typeof websitesDatabase !== 'undefined' ? websitesDatabase : null;
    
    if (!db) return results;
    
    const queryLower = query.toLowerCase();
    
    Object.keys(db).forEach(category => {
        db[category].forEach(site => {
            // Search in name, topics
            const nameMatch = site.name.toLowerCase().includes(queryLower);
            const topicsMatch = site.topics.some(topic => topic.toLowerCase().includes(queryLower));
            
            if (nameMatch || topicsMatch) {
                results.push({
                    ...site,
                    category: category
                });
            }
        });
    });
    
    return results;
}

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        searchDatabases,
        generateRelatedTerms
    };
}

console.log('Mongoose Research Hub - Application loaded successfully');
console.log('Features:');
console.log('- Multi-page research (up to 40 pages simultaneously)');
console.log('- Video player with playlist');
console.log('- Audio player with speed control');
console.log('- Term extraction and combination');
console.log('- 5000+ curated research websites');
console.log('- Microscale to macroscale thinking approach');
