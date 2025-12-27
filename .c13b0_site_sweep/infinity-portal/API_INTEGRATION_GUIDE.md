# Infinity Portal API Backend Integration Guide

## Overview

This document explains how to integrate the Infinity Portal FastAPI backend (port 8000) with the frontend SPA (port 8080).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Infinity Portal Ecosystem                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend SPA (Port 8080)           Backend API (Port 8000)  │
│  ├─ Google OAuth                    ├─ Token Ledger          │
│  ├─ UI/UX Components                ├─ AI Module Routing     │
│  ├─ Token Display                   ├─ Economy Calculation   │
│  └─ Rogers AI Chat                  └─ Watson AI Ready       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Start Both Servers

**Terminal 1 - API Backend (Port 8000):**
```bash
cd ~/infinity-portal/InfinityOS
bash start_api.sh
```

**Terminal 2 - Frontend SPA (Port 8080):**
```bash
cd ~/infinity-portal/InfinityOS
python3 spa_server.py
```

### 2. Access Points

- **Frontend**: http://127.0.0.1:8080
- **API Backend**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs
- **Alternative Docs**: http://127.0.0.1:8000/redoc

## API Endpoints

### Endpoint A: Get Token Balance

**GET** `/gemini/tokens/{user_id}`

Retrieves current token balance for a user.

**Example Request:**
```bash
curl http://127.0.0.1:8000/gemini/tokens/100000000000000000000
```

**Example Response:**
```json
{
  "user_id": "100000000000000000000",
  "balance": 95
}
```

### Endpoint B: Execute Module (Main Endpoint)

**POST** `/gemini/suggest`

Central execution endpoint for all AI modules.

**Example Request:**
```bash
curl -X POST http://127.0.0.1:8000/gemini/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "100000000000000000000",
    "text": "Analyze market trends for token economics",
    "prompt_type": "logic:strategy_test"
  }'
```

**Example Response:**
```json
{
  "status": "OK - Processed by logic:strategy_test",
  "suggestion": "🧠 Strategic Analysis...",
  "token_change": -10,
  "new_balance": 85,
  "timestamp": "2025-11-04T12:00:00.000000"
}
```

## Frontend Integration (JavaScript)

### Example: Fetch User Tokens

```javascript
async function getUserTokens(userId) {
    const response = await fetch(`http://127.0.0.1:8000/gemini/tokens/${userId}`);
    const data = await response.json();
    console.log(`User ${userId} has ${data.balance} tokens`);
    return data.balance;
}
```

### Example: Execute AI Module

```javascript
async function executeModule(userId, text, promptType) {
    const response = await fetch('http://127.0.0.1:8000/gemini/suggest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            text: text,
            prompt_type: promptType
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail);
    }
    
    const data = await response.json();
    console.log(`AI Response: ${data.suggestion}`);
    console.log(`Token change: ${data.token_change}`);
    console.log(`New balance: ${data.new_balance}`);
    return data;
}
```

### Example: Handle Insufficient Tokens

```javascript
try {
    const result = await executeModule(
        'user123',
        'Complex analysis request',
        'logic:strategy_test'
    );
    // Success - update UI
    updateTokenDisplay(result.new_balance);
    displayAIResponse(result.suggestion);
} catch (error) {
    // Handle insufficient tokens (403 error)
    console.error('Error:', error.message);
    alert('Insufficient tokens for this operation!');
}
```

## Token Economy Reference

| Action Category | Token Change | Description |
|----------------|--------------|-------------|
| Initial Balance | +100 | Every new user starts with this amount |
| Base Reward | +5 | Small reward for any successful interaction |
| Strategy Logic | -10 | High analysis, complex thought |
| Rogers AI | -15 | High-quality content generation |
| Frog Bowl (Auction) | -5 | Direct action/state manipulation |
| Portal Hub (Liquidity) | -2 | Financial calculations |
| Watson AI | -12 | External API call (when integrated) |
| Complex Prompt (>150 chars) | +8 | Reward for detailed input |
| Short Prompt (<20 chars) | -3 | Penalty for vague queries |

## Available Modules

### 1. Strategy Logic (`logic:strategy_test`)
- **Purpose**: Strategic market analysis
- **Cost**: -10 tokens
- **Use Case**: Complex decision-making, trend analysis

### 2. Frog Bowl Auction (`logic:auction_logic`)
- **Purpose**: Auction system management
- **Cost**: -5 tokens
- **Use Case**: Bidding, auction state tracking

### 3. Portal Hub Liquidity (`portal:liquidity`)
- **Purpose**: Financial calculations
- **Cost**: -2 tokens
- **Use Case**: Liquidity pool management, swaps

### 4. Rogers AI Chat (`rogers:ai_chat`)
- **Purpose**: AI assistant interactions
- **Cost**: -15 tokens
- **Use Case**: General queries, guidance

### 5. Watson AI Discovery (`watson:discovery`)
- **Purpose**: Advanced AI with Watson integration
- **Cost**: -12 tokens
- **Status**: Ready for integration (requires credentials)

## Watson AI Integration

To integrate Watson AI into the backend:

### Step 1: Install Watson SDK

```bash
pip install ibm-watson ibm-cloud-sdk-core
```

### Step 2: Configure Credentials

Add to environment variables or config file:
```bash
export WATSON_API_KEY="your-api-key"
export WATSON_URL="your-watson-url"
export WATSON_VERSION="2021-08-01"
```

### Step 3: Implement Watson Logic

Edit `api_server.py` in the `generate_ai_suggestion` function:

```python
elif "watson" in prompt_type:
    from ibm_watson import DiscoveryV2
    from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
    
    authenticator = IAMAuthenticator(os.getenv('WATSON_API_KEY'))
    discovery = DiscoveryV2(
        version=os.getenv('WATSON_VERSION'),
        authenticator=authenticator
    )
    discovery.set_service_url(os.getenv('WATSON_URL'))
    
    # Execute Watson query
    response = discovery.query(
        project_id='your-project-id',
        natural_language_query=text
    ).get_result()
    
    return format_watson_response(response)
