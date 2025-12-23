# Infinity Research Hub - Documentation

## Overview

Infinity Research Hub is a web-based platform for publishing, tokenizing, and discovering scientific research papers. It provides a clean, politics-free environment focused solely on advancing scientific knowledge.

## Features

### 1. Research News Feed
- Browse all published research papers in a clean, modern interface
- Papers are displayed as cards with title, author, abstract, keywords, and token value
- Latest papers appear first
- Click on any paper card to view more details

### 2. Paper Editor Terminal
- Interactive editor for creating research papers
- Required fields:
  - **Title**: The title of your research paper
  - **Author**: Your name (defaults to "Anonymous" if not provided)
  - **Keywords**: Comma-separated keywords for discovery
  - **Abstract**: Brief summary of your research
  - **Content**: Full research content
  - **References**: Citations and references

### 3. Tokenization System
- Each published paper automatically generates Research Tokens (RT)
- Token value is calculated based on:
  - Word count (1 token per 100 words)
  - Quality metrics
  - Minimum value: 1 RT
- Tokens are credited to the author's account
- Track your total token balance and paper count

### 4. Infinity Database
- All research papers are stored in the Infinity Database
- Persistent storage using browser localStorage
- Full-text search across all papers
- Statistics dashboard showing:
  - Total papers in database
  - Total tokens distributed
  - Number of active researchers

### 5. User Management
- Automatic user creation on first visit
- Personal token wallet
- Track your published papers
- View your contribution history

## How to Use

### Publishing Your First Paper

1. Navigate to the **Paper Editor** section
2. Fill in the required fields:
   - Enter your paper title
   - Add your name as author
   - List relevant keywords
   - Write a compelling abstract
   - Add your full research content
   - Include references
3. Click **"Tokenize & Submit Research"**
4. Your paper is instantly:
   - Added to the database
   - Displayed in the news feed
   - Tokenized with RT value
   - Saved as a text file

### Earning Tokens

Tokens are automatically awarded when you publish research:
- Base tokens: 1 RT per 100 words
- Quality bonus: 1-5 RT
- Minimum: 1 RT per paper

### Searching Research

1. Go to the **Database** section
2. Enter keywords in the search box
3. Results show all matching papers
4. Search covers titles, abstracts, keywords, and content

### Saving Drafts

- Click **"Save Draft"** to save your work in progress
- Drafts are stored locally
- Resume editing anytime

## Technical Architecture

### Frontend
- Pure HTML5, CSS3, and JavaScript
- No external dependencies
- Responsive design for all devices
- localStorage for data persistence

### Backend
- Simple Node.js HTTP server
- Serves static files from `/public` directory
- No database required (client-side storage)

### Data Storage

#### Infinity Database Structure
```json
{
  "papers": [
    {
      "id": "unique-id",
      "title": "Paper Title",
      "author": "Author Name",
      "keywords": "keyword1, keyword2",
      "abstract": "Paper abstract",
      "content": "Full content",
      "references": "References",
      "timestamp": "ISO-8601 timestamp",
      "userId": "user-id",
      "tokenValue": 15,
      "reads": 0,
      "metadata": {
        "link": "#paper-id",
        "wordCount": 500
      }
    }
  ],
  "tokens": [
    {
      "id": "token-id",
      "paperId": "paper-id",
      "userId": "user-id",
      "value": 15,
      "created": "ISO-8601 timestamp"
    }
  ],
  "metadata": {
    "created": "ISO-8601 timestamp",
    "totalPapers": 0,
    "totalTokens": 0,
    "researchers": []
  }
}
```

#### User Data Structure
```json
{
  "id": "unique-id",
  "name": "User Name",
  "tokens": 0,
  "papers": ["paper-id-1", "paper-id-2"],
  "joined": "ISO-8601 timestamp"
}
```

## Installation

### Prerequisites
- Node.js 14.0.0 or higher

### Setup
1. Clone the repository
2. Navigate to the project directory
3. Run: `npm start`
4. Open browser to `http://localhost:3000`

### No Dependencies
This project uses only Node.js built-in modules:
- `http` - Web server
- `fs` - File system
- `path` - Path utilities

## File Structure

```
infinity-research-hub/
├── public/              # Frontend application
│   ├── index.html      # Main interface
│   ├── css/styles.css  # Styling (dark theme)
│   ├── js/app.js       # Application logic
│   └── research/       # Example research papers
├── src/server.js       # Node.js server
├── docs/README.md      # Comprehensive documentation
├── package.json        # Project metadata
└── README.md          # Updated project overview
```

## Design Philosophy

### Science First
- No political content
- Focus on research and discovery
- Clean, distraction-free interface
- Professional scientific atmosphere

### Tokenization
- Fair compensation for research contributions
- Transparent token calculation
- Immutable research records
- Decentralized knowledge sharing

### Accessibility
- Simple, intuitive interface
- No registration required
- Works offline after first load
- Fast, responsive performance

## Future Enhancements

Potential features for future development:
1. Peer review system
2. Collaborative editing
3. Citation tracking
4. Export to PDF/LaTeX
5. Integration with academic databases
6. Token trading marketplace
7. Advanced analytics
8. Mobile app
9. API for external access
10. Blockchain integration for token authenticity

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All modern browsers with localStorage support.

## License

MIT License - Free to use and modify

## Contributing

Contributions welcome! Focus areas:
- Research paper templates
- Token calculation improvements
- Search algorithm enhancements
- UI/UX improvements
- Documentation

## Support

For issues or questions:
1. Check this documentation
2. Review example papers in `/public/research/`
3. Inspect browser console for errors

## Privacy

- All data stored locally in your browser
- No server-side tracking
- No analytics
- No cookies
- Complete privacy and control

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: Production Ready
