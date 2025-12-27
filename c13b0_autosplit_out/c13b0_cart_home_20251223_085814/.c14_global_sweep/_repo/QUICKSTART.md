# Quick Start Guide - Infinity Research Hub

## Installation & Setup

### Prerequisites
- Node.js 14.0.0 or higher

### Running the Application

1. **Clone or navigate to the repository:**
   ```bash
   cd mongoose.os
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   You should see:
   ```
   🔬 Infinity Research Hub server running at http://localhost:3000/
   📁 Serving files from: /path/to/public
   ```

3. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - The application will automatically create a user account for you

## Using the Platform

### 1. Browse Research Papers

**Research Feed** (default view):
- See all published research papers
- Click on any paper card to view details
- Each paper shows:
  - Title and author
  - Abstract preview
  - Keywords as tags
  - Publication date
  - Token value (RT)

### 2. Create Your First Paper

Click **"Paper Editor"** in the navigation:

1. **Fill in the form:**
   - Title: "Your Research Title"
   - Author: "Your Name" (optional, defaults to "Anonymous")
   - Keywords: "keyword1, keyword2, keyword3"
   - Abstract: Brief summary of your research
   - Content: Your full research paper
   - References: Citations and references

2. **Submit:**
   - Click "Tokenize & Submit Research"
   - Your paper is instantly published
   - You earn Research Tokens (RT) based on content quality

3. **Save Draft (optional):**
   - Click "Save Draft" to save your work in progress
   - Resume editing anytime

### 3. Track Your Tokens

Click **"My Tokens"** to view:
- **Token Balance**: Total RT earned
- **Papers Published**: Number of your papers
- **Total Reads**: How many times your papers were viewed
- **Your Published Research**: All your papers in one place

### 4. Search the Database

Click **"Database"** to:
- View statistics (total papers, tokens, researchers)
- Search all research papers
- Browse the complete infinity database

**To search:**
1. Enter keywords in the search box
2. Click "Search" or press Enter
3. Results show all matching papers

## Understanding Tokens

### How Tokens are Calculated

Your research is rewarded with Research Tokens (RT):

**Base Tokens**: 1 RT per 100 words

**Quality Bonuses** (deterministic):
- Good readability (15-30 words/sentence): +1 RT
- Substantial content (>500 words): +1 RT
- Comprehensive content (>1000 words): +1 RT
- Well-structured (>10 sentences): +1 RT

**Minimum**: Every paper earns at least 1 RT

### Example Calculation

A 500-word paper with good structure:
- Base: 5 RT (500 words ÷ 100)
- Readability: +1 RT
- Substantial: +1 RT
- **Total: 7 RT**

## Features

✅ **Instant Publishing** - No approval needed  
✅ **Fair Rewards** - Transparent, deterministic token system  
✅ **Full Privacy** - All data stored in your browser  
✅ **No Registration** - Start using immediately  
✅ **Searchable** - Find any research by keywords  
✅ **Offline Capable** - Works after first load  

## Data Storage

All your data is stored locally in your browser:
- Research papers
- Token balance
- User profile
- Drafts

**Note**: Clearing browser data will erase your local database. Export important papers before clearing.

## Tips for Success

1. **Write Quality Content**: More comprehensive papers earn more tokens
2. **Use Keywords**: Help others discover your research
3. **Include References**: Academic citations add credibility
4. **Good Structure**: Break content into clear sections
5. **Save Drafts**: Don't lose your work in progress

## Troubleshooting

### Server Won't Start
- Ensure Node.js is installed: `node --version`
- Check if port 3000 is available
- Try a different port: `PORT=8080 npm start`

### Browser Issues
- Clear browser cache
- Try incognito/private mode
- Ensure JavaScript is enabled
- Use a modern browser (Chrome, Firefox, Safari, Edge)

### Lost Data
- Data is stored in browser localStorage
- Clearing browser data removes the database
- Use different browsers = different databases
- Export papers regularly for backup

## Next Steps

1. **Create Your First Paper**: Share your research
2. **Explore Examples**: Check `/public/research/` for sample papers
3. **Read Full Docs**: See `docs/README.md` for details
4. **Share the Platform**: Invite other researchers

## Support

- **Documentation**: `docs/README.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Project Overview**: `README.md`

## Philosophy

> "Pure Science. No Politics. Just Discovery."

Focus on advancing knowledge through quality research without distractions.

---

**Ready to contribute to science?** Start the server and create your first research paper!
