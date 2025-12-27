/**
 * Rooster Marketplace
 * Main marketplace interface combining rooster cash and auction systems
 */

const RoosterCashSystem = require('./roosterCash');
const AuctionSystem = require('./auctionSystem');

class RoosterMarketplace {
  constructor() {
    this.roosterCash = new RoosterCashSystem();
    this.auctions = new AuctionSystem(this.roosterCash);
  }

  /**
   * Register a new user
   * @param {string} userId - Unique user identifier
   * @returns {Object} User registration info
   */
  registerUser(userId) {
    return this.roosterCash.createWallet(userId);
  }

  /**
   * Get user information including wallet and auctions
   * @param {string} userId - User identifier
   * @returns {Object} Complete user information
   */
  getUserInfo(userId) {
    const wallet = this.roosterCash.getWallet(userId);
    const userAuctions = this.auctions.getUserAuctions(userId);
    
    return {
      userId,
      wallet,
      auctions: userAuctions,
      statistics: {
        totalAuctions: userAuctions.length,
        activeAuctions: userAuctions.filter(a => a.status === 'active').length,
        completedAuctions: userAuctions.filter(a => a.status === 'completed').length
      }
    };
  }

  /**
   * Get payment instructions for rooster cash
   * @returns {Object} Payment instructions
   */
  getPaymentInstructions() {
    return this.roosterCash.getPaymentInstructions();
  }

  /**
   * Purchase rooster cash
   * @param {string} userId - User identifier
   * @param {number} amount - Amount of rooster cash
   * @param {string} paypalTransactionId - PayPal transaction ID
   * @returns {Object} Transaction details
   */
  purchaseRoosterCash(userId, amount, paypalTransactionId) {
    return this.roosterCash.purchaseRoosterCash(userId, amount, paypalTransactionId);
  }

  /**
   * Sell rooster cash back
   * @param {string} userId - User identifier
   * @param {number} amount - Amount to sell
   * @returns {Object} Transaction details
   */
  sellRoosterCash(userId, amount) {
    return this.roosterCash.sellRoosterCash(userId, amount);
  }

  /**
   * Create a new auction
   * @param {string} userId - Seller user ID
   * @param {Object} auctionData - Auction details
   * @returns {Object} Created auction
   */
  createAuction(userId, auctionData) {
    return this.auctions.createAuction(userId, auctionData);
  }

  /**
   * Place a bid on an auction
   * @param {string} auctionId - Auction identifier
   * @param {string} bidderId - Bidder user ID
   * @param {number} bidAmount - Bid amount
   * @returns {Object} Bid result with rooster crow notification
   */
  placeBid(auctionId, bidderId, bidAmount) {
    return this.auctions.placeBid(auctionId, bidderId, bidAmount);
  }

  /**
   * Get auction details
   * @param {string} auctionId - Auction identifier
   * @returns {Object} Auction details
   */
  getAuction(auctionId) {
    return this.auctions.getAuction(auctionId);
  }

  /**
   * Get all active auctions in the marketplace
   * @returns {Array} List of active auctions
   */
  getActiveAuctions() {
    return this.auctions.getActiveAuctions();
  }

  /**
   * Cancel an auction
   * @param {string} auctionId - Auction identifier
   * @param {string} userId - User requesting cancellation
   * @returns {Object} Cancelled auction
   */
  cancelAuction(auctionId, userId) {
    return this.auctions.cancelAuction(auctionId, userId);
  }

  /**
   * Get marketplace statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    const auctionStats = this.auctions.getStatistics();
    const totalUsers = this.roosterCash.getUserCount();
    const totalRoosterCash = this.roosterCash.getTotalBalance();

    return {
      users: {
        total: totalUsers
      },
      roosterCash: {
        totalInCirculation: totalRoosterCash,
        totalTransactions: this.roosterCash.transactions.length
      },
      auctions: auctionStats
    };
  }
}

module.exports = RoosterMarketplace;
