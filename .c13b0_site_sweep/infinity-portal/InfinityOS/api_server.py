#!/usr/bin/env python3
"""
Infinity Portal AI Backend API Server (FastAPI on Port 8000)

This server provides a comprehensive token economy system and modular AI routing
for the Infinity Portal ecosystem. It integrates with the main SPA on port 8080.

Features:
- Token-based economy with rewards and costs
- Google OAuth user tracking via Sub ID
- Modular AI routing (Gemini, Watson AI ready, Rogers AI)
- RESTful API for frontend integration
- In-memory token ledger (ready for database expansion)

Run with: python3 api_server.py
Access at: http://127.0.0.1:8000
Documentation: http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional
import uvicorn
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Infinity Portal AI Backend",
    description="Token-based AI routing system for Infinity Portal",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration - allow the SPA on port 8080 to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8080", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# TOKEN LEDGER - In-memory storage for user tokens
# ============================================================================
TOKEN_LEDGER: Dict[str, int] = {}
INITIAL_BALANCE = 100

def get_user_balance(user_id: str) -> int:
    """Get user's current token balance, initializing if new user."""
    if user_id not in TOKEN_LEDGER:
        TOKEN_LEDGER[user_id] = INITIAL_BALANCE
        logger.info(f"New user {user_id} initialized with {INITIAL_BALANCE} tokens")
    return TOKEN_LEDGER[user_id]

def update_user_balance(user_id: str, change: int) -> int:
    """Update user balance and return new balance."""
    current = get_user_balance(user_id)
    new_balance = current + change
    TOKEN_LEDGER[user_id] = new_balance
    logger.info(f"User {user_id}: {current} → {new_balance} (change: {change:+d})")
    return new_balance

# ============================================================================
# TOKEN ECONOMY CALCULATION
# ============================================================================
def calculate_token_change(prompt_type: str, text: str) -> int:
    """
    Calculate token change based on module type and prompt characteristics.
    
    Token Economy Rules:
    - Base reward: +5 for any successful interaction
    - Strategy/Logic: -10 (complex analysis)
    - Rogers AI: -15 (high-quality generation)
    - Frog Bowl (Auction): -5 (state manipulation)
    - Portal Hub (Liquidity): -2 (financial calculations)
    - Watson AI: -12 (external API call)
    - Complex prompt (>150 chars): +8 bonus
    - Short/vague prompt (<20 chars): -3 penalty
    """
    base_reward = 5
    module_cost = 0
    
    # Module-specific costs
    if "strategy" in prompt_type or "logic" in prompt_type:
        module_cost = -10
    elif "rogers" in prompt_type or "ai_chat" in prompt_type:
        module_cost = -15
    elif "auction" in prompt_type or "frog_bowl" in prompt_type:
        module_cost = -5
    elif "liquidity" in prompt_type or "portal_hub" in prompt_type:
        module_cost = -2
    elif "watson" in prompt_type:
        module_cost = -12
    
    # Prompt quality adjustments
    prompt_bonus = 0
    if len(text) > 150:
        prompt_bonus = 8  # Reward detailed input
    elif len(text) < 20:
        prompt_bonus = -3  # Penalty for vague queries
    
    total_change = base_reward + module_cost + prompt_bonus
    return total_change

# ============================================================================
# PYDANTIC MODELS
# ============================================================================
class SuggestRequest(BaseModel):
    user_id: str
    text: str
    prompt_type: str = "general"
    
    class Config:
        schema_extra = {
            "example": {
                "user_id": "100000000000000000000",
                "text": "Analyze the market trends for token economics",
                "prompt_type": "logic:strategy_test"
            }
        }

class SuggestResponse(BaseModel):
    status: str
    suggestion: str
    token_change: int
    new_balance: int
    timestamp: str

class TokenBalanceResponse(BaseModel):
    user_id: str
    balance: int

