/**
 * Rooster Marketplace Demo
 * Demonstrates the marketplace functionality
 */

const RoosterMarketplace = require('./marketplace');

// Initialize marketplace
const marketplace = new RoosterMarketplace();

console.log('🐓 Welcome to Rooster Marketplace! 🐓\n');
console.log('='.repeat(60));

// Display payment instructions
console.log('\n💰 HOW TO GET ROOSTER CASH:');
console.log('='.repeat(60));
const paymentInfo = marketplace.getPaymentInstructions();
console.log(`PayPal Email: ${paymentInfo.paypalEmail}`);
console.log(`Price: $${paymentInfo.pricePerRoosterCash} per Rooster Cash\n`);
paymentInfo.instructions.forEach(instruction => console.log(instruction));

console.log('\n' + '='.repeat(60));
console.log('\n🎯 DEMO: Marketplace in Action');
console.log('='.repeat(60));

try {
  // Register users
  console.log('\n1️⃣  Registering users...');
  const seller = marketplace.registerUser('seller_alice');
  const bidder1 = marketplace.registerUser('bidder_bob');
  const bidder2 = marketplace.registerUser('bidder_charlie');
  console.log('   ✓ Users registered: seller_alice, bidder_bob, bidder_charlie');

  // Simulate rooster cash purchases
  console.log('\n2️⃣  Purchasing Rooster Cash...');
  marketplace.purchaseRoosterCash('bidder_bob', 100, 'PAYPAL_TXN_001');
  console.log('   ✓ bidder_bob purchased 100 Rooster Cash');
  
  marketplace.purchaseRoosterCash('bidder_charlie', 200, 'PAYPAL_TXN_002');
  console.log('   ✓ bidder_charlie purchased 200 Rooster Cash');

  // Display wallet balances
  console.log('\n3️⃣  Wallet Balances:');
  const bobWallet = marketplace.roosterCash.getWallet('bidder_bob');
  const charlieWallet = marketplace.roosterCash.getWallet('bidder_charlie');
  console.log(`   • bidder_bob: ${bobWallet.balance} Rooster Cash`);
  console.log(`   • bidder_charlie: ${charlieWallet.balance} Rooster Cash`);

  // Create auctions with different durations
  console.log('\n4️⃣  Creating Auctions...');
  
  // Short auction (1 hour)
  const auction1 = marketplace.createAuction('seller_alice', {
    title: 'Vintage Rooster Figurine',
    description: 'Beautiful handcrafted rooster from 1950s',
    startingBid: 10,
    duration: 60 * 60 * 1000 // 1 hour
  });
  console.log(`   ✓ Created 1-hour auction: "${auction1.title}"`);
  console.log(`     Starting bid: ${auction1.startingBid} Rooster Cash`);
  console.log(`     Ends at: ${auction1.endTime.toLocaleString()}`);

  // Long auction (1 year)
  const auction2 = marketplace.createAuction('seller_alice', {
    title: 'Premium Rooster Farm Experience',
    description: 'Year-long access to premium rooster farm',
    startingBid: 500,
    duration: 365 * 24 * 60 * 60 * 1000 // 1 year
  });
  console.log(`\n   ✓ Created 1-year auction: "${auction2.title}"`);
  console.log(`     Starting bid: ${auction2.startingBid} Rooster Cash`);
  console.log(`     Ends at: ${auction2.endTime.toLocaleString()}`);

  // Very long auction (10 years - maximum)
  const auction3 = marketplace.createAuction('seller_alice', {
    title: 'Lifetime Rooster Membership',
    description: 'Exclusive lifetime access to all rooster events',
    startingBid: 1000,
    duration: 10 * 365 * 24 * 60 * 60 * 1000 // 10 years
  });
  console.log(`\n   ✓ Created 10-year auction: "${auction3.title}"`);
  console.log(`     Starting bid: ${auction3.startingBid} Rooster Cash`);
  console.log(`     Ends at: ${auction3.endTime.toLocaleString()}`);

  // Place bids
  console.log('\n5️⃣  Placing Bids...');
  
  const bid1 = marketplace.placeBid(auction1.id, 'bidder_bob', 15);
  console.log(`   ${bid1.message}`);
  console.log(`   ✓ bidder_bob bid 15 Rooster Cash on "${auction1.title}"`);

  const bid2 = marketplace.placeBid(auction1.id, 'bidder_charlie', 20);
  console.log(`   ${bid2.message}`);
  console.log(`   ✓ bidder_charlie bid 20 Rooster Cash on "${auction1.title}"`);

  // Try to bid without sufficient funds
  console.log('\n6️⃣  Testing Logical Bidder Validation...');
  try {
    marketplace.placeBid(auction2.id, 'bidder_bob', 600);
  } catch (error) {
    console.log(`   ✓ Rejected bid: ${error.message}`);
    console.log('   ✓ System correctly validates "logical bidders" with sufficient funds');
  }

  // Display active auctions
  console.log('\n7️⃣  Active Auctions in Marketplace:');
  const activeAuctions = marketplace.getActiveAuctions();
  activeAuctions.forEach((auction, index) => {
    console.log(`\n   Auction ${index + 1}:`);
    console.log(`   • Title: ${auction.title}`);
    console.log(`   • Current Bid: ${auction.currentBid} Rooster Cash`);
    console.log(`   • Highest Bidder: ${auction.highestBidder || 'None yet'}`);
    console.log(`   • Total Bids: ${auction.bids.length}`);
    console.log(`   • Status: ${auction.status}`);
    console.log(`   • Ends: ${auction.endTime.toLocaleString()}`);
  });

  // Display marketplace statistics
  console.log('\n8️⃣  Marketplace Statistics:');
  console.log('='.repeat(60));
  const stats = marketplace.getStatistics();
  console.log(`   Total Users: ${stats.users.total}`);
  console.log(`   Total Rooster Cash in Circulation: ${stats.roosterCash.totalInCirculation}`);
  console.log(`   Total Transactions: ${stats.roosterCash.totalTransactions}`);
  console.log(`   Total Auctions: ${stats.auctions.totalAuctions}`);
  console.log(`   Active Auctions: ${stats.auctions.activeAuctions}`);
  console.log(`   Total Bids: ${stats.auctions.totalBids}`);

  // Demonstrate selling rooster cash back
  console.log('\n9️⃣  Selling Rooster Cash Back to PayPal:');
  const sellTransaction = marketplace.sellRoosterCash('bidder_charlie', 50);
  console.log(`   ✓ bidder_charlie sold 50 Rooster Cash`);
  console.log(`   • Refund amount: $${sellTransaction.refundAmount}`);
  console.log(`   • PayPal email: ${sellTransaction.paypalEmail}`);
  console.log(`   • Status: ${sellTransaction.status}`);
  
  const updatedWallet = marketplace.roosterCash.getWallet('bidder_charlie');
  console.log(`   • Updated balance: ${updatedWallet.balance} Rooster Cash`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Demo completed successfully!');
  console.log('='.repeat(60));

} catch (error) {
  console.error('\n❌ Error:', error.message);
}

console.log('\n🐓 Thank you for using Rooster Marketplace! 🐓\n');
