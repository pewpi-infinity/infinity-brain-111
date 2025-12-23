/**
 * Auction System
 * Manages auctions with configurable durations (up to 10 years)
 */

const RoosterCashSystem = require('./roosterCash');

// Maximum auction duration constant (10 years)
const MAX_AUCTION_DURATION_MS = 10 * 365 * 24 * 60 * 60 * 1000;

class AuctionSystem {
  constructor(roosterCashSystem) {
    this.roosterCash = roosterCashSystem;
    this.auctions = new Map(); // auctionId -> auction
    this.userAuctions = new Map(); // userId -> [auctionIds]
    this.maxAuctionDuration = MAX_AUCTION_DURATION_MS;
  }

  /**
   * Create a new auction
   * @param {string} userId - Auction creator's user ID
   * @param {Object} auctionData - Auction details
   * @returns {Object} Created auction
   */
  createAuction(userId, auctionData) {
    const { title, description, startingBid, duration } = auctionData;

    // Validate auction data
    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    if (startingBid <= 0) {
      throw new Error('Starting bid must be greater than 0');
    }

    if (duration <= 0 || duration > this.maxAuctionDuration) {
      throw new Error(`Duration must be between 0 and ${this.maxAuctionDuration}ms (10 years)`);
    }

    const auctionId = `auction_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const now = new Date();
    const endTime = new Date(now.getTime() + duration);

    const auction = {
      id: auctionId,
      sellerId: userId,
      title,
      description,
      startingBid,
      currentBid: startingBid,
      highestBidder: null,
      bids: [],
      status: 'active',
      createdAt: now,
      endTime,
      duration
    };

    this.auctions.set(auctionId, auction);

    // Track user's auctions
    if (!this.userAuctions.has(userId)) {
      this.userAuctions.set(userId, []);
    }
    this.userAuctions.get(userId).push(auctionId);

    return auction;
  }

  /**
   * Place a bid on an auction
   * @param {string} auctionId - Auction identifier
   * @param {string} bidderId - Bidder's user ID
   * @param {number} bidAmount - Bid amount in rooster cash
   * @returns {Object} Bid details
   */
  placeBid(auctionId, bidderId, bidAmount) {
    const auction = this.auctions.get(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    // Check if auction is still active
    if (auction.status !== 'active') {
      throw new Error('Auction is not active');
    }

    const now = new Date();
    if (now >= auction.endTime) {
      this.closeAuction(auctionId);
      throw new Error('Auction has ended');
    }

    // Validate bidder cannot bid on own auction
    if (bidderId === auction.sellerId) {
      throw new Error('Cannot bid on your own auction');
    }

    // Validate bid amount
    if (bidAmount <= auction.currentBid) {
      throw new Error(`Bid must be higher than current bid of ${auction.currentBid}`);
    }

    // Validate bidder is "logical" - has sufficient rooster cash
    if (!this.roosterCash.hasSufficientBalance(bidderId, bidAmount)) {
      throw new Error('Insufficient rooster cash balance. Only logical bidders with real rooster cash can bid.');
    }

    // Create bid
    const bid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      bidderId,
      amount: bidAmount,
      timestamp: now
    };

    // Update auction
    auction.currentBid = bidAmount;
    auction.highestBidder = bidderId;
    auction.bids.push(bid);

    return {
      auction,
      bid,
      message: '🐓 ROOSTER CROW! You got a bid on your auction!'
    };
  }

  /**
   * Get auction details
   * @param {string} auctionId - Auction identifier
   * @returns {Object} Auction details
   */
  getAuction(auctionId) {
    const auction = this.auctions.get(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    // Update status if ended
    if (auction.status === 'active' && new Date() >= auction.endTime) {
      this.closeAuction(auctionId);
    }

    return auction;
  }

  /**
   * Get all auctions for a user
   * @param {string} userId - User identifier
   * @returns {Array} List of auctions
   */
  getUserAuctions(userId) {
    const auctionIds = this.userAuctions.get(userId) || [];
    return auctionIds.map(id => this.getAuction(id));
  }

  /**
   * Get all active auctions
   * @returns {Array} List of active auctions
   */
  getActiveAuctions() {
    const now = new Date();
    return Array.from(this.auctions.values())
      .filter(auction => {
        if (auction.status === 'active' && now >= auction.endTime) {
          this.closeAuction(auction.id);
          return false;
        }
        return auction.status === 'active';
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Close an auction
   * @param {string} auctionId - Auction identifier
   * @returns {Object} Closed auction with winner
   */
  closeAuction(auctionId) {
    const auction = this.auctions.get(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status !== 'active') {
      return auction;
    }

    auction.status = 'completed';

    // If there's a winner, transfer rooster cash
    if (auction.highestBidder) {
      try {
        this.roosterCash.transferRoosterCash(
          auction.highestBidder,
          auction.sellerId,
          auction.currentBid
        );
        auction.winnerPaid = true;
      } catch (error) {
        auction.winnerPaid = false;
        auction.paymentError = error.message;
      }
    }

    return auction;
  }

  /**
   * Cancel an auction (only by seller before any bids)
   * @param {string} auctionId - Auction identifier
   * @param {string} userId - User requesting cancellation
   * @returns {Object} Cancelled auction
   */
  cancelAuction(auctionId, userId) {
    const auction = this.auctions.get(auctionId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.sellerId !== userId) {
      throw new Error('Only the seller can cancel the auction');
    }

    if (auction.bids.length > 0) {
      throw new Error('Cannot cancel auction with existing bids');
    }

    auction.status = 'cancelled';
    return auction;
  }

  /**
   * Get auction statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    const auctions = Array.from(this.auctions.values());
    return {
      totalAuctions: auctions.length,
      activeAuctions: auctions.filter(a => a.status === 'active').length,
      completedAuctions: auctions.filter(a => a.status === 'completed').length,
      cancelledAuctions: auctions.filter(a => a.status === 'cancelled').length,
      totalBids: auctions.reduce((sum, a) => sum + a.bids.length, 0),
      totalValue: auctions
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + a.currentBid, 0)
    };
  }
}

module.exports = AuctionSystem;
