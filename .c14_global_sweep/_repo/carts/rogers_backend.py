"""
Rogers AI Backend Server
Simple Flask server for the Rogers AI Console
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Simple in-memory token storage (replace with database in production)
user_tokens = {}

@app.route('/api/status', methods=['GET'])
def status():
    """Health check endpoint"""
    return jsonify({
        'status': 'ready',
        'message': 'Rogers AI Backend is online'
    })

@app.route('/api/bot/execute', methods=['POST'])
def execute_bot():
    """
    Execute bot command and return response
    Expected request body: { "query": "user message" }
    """
    data = request.get_json()
    query = data.get('query', '').strip()
    
    if not query:
        return jsonify({
            'ok': False,
            'message': 'No query provided'
        }), 400
    
    # Simple response logic (replace with actual AI integration)
    response = generate_response(query)
    
    return jsonify({
        'ok': True,
        'response': response,
        'tokens_spent': 0,
        'tokens_earned': 1  # Earn 1 token per interaction
    })

@app.route('/api/wallet/balance', methods=['GET'])
def get_balance():
    """Get user token balance"""
    user_id = request.args.get('user_id', 'default')
    balance = user_tokens.get(user_id, 0)
    
    return jsonify({
        'ok': True,
        'balance': balance,
        'user_id': user_id
    })

@app.route('/api/wallet/spend', methods=['POST'])
def spend_tokens():
    """Spend tokens"""
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    amount = data.get('amount', 0)
    
    current_balance = user_tokens.get(user_id, 0)
    
    if current_balance >= amount:
        user_tokens[user_id] = current_balance - amount
        return jsonify({
            'ok': True,
            'new_balance': user_tokens[user_id],
            'spent': amount
        })
    else:
        return jsonify({
            'ok': False,
            'error': 'Insufficient tokens',
            'balance': current_balance
        }), 400

@app.route('/api/wallet/earn', methods=['POST'])
def earn_tokens():
    """Earn tokens"""
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    amount = data.get('amount', 1)
    reason = data.get('reason', 'Activity')
    
    current_balance = user_tokens.get(user_id, 0)
    user_tokens[user_id] = current_balance + amount
    
    return jsonify({
        'ok': True,
        'new_balance': user_tokens[user_id],
        'earned': amount,
        'reason': reason
    })

def generate_response(query):
    """
    Generate AI response (placeholder)
    Replace this with actual AI integration (OpenAI, Anthropic, etc.)
    """
    query_lower = query.lower()
    
    # Simple pattern matching responses
    if 'hello' in query_lower or 'hi' in query_lower:
        return "Hello! I'm Rogers AI. How can I assist you today? Try asking about [yellow:Infinity Apps] or your [blue:token balance]."
    
    elif 'token' in query_lower or 'balance' in query_lower:
        return "Your current token balance can be checked in the [yellow:Infinity Wallet]. You earn tokens through contributions and interactions!"
    
    elif 'help' in query_lower:
        return """I can help you with:
- [yellow:Infinity Apps] - Explore our ecosystem
- [blue:Token Management] - Check and manage tokens
- [purple:GitHub Integration] - Search and commit code
- [green:Voice Commands] - Enable TTS for spoken responses

What would you like to explore?"""
    
    elif 'app' in query_lower or 'infinity' in query_lower:
        return """[purple:Infinity Portal Ecosystem] includes:
- [yellow:Infinity Wallet] - Manage tokens and transactions
- [yellow:Idea Cloud] - Collaborate on ideas
- [yellow:Rogers Voice] - AI voice assistant
- [yellow:Infinity Builder] - Create your own apps
- [yellow:Infinity Market] - Trade and exchange

Click any [yellow:yellow tag] to explore!"""
    
    elif 'error' in query_lower or 'problem' in query_lower:
        return "[red:Error] If you're experiencing issues, check the Diagnostics section below or [orange:contact support]."
    
    else:
        # Generic response
        return f"I received your message: '{query}'. I'm still learning! Try asking about [blue:help], [blue:tokens], or [blue:apps]."

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    
    print(f"Starting Rogers AI Backend on port {port}")
    print(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