# ============================================================================
# AI MODULE ROUTING
# ============================================================================
def generate_ai_suggestion(prompt_type: str, text: str, user_id: str) -> str:
    """
    Route the request to the appropriate AI module based on prompt_type.
    
    Current modules:
    - logic:strategy_test - Strategic analysis
    - logic:auction_logic - Frog Bowl auction system
    - portal:liquidity - Financial calculations
    - rogers:ai_chat - Rogers AI responses
    - watson:discovery - Watson AI (ready for integration)
    
    To integrate Watson AI:
    1. Add Watson SDK: pip install ibm-watson
    2. Add credentials to environment variables
    3. Implement Watson-specific logic in this function
    """
    
    # Strategy/Logic Module
    if "strategy" in prompt_type:
        return f"""
🧠 Strategic Analysis for: "{text[:50]}..."

Market Signal Analysis:
• Probability Index: 72%
• Risk Factor: Moderate (3/5)
• Opportunity Window: 48-72 hours

Recommended Actions:
1. Monitor token velocity (±15% threshold)
2. Diversify portfolio across 3-5 modules
3. Set alerts for >100 token transactions

Insight: Current market conditions favor long-term holdings with strategic 
liquidity reserves. Consider allocating 30% to high-reward modules.
"""
    
    # Auction/Frog Bowl Module
    elif "auction" in prompt_type or "frog_bowl" in prompt_type:
        return f"""
🐸 Frog Bowl Auction System

Processing: "{text}"

Current Auction State:
• Active Bids: 12
• Top Bid: 85 tokens
• Time Remaining: 14:32

Your Action Options:
- BID [amount]: Place a bid
- OBSERVE: Watch auction without participating
- LIQUIDITY: Check available tokens

Status: Ready for bid. Minimum increment: 5 tokens.
"""
    
    # Portal Hub/Liquidity Module
    elif "liquidity" in prompt_type or "portal" in prompt_type:
        return f"""
💧 Portal Hub - Liquidity Analysis

Query: "{text}"

Liquidity Metrics:
• Total Pool: 45,230 tokens
• Your Share: {get_user_balance(user_id)} tokens ({(get_user_balance(user_id)/45230*100):.2f}%)
• 24h Volume: 8,450 tokens
• APY: 12.5%

Available Operations:
- DEPOSIT: Add tokens to liquidity pool
- WITHDRAW: Remove tokens (24h cooldown)
- SWAP: Exchange between token pairs
- STAKE: Earn passive rewards

Recommendation: Optimal deposit range 50-200 tokens for your balance tier.
"""
    
    # Rogers AI Module
    elif "rogers" in prompt_type:
        return f"""
🤖 Rogers AI Response

Processing query: "{text}"

Hello! I'm Rogers, your AI assistant for the Infinity Portal. I can help you with:

• Token strategy and economics
• Module navigation and recommendations
• Market analysis and trend forecasting
• Integration with external services (Watson AI, web search)

Based on your query, I recommend:
1. Explore the Strategy Logic module for detailed analysis
2. Check Portal Hub for liquidity opportunities
3. Monitor Frog Bowl auctions for high-reward trades

I'm here to guide you through the Infinity ecosystem. What would you like to explore?
"""
    
    # Watson AI Module (Ready for integration)
    elif "watson" in prompt_type:
        return f"""
🔬 Watson AI Discovery (Integration Ready)

Query: "{text}"

[Integration Point]
To activate Watson AI:
1. Install: pip install ibm-watson
2. Configure Watson Discovery credentials
3. Implement Watson NLU/Assistant API calls here

Simulated Watson Response:
• Entity Recognition: [Trading, Tokens, Strategy]
• Sentiment Score: 0.82 (Positive)
• Confidence: 91%
• Recommended Documents: 5 matching results

Status: Watson AI module ready for deployment with credentials.
"""
    
    # Default/General Module
    else:
        return f"""
✨ Infinity AI Response

Your input: "{text}"

Available Modules:
• logic:strategy_test - Strategic market analysis
• logic:auction_logic - Frog Bowl auction system
• portal:liquidity - Liquidity pool management
• rogers:ai_chat - AI assistant interactions
• watson:discovery - Watson AI integration (ready)

Token Economy Active:
- Balance: {get_user_balance(user_id)} tokens
- Rewards for detailed prompts (>150 chars): +8 tokens
- Costs vary by module complexity (-2 to -15 tokens)

Tip: Specify a prompt_type for module-specific responses!
"""

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """API root endpoint - health check and info."""
    return {
        "service": "Infinity Portal AI Backend",
        "status": "operational",
        "version": "1.0.0",
        "port": 8000,
        "frontend": "http://127.0.0.1:8080",
        "docs": "http://127.0.0.1:8000/docs",
        "active_users": len(TOKEN_LEDGER),
        "total_tokens_distributed": sum(TOKEN_LEDGER.values())
    }

