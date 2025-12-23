# Infinity Research Hub 🔬

A web-based platform for publishing, tokenizing, and discovering scientific research papers.

## Overview

Infinity Research Hub provides a clean, politics-free environment for sharing scientific research. It features:

- **Research News Feed**: Browse published papers in a modern interface
- **Paper Editor Terminal**: Create and publish your own research papers
- **Tokenization System**: Earn Research Tokens (RT) for your contributions
- **Infinity Database**: Searchable repository of all research papers
- **No Politics**: Pure science and discovery focus

## Quick Start

```bash
npm start
```

Then open your browser to `http://localhost:3000`

## Features

✅ Publish research papers with automatic tokenization  
✅ Search full-text across all papers  
✅ Track your tokens and contributions  
✅ Clean, scientific news feed interface  
✅ No registration required  
✅ Works offline after first load  
✅ 100% client-side data storage for privacy  

## How It Works

1. **Create**: Use the Paper Editor to write your research
2. **Tokenize**: Submit your paper to earn Research Tokens (RT)
3. **Share**: Your paper appears in the news feed
4. **Discover**: Search and explore the Infinity Database

## Token System

- 1 RT per 100 words of content
- Quality bonus: 1-5 RT
- Tokens credit to your account
- Track all your contributions

## Documentation

See [docs/README.md](docs/README.md) for complete documentation.

## Technology

- **Frontend**: HTML5, CSS3, JavaScript (no frameworks)
- **Backend**: Node.js HTTP server
- **Storage**: Browser localStorage (no database needed)
- **Dependencies**: None (pure Node.js built-ins)

## License

MIT
# Mongoose.OS - Login & Token Wallet

A web application for Trick bike Freestyle BMX scripting with login functionality, token wallet management, and server-side commit logging.

## Features

### 1. **Login Page**
- User authentication with username and password
- Automatic user registration on first login
- Login events saved as server-side commits
- Session token generation

### 2. **Token Wallet**
- View total token balance
- Add tokens of different types:
  - Trick Token
  - Freestyle Token
  - BMX Token
  - Reward Token
- Track all tokens with timestamps
- Visual token display with color-coded types

### 3. **Colored Project Links**
- 8 colorful navigation links for co-pilot project integration:
  - **FREESTYLE** - Freestyle BMX Project
  - **BMX** - BMX Core System
  - **TRICKS** - Tricks Library
  - **MONGOOSE** - Mongoose OS
  - **SCRIPTING** - Scripting Engine
  - **COPILOT** - CoPilot Integration
  - **INTEGRATION** - Project Integration Hub
  - **PROJECTS** - All Projects Dashboard
- Each word link has a unique gradient color scheme
- Interactive hover effects
- Links prepared for integration with other co-pilot repositories

### 4. **Server-Side Commit Log**
- All user actions (login, token additions) are logged server-side
- Commit log stored in `commit-log.txt`
- Real-time commit history display
- Includes:
  - Username
  - Action type
  - Timestamp
  - Additional metadata (token type, amount, etc.)

## Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The server will run on `http://localhost:3000` by default.

## Usage

1. **Login**: Enter any username and password. First-time users are automatically registered.
2. **Add Tokens**: Select token type and amount, then click "Add Tokens"
3. **View Wallet**: See your token balance and all tokens you've collected
4. **Explore Links**: Click on the colored project links to see project information
5. **Check Commits**: View the server-side commit log to see all actions

## API Endpoints

### POST `/api/login`
Login or register a user
```json
{
  "username": "string",
  "password": "string"
}
```

### GET `/api/wallet/:username`
Get user's token wallet

### POST `/api/wallet/add`
Add tokens to wallet
```json
{
  "username": "string",
  "tokenType": "string",
  "amount": "number"
}
```

### GET `/api/commits`
Get all server-side commits

## Technologies

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Custom CSS with gradient backgrounds and animations
- **Storage**: In-memory storage with file-based commit logging

## Project Integration

The colored word links are designed to facilitate integration with other co-pilot repository projects. Each link can be configured to point to related repositories or project sections for seamless collaboration across multiple BMX-related projects.

