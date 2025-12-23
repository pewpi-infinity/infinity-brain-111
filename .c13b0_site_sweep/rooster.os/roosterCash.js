/**
 * Rooster Cash Payment System
 * Manages the virtual currency for the marketplace
 */

class RoosterCashSystem {
  constructor() {
    this.users = new Map(); // userId -> balance
    this.transactions = [];
    this.paypalEmail = 'watsonkris611@gmail.com';
    this.roosterCashPrice = 1.00; // $1 per rooster cash
  }

  /**
   * Create a new user wallet
   * @param {string} userId - Unique user identifier
   * @returns {Object} User wallet info
   */
  createWallet(userId) {
    if (this.users.has(userId)) {
      throw new Error('User wallet already exists');
    }
    
    this.users.set(userId, {
      balance: 0,
      transactions: [],
      createdAt: new Date()
    });
    
    return this.getWallet(userId);
  }

  /**
   * Get user wallet information
   * @param {string} userId - User identifier
   * @returns {Object} Wallet details
   */
  getWallet(userId) {
    const wallet = this.users.get(userId);
    if (!wallet) {
      throw new Error('User wallet not found');
    }
    return { userId, ...wallet };
  }

  /**
   * Purchase rooster cash via PayPal
   * @param {string} userId - User identifier
   * @param {number} amount - Amount of rooster cash to purchase
   * @param {string} paypalTransactionId - PayPal transaction ID
   * @returns {Object} Transaction details
   */
  purchaseRoosterCash(userId, amount, paypalTransactionId) {
    if (!this.users.has(userId)) {
      this.createWallet(userId);
    }

    if (amount <= 0) {
      throw new Error('Purchase amount must be greater than 0');
    }

    const wallet = this.users.get(userId);
    wallet.balance += amount;

    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      userId,
      type: 'purchase',
      amount,
      paypalTransactionId,
      totalCost: amount * this.roosterCashPrice,
      timestamp: new Date()
    };

    wallet.transactions.push(transaction);
    this.transactions.push(transaction);

    return transaction;
  }

  /**
   * Sell rooster cash back via PayPal
   * @param {string} userId - User identifier
   * @param {number} amount - Amount of rooster cash to sell
   * @returns {Object} Transaction details
   */
  sellRoosterCash(userId, amount) {
    const wallet = this.users.get(userId);
    if (!wallet) {
      throw new Error('User wallet not found');
    }

    if (amount <= 0) {
      throw new Error('Sell amount must be greater than 0');
    }

    if (wallet.balance < amount) {
      throw new Error('Insufficient rooster cash balance');
    }

    wallet.balance -= amount;

    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      userId,
      type: 'sell',
      amount,
      refundAmount: amount * this.roosterCashPrice,
      paypalEmail: this.paypalEmail,
      status: 'pending',
      timestamp: new Date()
    };

    wallet.transactions.push(transaction);
    this.transactions.push(transaction);

    return transaction;
  }

  /**
   * Transfer rooster cash between users
   * @param {string} fromUserId - Sender user ID
   * @param {string} toUserId - Recipient user ID
   * @param {number} amount - Amount to transfer
   * @returns {Object} Transaction details
   */
  transferRoosterCash(fromUserId, toUserId, amount) {
    const fromWallet = this.users.get(fromUserId);
    const toWallet = this.users.get(toUserId);

    if (!fromWallet || !toWallet) {
      throw new Error('One or both users not found');
    }

    if (amount <= 0) {
      throw new Error('Transfer amount must be greater than 0');
    }

    if (fromWallet.balance < amount) {
      throw new Error('Insufficient rooster cash balance');
    }

    fromWallet.balance -= amount;
    toWallet.balance += amount;

    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      fromUserId,
      toUserId,
      type: 'transfer',
      amount,
      timestamp: new Date()
    };

    fromWallet.transactions.push(transaction);
    toWallet.transactions.push(transaction);
    this.transactions.push(transaction);

    return transaction;
  }

  /**
   * Check if user has sufficient balance
   * @param {string} userId - User identifier
   * @param {number} amount - Amount to check
   * @returns {boolean} True if user has sufficient balance
   */
  hasSufficientBalance(userId, amount) {
    const wallet = this.users.get(userId);
    return wallet && wallet.balance >= amount;
  }

  /**
   * Get payment instructions for purchasing rooster cash
   * @returns {Object} Payment instructions
   */
  getPaymentInstructions() {
    return {
      paypalEmail: this.paypalEmail,
      pricePerRoosterCash: this.roosterCashPrice,
      instructions: [
        `1. Send payment to ${this.paypalEmail} via PayPal`,
        `2. Each rooster cash costs $${this.roosterCashPrice}`,
        '3. Include your user ID in the payment note',
        '4. Once payment is confirmed, rooster cash will be added to your wallet'
      ]
    };
  }

  /**
   * Get total number of users
   * @returns {number} Total user count
   */
  getUserCount() {
    return this.users.size;
  }

  /**
   * Get total rooster cash in circulation
   * @returns {number} Total balance across all users
   */
  getTotalBalance() {
    return Array.from(this.users.values())
      .reduce((sum, wallet) => sum + wallet.balance, 0);
  }
}

module.exports = RoosterCashSystem;
