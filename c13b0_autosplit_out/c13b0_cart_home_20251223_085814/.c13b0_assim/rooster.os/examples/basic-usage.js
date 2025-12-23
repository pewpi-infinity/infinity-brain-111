/**
 * Example: Basic Marketplace Usage
 * Demonstrates the basic features of the Rooster Marketplace
 */

const RoosterMarketplace = require('../marketplace');

async function basicExample() {
  console.log('🐓 Basic Marketplace Example\n');
  
  // Initialize marketplace
  const marketplace = new RoosterMarketplace();
  
  // 1. Register users
  console.log('1. Registering users...');
  marketplace.registerUser('alice');
  marketplace.registerUser('bob');
  console.log('   ✓ Users registered\n');
  
  // 2. Get payment instructions
  console.log('2. Payment instructions for buying Rooster Cash:');
  const paymentInfo = marketplace.getPaymentInstructions();
  console.log(`   PayPal: ${paymentInfo.paypalEmail}`);
  console.log(`   Price: $${paymentInfo.pricePerRoosterCash} per Rooster Cash\n`);
  
  // 3. Simulate purchasing Rooster Cash
  console.log('3. Purchasing Rooster Cash...');
  marketplace.purchaseRoosterCash('alice', 50, 'PAYPAL_TXN_001');
  marketplace.purchaseRoosterCash('bob', 100, 'PAYPAL_TXN_002');
  console.log('   ✓ Alice: 50 Rooster Cash');
  console.log('   ✓ Bob: 100 Rooster Cash\n');
  
  // 4. Create an auction
  console.log('4. Alice creates a 1-day auction...');
  const auction = marketplace.createAuction('alice', {
    title: 'Vintage Rooster Clock',
    description: 'Beautiful antique rooster clock from 1960s',
    startingBid: 10,
    duration: 24 * 60 * 60 * 1000 // 1 day
  });
  console.log(`   ✓ Auction ID: ${auction.id}`);
  console.log(`   ✓ Ends: ${auction.endTime.toLocaleString()}\n`);
  
  // 5. Bob places a bid
  console.log('5. Bob places a bid...');
  const bidResult = marketplace.placeBid(auction.id, 'bob', 15);
  console.log(`   ${bidResult.message}`);
  console.log(`   ✓ Bid amount: ${bidResult.bid.amount} Rooster Cash\n`);
  
  // 6. View marketplace statistics
  console.log('6. Marketplace Statistics:');
  const stats = marketplace.getStatistics();
  console.log(`   Users: ${stats.users.total}`);
  console.log(`   Active Auctions: ${stats.auctions.activeAuctions}`);
  console.log(`   Total Bids: ${stats.auctions.totalBids}\n`);
  
  console.log('✅ Example completed!\n');
}

// Run the example
basicExample().catch(console.error);