## Future Enhancements

- Persistent database storage
- Secure password hashing
- User profile management
- Token trading/transfer between users
- Real GitHub repository integration for project links
- OAuth authentication
- Token redemption system

## License

ISC
# Mongoose Research Hub 🔬

A comprehensive multi-scale discovery platform for research with integrated video and audio players, multi-page research interface, and intelligent term extraction and combination.

## Features

### 🎥 Video Player
- Support for multiple video formats (MP4, WebM, etc.)
- Playlist management
- Custom player controls
- Volume adjustment
- Full-screen support

### 🎵 Audio Player
- Support for audio files and streams
- Playlist functionality
- Playback speed control (0.5x to 2.0x)
- Volume control
- Live audio spaces integration
- Podcast support

### 🔍 Multi-Page Research Portal
- Research with up to 40 pages simultaneously
- Multi-term search functionality
- Intelligent term extraction (5 terms per page)
- Automatic term combination and expansion
- Microscale to macroscale research approach
- Interactive research page management

### 📚 Curated Resources
Over 5000+ websites across categories:
- **Science & Physics**: Nature, Science, arXiv, PLOS, PubMed, CERN, and more
- **Technology & AI**: OpenAI, DeepMind, IEEE, ACM, MIT Tech Review
- **Nature & Environment**: National Geographic, WWF, Earth Observatory
- **Weather & Atmosphere**: NOAA, Weather.gov, Climate.gov, Space Weather
- **Space & Solar System**: NASA, ESA, SpaceX, Hubble, JWST, Mars missions
- **Computing & Phones**: GitHub, Stack Overflow, Linux Foundation, GSMArena
- **Elements & Chemistry**: Periodic tables, ChemSpider, PubChem
- **Water & Oceans**: USGS Water, Oceanography institutions
- **Sound & Acoustics**: Audio engineering, acoustics research
- **Gravity & Physics**: LIGO, gravitational wave research

## How It Works

### Multi-Scale Discovery Approach

The platform implements a unique research methodology that combines:

1. **Broad Search**: Start with general terms across multiple domains
2. **Term Extraction**: Extract 5 key terms from each research page
3. **Combination**: Combine terms to create more specific searches
4. **Expansion**: Open new research avenues with combined terms
5. **Iteration**: Repeat the process to drill deeper or broader

Think of it like examining a silver dollar:
- **Macroscale**: The entire collection of silver dollars
- **Microscale**: The specific die pair that made each coin
- **Discovery**: Finding rare variations by combining multiple attributes

### Research Workflow

```
Initial Search → Open 40 Pages → Extract Terms → Combine Terms → Expand Research
     ↓              ↓               ↓              ↓                ↓
  General      Specific Topics   Key Concepts   Intersections   New Discoveries
```

## Usage

### Getting Started

1. **Open the application**: Simply open `index.html` in a modern web browser
2. **Choose your mode**:
   - Research Portal: For multi-page research
   - Video Library: For video content
   - Audio Library: For audio and podcasts
   - Resources: Browse curated websites

### Research Portal

1. **Start Research**:
   - Enter search terms (comma-separated for multiple)
   - Click "Start Research" to open pages
   - Each term opens in a new research page

2. **Extract Terms**:
   - Click "Extract & Combine Terms" to analyze open pages
   - System extracts 5 key terms per page
   - Generates combinations automatically

3. **Expand Research**:
   - Click on combined term tags to open new pages
   - Use "Expand Research" to automatically add 10 new pages
   - Clear pages when needed to make room for new searches

### Video Player

1. Enter a video URL (direct link to .mp4, .webm, etc.)
2. Click "Add Video" to add to playlist
3. Click on playlist items to play
4. Use controls to play, pause, stop, and adjust volume

**Supported formats**: MP4, WebM, Ogg
**Note**: YouTube videos require embedded format or download

### Audio Player

1. Enter an audio URL (podcast, stream, or audio file)
2. Click "Add Audio" to add to playlist
3. Adjust playback speed (0.5x to 2.0x)
4. Use controls for playback and volume
5. Explore live spaces for curated podcasts

