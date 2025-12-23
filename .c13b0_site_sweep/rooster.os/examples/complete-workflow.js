/**
 * Example: Complete Marketplace Workflow
 * End-to-end demonstration of the marketplace lifecycle
 */

const RoosterMarketplace = require('../marketplace');

async function completeWorkflow() {
  console.log('🐓 Complete Marketplace Workflow\n');
  console.log('='.repeat(60));
  
  const marketplace = new RoosterMarketplace();
  
  // Setup phase
  console.log('\n📋 PHASE 1: SETUP');
  console.log('-'.repeat(60));
  console.log('Registering marketplace participants...');
  
  marketplace.registerUser('seller_emily');
  marketplace.registerUser('bidder_frank');
  marketplace.registerUser('bidder_grace');
  
  console.log('✓ Seller: Emily');
  console.log('✓ Bidder: Frank');
  console.log('✓ Bidder: Grace');
  
  // Purchase phase
  console.log('\n💰 PHASE 2: PURCHASING ROOSTER CASH');
  console.log('-'.repeat(60));
  
  marketplace.purchaseRoosterCash('bidder_frank', 150, 'PAYPAL_001');
  marketplace.purchaseRoosterCash('bidder_grace', 250, 'PAYPAL_002');
  
  console.log('✓ Frank purchased 150 Rooster Cash ($150)');
  console.log('✓ Grace purchased 250 Rooster Cash ($250)');
  
  // Auction creation phase
  console.log('\n📦 PHASE 3: CREATING AUCTIONS');
  console.log('-'.repeat(60));
  
  const auction1 = marketplace.createAuction('seller_emily', {
    title: 'Rooster Weather Vane',
    description: 'Antique copper rooster weather vane',
    startingBid: 25,
    duration: 7 * 24 * 60 * 60 * 1000 // 1 week
  });
  
  const auction2 = marketplace.createAuction('seller_emily', {
    title: 'Rooster Cookbook Collection',
    description: 'Complete set of rooster-themed cookbooks',
    startingBid: 15,
    duration: 3 * 24 * 60 * 60 * 1000 // 3 days
  });
  
  console.log(`✓ Created "${auction1.title}"`);
  console.log(`  Starting bid: ${auction1.startingBid} RC`);
  console.log(`  Duration: 1 week`);
  console.log(`\n✓ Created "${auction2.title}"`);
  console.log(`  Starting bid: ${auction2.startingBid} RC`);
  console.log(`  Duration: 3 days`);
  
  // Bidding phase
  console.log('\n🎯 PHASE 4: COMPETITIVE BIDDING');
  console.log('-'.repeat(60));
  
  // Auction 1 bidding war
  console.log(`\nAuction: "${auction1.title}"`);
  
  const bid1 = marketplace.placeBid(auction1.id, 'bidder_frank', 30);
  console.log(`✓ Frank bids 30 RC`);
  console.log(`  ${bid1.message}`);
  
  const bid2 = marketplace.placeBid(auction1.id, 'bidder_grace', 40);
  console.log(`✓ Grace bids 40 RC (outbid Frank!)`);
  console.log(`  ${bid2.message}`);
  
  const bid3 = marketplace.placeBid(auction1.id, 'bidder_frank', 50);
  console.log(`✓ Frank bids 50 RC (outbid Grace!)`);
  console.log(`  ${bid3.message}`);
  
  // Auction 2 bidding
  console.log(`\nAuction: "${auction2.title}"`);
  
  const bid4 = marketplace.placeBid(auction2.id, 'bidder_grace', 20);
  console.log(`✓ Grace bids 20 RC`);
  console.log(`  ${bid4.message}`);
  
  // Validation phase
  console.log('\n🔍 PHASE 5: BIDDING VALIDATION');
  console.log('-'.repeat(60));
  
  console.log('Testing "logical bidder" validation...');
  
  try {
    // Try to bid more than available balance
    marketplace.placeBid(auction1.id, 'bidder_grace', 300);
  } catch (error) {
    console.log('✓ Rejected invalid bid:');
    console.log(`  "${error.message}"`);
    console.log('  System validates sufficient funds!');
  }
  
  try {
    // Try seller bidding on own auction
    marketplace.placeBid(auction1.id, 'seller_emily', 60);
  } catch (error) {
    console.log('✓ Rejected seller self-bidding:');
    console.log(`  "${error.message}"`);
  }
  
  // Marketplace status
  console.log('\n📊 PHASE 6: MARKETPLACE STATUS');
  console.log('-'.repeat(60));
  
  const activeAuctions = marketplace.getActiveAuctions();
  console.log(`Active Auctions: ${activeAuctions.length}\n`);
  
  activeAuctions.forEach((auction, i) => {
    console.log(`${i + 1}. ${auction.title}`);
    console.log(`   Current bid: ${auction.currentBid} RC`);
    console.log(`   Leading bidder: ${auction.highestBidder}`);
    console.log(`   Total bids: ${auction.bids.length}`);
  });
  
  // User information
  console.log('\n👥 PHASE 7: USER INFORMATION');
  console.log('-'.repeat(60));
  
  const frankInfo = marketplace.getUserInfo('bidder_frank');
  console.log('Frank:');
  console.log(`  Balance: ${frankInfo.wallet.balance} RC`);
  console.log(`  Transactions: ${frankInfo.wallet.transactions.length}`);
  
  const graceInfo = marketplace.getUserInfo('bidder_grace');
  console.log('\nGrace:');
  console.log(`  Balance: ${graceInfo.wallet.balance} RC`);
  console.log(`  Transactions: ${graceInfo.wallet.transactions.length}`);
  
  const emilyInfo = marketplace.getUserInfo('seller_emily');
  console.log('\nEmily (Seller):');
  console.log(`  Active auctions: ${emilyInfo.auctions.length}`);
  console.log(`  Total bids received: ${emilyInfo.auctions.reduce((sum, a) => sum + a.bids.length, 0)}`);
  
  // Statistics
  console.log('\n📈 PHASE 8: MARKETPLACE STATISTICS');
  console.log('-'.repeat(60));
  
  const stats = marketplace.getStatistics();
  console.log('Overall Statistics:');
  console.log(`  Total users: ${stats.users.total}`);
  console.log(`  Rooster Cash in circulation: ${stats.roosterCash.totalInCirculation} RC`);
  console.log(`  Total auctions: ${stats.auctions.totalAuctions}`);
  console.log(`  Active auctions: ${stats.auctions.activeAuctions}`);
  console.log(`  Total bids placed: ${stats.auctions.totalBids}`);
  console.log(`  Total transactions: ${stats.roosterCash.totalTransactions}`);
  
  // Conclusion
  console.log('\n' + '='.repeat(60));
  console.log('✅ Complete workflow demonstration finished!');
  console.log('='.repeat(60));
  console.log('\nKey Features Demonstrated:');
  console.log('  ✓ User registration and wallet creation');
  console.log('  ✓ Rooster Cash purchasing via PayPal');
  console.log('  ✓ Long-term auction creation (up to 10 years)');
  console.log('  ✓ Competitive bidding with rooster crow notifications');
  console.log('  ✓ Logical bidder validation (sufficient funds)');
  console.log('  ✓ Automatic balance tracking');
  console.log('  ✓ Comprehensive marketplace statistics');
  console.log('\n🐓 Rooster Marketplace is fully operational! 🐓\n');
}

completeWorkflow().catch(console.error);