```

## Running Both Servers Together

### Option 1: Two Terminals (Development)

```bash
# Terminal 1
cd ~/infinity-portal/InfinityOS
bash start_api.sh

# Terminal 2
cd ~/infinity-portal/InfinityOS
python3 spa_server.py
```

### Option 2: Background Processes (Production)

```bash
cd ~/infinity-portal/InfinityOS

# Start API backend in background
nohup python3 api_server.py > ../api.log 2>&1 &

# Start SPA frontend in background
nohup python3 spa_server.py > ../spa.log 2>&1 &

# Check status
ps aux | grep python3
```

### Option 3: Combined Startup Script

Create `start_all.sh`:
```bash
#!/bin/bash
cd ~/infinity-portal/InfinityOS

# Start API backend
nohup python3 api_server.py > ../api.log 2>&1 &
API_PID=$!
echo "API Backend started (PID: $API_PID)"

# Wait for API to be ready
sleep 2

# Start SPA frontend
nohup python3 spa_server.py > ../spa.log 2>&1 &
SPA_PID=$!
echo "SPA Frontend started (PID: $SPA_PID)"

echo ""
echo "✅ Both servers running!"
echo "📍 Frontend: http://127.0.0.1:8080"
echo "📍 API: http://127.0.0.1:8000"
echo "📖 Docs: http://127.0.0.1:8000/docs"
```

## Testing the API

### Using cURL

```bash
# Health check
curl http://127.0.0.1:8000/

# Get token balance
curl http://127.0.0.1:8000/gemini/tokens/test_user_123

# Execute module
curl -X POST http://127.0.0.1:8000/gemini/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "text": "What is the current market trend?",
    "prompt_type": "logic:strategy_test"
  }'
```

### Using Python

```python
import requests

# Get tokens
response = requests.get('http://127.0.0.1:8000/gemini/tokens/test_user')
print(response.json())

# Execute module
response = requests.post('http://127.0.0.1:8000/gemini/suggest', json={
    'user_id': 'test_user',
    'text': 'Analyze the token economics',
    'prompt_type': 'logic:strategy_test'
})
print(response.json())
```

## Error Handling

### 403 Forbidden - Insufficient Tokens

```json
{
  "detail": "Insufficient tokens. Required: 15, Available: 10"
}
```

**Solution**: User needs more tokens. Show UI message prompting engagement to earn tokens.

### 422 Validation Error

```json
{
  "detail": [
    {
      "loc": ["body", "user_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Solution**: Ensure all required fields (user_id, text, prompt_type) are provided.

## Security Considerations

1. **User ID Validation**: Currently accepts any string as user_id. For production, validate against Google OAuth Sub IDs.

2. **Rate Limiting**: Consider adding rate limiting to prevent abuse:
```python
from slowapi import Limiter
limiter = Limiter(key_func=lambda: request.client.host)

@app.post("/gemini/suggest")
@limiter.limit("10/minute")
async def suggest(request: SuggestRequest):
    ...
```

3. **Token Persistence**: Current implementation uses in-memory storage. For production:
   - Use Redis for session storage
   - Use PostgreSQL/MongoDB for permanent records
   - Implement backup/restore mechanisms

## Monitoring & Debugging

### Check Active Users
```bash
curl http://127.0.0.1:8000/users/stats
```

### View Logs
```bash
# API logs
tail -f ~/infinity-portal/api.log

# SPA logs
tail -f ~/infinity-portal/spa.log
```

### Interactive API Documentation

Visit http://127.0.0.1:8000/docs to:
- Try endpoints interactively
- View request/response schemas
- Test authentication flows
- Debug API issues

## Next Steps

1. **Integrate with Frontend SPA**: Update `spa_server.py` to call the API backend
2. **Add Watson AI**: Follow Watson integration steps above
3. **Implement Persistence**: Add database for token ledger
4. **Deploy Together**: Set up both servers to run on system startup
5. **Add More Modules**: Expand AI routing with new capabilities

## Support

For issues or questions:
- Check API docs: http://127.0.0.1:8000/docs
- Review server logs: `tail -f ~/infinity-portal/*.log`
- Verify both servers are running: `ps aux | grep python3`