@app.get("/gemini/tokens/{user_id}", response_model=TokenBalanceResponse)
async def get_tokens(user_id: str):
    """
    Endpoint A: Token Retrieval
    
    Retrieves the current token balance for any user ID.
    New users are automatically initialized with INITIAL_BALANCE tokens.
    
    Example: GET /gemini/tokens/100000000000000000000
    """
    balance = get_user_balance(user_id)
    return TokenBalanceResponse(user_id=user_id, balance=balance)

@app.post("/gemini/suggest", response_model=SuggestResponse)
async def suggest(request: SuggestRequest):
    """
    Endpoint B: Module Execution and Interaction
    
    The central execution endpoint for all application modules.
    Processes commands, applies token changes, and returns AI responses.
    
    Parameters:
    - user_id: Google Sub ID or Anonymous ID (MANDATORY)
    - text: User's input/query
    - prompt_type: Module identifier (e.g., "logic:strategy_test")
    
    Returns:
    - AI-generated response
    - Token change applied
    - New balance after transaction
    
    Example: POST /gemini/suggest
    {
        "user_id": "100000000000000000000",
        "text": "Analyze market trends",
        "prompt_type": "logic:strategy_test"
    }
    """
    # Calculate token change based on module and prompt
    token_change = calculate_token_change(request.prompt_type, request.text)
    
    # Check if user has sufficient balance (prevent negative balance)
    current_balance = get_user_balance(request.user_id)
    if current_balance + token_change < 0:
        raise HTTPException(
            status_code=403,
            detail=f"Insufficient tokens. Required: {abs(token_change)}, Available: {current_balance}"
        )
    
    # Update balance
    new_balance = update_user_balance(request.user_id, token_change)
    
    # Generate AI response
    suggestion = generate_ai_suggestion(request.prompt_type, request.text, request.user_id)
    
    # Return response
    return SuggestResponse(
        status=f"OK - Processed by {request.prompt_type}",
        suggestion=suggestion,
        token_change=token_change,
        new_balance=new_balance,
        timestamp=datetime.now().isoformat()
    )

@app.get("/users/stats")
async def user_stats():
    """Get overall system statistics."""
    if not TOKEN_LEDGER:
        return {
            "total_users": 0,
            "total_tokens": 0,
            "average_balance": 0
        }
    
    return {
        "total_users": len(TOKEN_LEDGER),
        "total_tokens": sum(TOKEN_LEDGER.values()),
        "average_balance": sum(TOKEN_LEDGER.values()) / len(TOKEN_LEDGER),
        "top_users": sorted(TOKEN_LEDGER.items(), key=lambda x: x[1], reverse=True)[:5]
    }

# ============================================================================
# SERVER STARTUP
# ============================================================================
if __name__ == "__main__":
    print("=" * 70)
    print("🚀 Infinity Portal AI Backend API Server")
    print("=" * 70)
    print(f"📍 Running on: http://127.0.0.1:8000")
    print(f"📖 API Docs: http://127.0.0.1:8000/docs")
    print(f"🔗 Frontend SPA: http://127.0.0.1:8080")
    print(f"🪙 Initial Token Balance: {INITIAL_BALANCE} tokens per user")
    print("=" * 70)
    print("\nPress Ctrl+C to stop the server\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
