# Infinity Portal Configuration

This document outlines the configuration and structure for the Infinity Portal ecosystem.

## Voice UI Configuration

### ElevenLabs Integration
To enable voice synthesis for Rogers AI, you'll need an ElevenLabs API key:

```javascript
// Add to your environment or config
const ELEVENLABS_API_KEY = "your_api_key_here";
const ELEVENLABS_VOICE_ID = "your_voice_id_here";
```

### Voice Settings
- **Default Voice**: Rogers (configurable)
- **Prosody**: Natural, conversational
- **Rate**: 1.0 (adjustable 0.5 - 2.0)
- **TTS Provider**: Browser native or ElevenLabs API

## GitHub Integration

### Authentication
GitHub Personal Access Token (PAT) required for:
- Code search across repositories
- Commit operations
- Repository management

**Scopes needed**:
- `repo` (full repository access)
- `read:org` (if working with organization repos)

### Default Repository
- **Owner**: pewpi-infinity
- **Repo**: mongoose.os

## Infinity Ecosystem Apps

### Core Apps
1. **Infinity Wallet** - Token management and transactions
2. **Idea Cloud** - Collaborative ideation platform
3. **Infinity Market** - Buy/sell/trade marketplace
4. **Rogers Voice** - AI guide with voice interaction
5. **Infinity Builder** - App creation and templates
6. **Conversion Lab** - Optimization flows
7. **Infinity Stage** - 3D world navigation

### Media District
1. **Infinity Times** - News and investigations
2. **Infinity Science Journal** - Visual scientific stories
3. **Infinity Magazines Hub** - Multi-topic publications
4. **Infinity Investigates** - Deep-dive research

### Music and Cinema
1. **Instrument Lab** - Music creation tools
2. **Infinity Soundcloud** - Music sharing platform
3. **Music Downloader/Player** - Retro iPod-style interface
4. **Movie Player** - Archive-linked media
5. **Infinity Cinema** - 3D theater experience

### Knowledge & Images
1. **Infinity Photovault** - Categorized image library
   - Strict categorization (animals, instruments, landscapes, etc.)
   - AI-powered lookup and retrieval
   - Contributor token rewards

### Governance & Strategy
1. **Operation Trident** - Defense and integrity
2. **Vision Hub** - CEO dashboard and planning
3. **Horizon Mapper** - Long-term strategic planning
4. **Convergence Studio** - Cross-domain integration

### Tech Playbooks
1. **Moonshot Sprint Hub** - Weekly challenges
2. **Expert Lens** - Knowledge distillation
3. **Infinity Voice Builder** - Voice synthesis creation

### Engineering
1. **Machinist Tools** - Hardware and circuit design
2. **Boundary Control** - Ethics and safety guards

## Token System

### Token Types
- **Earn Tokens**: Contributions, achievements, app creation
- **Spend Tokens**: Marketplace purchases, premium features
- **Stake Tokens**: Governance and voting rights

### Token Rewards
- Daily streaks: +1-5 tokens
- App creation: +10-50 tokens
- Marketplace sales: 5% commission in tokens
- Community contributions: Variable based on impact

## Security

### Encryption
- Dual-AI encryption for sensitive data
- AES-GCM 256-bit encryption
- PBKDF2 key derivation with 100,000 iterations

### Session Management
- Passphrase-based authentication
- Session storage for temporary credentials
- Automatic logout on inactivity (configurable)

## UI/UX Guidelines

### Design System
- **Primary Color**: Blue (#2563eb)
- **Background**: Dark (#0d1117)
- **Surface**: Dark gray (#161b22)
- **Text**: Light gray (#c9d1d9)
- **Success**: Green (#3fb950)
- **Error**: Red (#da3633)

### Button Styles
- Blue buttons with hover states
- Consistent padding (8px 12px)
- Border radius: 8px
- Bold font weight

### Token Colors (Interactive Elements)
- **Yellow** (#FDE68A): Applications/clickable
- **Purple** (#C7B2FF): Published/public
- **Blue** (#93C5FD): Ready for input
- **Green** (#86efac): Completed
- **Orange** (#fb923c): Risk/warning
- **Red** (#fb7185): Error

## API Endpoints

### Rogers AI Backend
Expected endpoints for full functionality:

```
GET  /api/status          - Health check
POST /api/bot/execute     - Execute AI command
GET  /api/wallet/balance  - Get token balance
POST /api/wallet/spend    - Spend tokens
POST /api/wallet/earn     - Earn tokens
```

### Expected Response Format
```json
{
  "ok": true,
  "response": "AI response with [blue:tokens] embedded",
  "tokens_spent": 0,
  "tokens_earned": 0
}
```

## Development Setup

### Frontend
1. Open `rogers-ai-console.html` in a web browser
2. Configure server URL (default: http://127.0.0.1:5000)
3. Test with "Force enable" checkbox for offline development

### Backend (To Be Implemented)
1. Python Flask or FastAPI server
2. Integration with OpenAI/Anthropic APIs
3. Database for token tracking (SQLite/PostgreSQL)
4. GitHub API integration

## Future Enhancements

### Phase 1 (Current)
- [x] Rogers AI Console UI
- [x] Token-based interaction system
- [x] GitHub integration utilities
- [ ] Backend API implementation

### Phase 2
- [ ] Voice synthesis integration (ElevenLabs)
- [ ] 3D portal navigation (Three.js)
- [ ] Wallet management UI
- [ ] Marketplace frontend

### Phase 3
- [ ] Full ecosystem integration
- [ ] Mobile app (React Native)
- [ ] Blockchain integration for tokens
- [ ] Community governance system

## References

- [Rogers AI Console](./rogers-ai-console.html) - Main UI
- [Infinity Utils](./infinity-utils.js) - JavaScript utilities
- ElevenLabs API: https://elevenlabs.io/docs
- GitHub API: https://docs.github.com/en/rest