## Example Research Scenarios

### Scenario 1: Quantum Computing + Climate Science
1. Search: "quantum computing, climate modeling, atmospheric chemistry"
2. Extract terms from all pages
3. Combine: "quantum computing + climate modeling"
4. Discover: New quantum algorithms for weather prediction

### Scenario 2: Biotech + AI + Materials Science
1. Search: "biotechnology, artificial intelligence, nanomaterials"
2. Extract: 15 terms (5 per page)
3. Generate: 100+ combinations
4. Explore: AI-designed proteins using nanomaterials

### Scenario 3: Space + Water + Energy
1. Search: "space exploration, water resources, renewable energy"
2. Extract and combine terms
3. Discover: Water-based propulsion systems
4. Expand: Mars water ice extraction techniques

## Technical Details

### Files
- `index.html`: Main application interface
- `styles.css`: Responsive styling and layout
- `app.js`: Core application logic
- `websites-database.js`: Curated website database (5000+ sites)

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Opera: Full support

### Requirements
- Modern web browser with JavaScript enabled
- Internet connection for loading external resources
- No server required - runs entirely in browser

## Curated Website Categories

The database includes extensive resources in:
- 25+ Science research institutions
- 15+ Technology news and research sites
- 15+ AI and machine learning resources
- 15+ Nature and conservation organizations
- 15+ Weather and atmospheric research centers
- 15+ Space exploration agencies and resources
- 15+ Computing and development platforms
- 10+ Phone and mobile technology sites
- 8+ Chemistry and elements databases
- 8+ Water and oceanography institutions
- 5+ Sound and acoustics resources
- 5+ Atmosphere and ionosphere research
- 4+ Gravity and relativity research
- Plus hundreds of universities, journals, and tech companies

## Privacy & Security

- No data collection
- No external tracking
- All processing happens locally in your browser
- External links open in new tabs
- iframe sandboxing for research pages

## Future Enhancements

- [ ] Machine learning for better term extraction
- [ ] Natural language processing for content analysis
- [ ] Automatic citation generation
- [ ] Collaborative research sessions
- [ ] Export research findings
- [ ] Browser extension version
- [ ] Mobile app version

## Contributing

This is an open research platform. Contributions welcome for:
- Adding more curated websites
- Improving term extraction algorithms
- Adding new research categories
- Enhancing UI/UX
- Bug fixes and optimizations

## License

Open source - feel free to use, modify, and distribute.

## About

Mongoose Research Hub was created to enable multi-scale discovery through parallel research, intelligent term combination, and comprehensive resource curation. The platform embodies the philosophy of examining both the forest and the trees - understanding broad patterns while diving deep into specific details.

**From microscale to macroscale - explore the universe of knowledge.**
# mongoose.os - Infinity Portal

Trick bike Freestyle BMX scripting meets AI-powered ecosystem development.

## Rogers AI Console

An interactive AI console with voice capabilities, token-based rewards, and GitHub integration.

### Quick Start

#### Frontend Only (Testing)
1. Open `rogers-ai-console.html` in your web browser
2. Enable "Force enable" checkbox to test without backend
3. Interact with the console UI

#### With Backend
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the backend server:
   ```bash
   python rogers_backend.py
   ```

3. Open `rogers-ai-console.html` in your browser
4. The console should connect automatically to `http://127.0.0.1:5000`

### Features

- **Interactive Chat Interface**: Clean, modern UI with blue buttons and dark theme
- **Token System**: Color-coded interactive tokens for different actions
  - 🟡 Yellow: Applications/Clickable items
  - 🟣 Purple: Published/Public content
  - 🔵 Blue: Input prompts
  - 🟢 Green: Completed tasks
  - 🟠 Orange: Warnings/Risks
  - 🔴 Red: Errors
- **Voice Support**: Built-in TTS capability
- **GitHub Integration**: Code search and commit operations
- **Encryption**: Dual-AI encryption for sensitive data
- **Token Wallet**: Earn and spend tokens for interactions

### Files

- `rogers-ai-console.html` - Main UI interface
- `rogers_backend.py` - Python Flask backend
- `infinity-utils.js` - JavaScript utilities for encryption, GitHub, and authentication
- `INFINITY_CONFIG.md` - Complete ecosystem configuration and documentation
- `requirements.txt` - Python dependencies

### Infinity Ecosystem

This is part of a larger vision for the Infinity Portal ecosystem, which includes:

- **Core Apps**: Wallet, Idea Cloud, Market, Voice, Builder
- **Media District**: Times, Science Journal, Magazines, Investigates
- **Music & Cinema**: Instrument Lab, Soundcloud, Players, Cinema
- **Governance**: Operation Trident, Vision Hub, Horizon Mapper
- **Engineering**: Machinist Tools, Boundary Control

See `INFINITY_CONFIG.md` for complete details.

### Configuration

#### Voice UI (ElevenLabs)
To enable advanced voice synthesis, add your ElevenLabs API key to the configuration.

#### GitHub Integration
1. Generate a GitHub Personal Access Token (PAT)
2. Store it securely in your browser's session storage
3. Use the `setToken()` function in `infinity-utils.js`

### Development

The codebase follows these principles:
- **Minimal changes**: Surgical, precise modifications
- **Security first**: Encryption and secure token handling
- **User experience**: Clean, intuitive interface
- **Extensibility**: Modular design for future enhancements

### Contributing

This is an experimental platform combining AI, voice interaction, and gamification. Contributions welcome!
# mongoose.os
Trick bike Freestyle BMX scripting

## Logged Octave Shell

This repository provides a logged wrapper for GNU Octave that captures all inputs and outputs with timestamps.

### Files

- **`run_octave_logged.py`** - Main script to run Octave with logging
- **`log_server.py`** - HTTP server to view logs via web interface
- **`index.html`** - Web UI for log viewing
- **`logs/txt.log`** - Log file (created automatically)

### Installation

1. Install GNU Octave:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install octave
   
   # macOS
   brew install octave
   ```

2. Clone this repository:
   ```bash
   git clone https://github.com/pewpi-infinity/mongoose.os.git
   cd mongoose.os
   ```

### Usage

#### Running the Logged Octave Shell

```bash
python3 run_octave_logged.py
```

**Behavior:**
- Every user input is logged as `[TIMESTAMP] [IN] ...`
- Every Octave response is logged as `[TIMESTAMP] [OUT] ...`
- Logs are saved to `logs/txt.log`

**Example:**
```
octave> x = 5
x = 5
octave> y = x * 2
y = 10
octave> quit
```

This will create log entries like:
```
[2025-12-06 02:05:41] [IN] x = 5
[2025-12-06 02:05:41] [OUT] x = 5
[2025-12-06 02:05:45] [IN] y = x * 2
[2025-12-06 02:05:45] [OUT] y = 10
[2025-12-06 02:05:48] [IN] quit
```

#### Viewing Logs via Web Interface

In a separate terminal, start the log server:

```bash
python3 log_server.py
```

Then open your browser to: `http://localhost:8000/`

**Features:**
- Real-time log viewing
- Auto-refresh option (every 5 seconds)
- Syntax highlighting for inputs/outputs
- Clear logs functionality
- Responsive dark theme interface

### Mathematical Context

This tool is designed to help explore complex mathematical problems and equations, including:

1. **Three-body problem** - Gravitational interactions
2. **Navier-Stokes equations** - Fluid dynamics
3. **Yang-Mills theory** - Quantum field theory
4. **Riemann hypothesis** - Number theory
5. **And many more...**

The logged shell allows you to experiment with numerical solutions and maintain a complete history of your computational experiments.

### API Endpoints

The log server provides the following API endpoints:

- `GET /` - Serves the web interface
- `GET /api/logs` - Returns log content as JSON
- `GET /api/clear` - Clears the log file

### Development

To contribute or modify:

1. Fork the repository
2. Make your changes
3. Test with Octave installed
4. Submit a pull request

### License

See repository license for details.
