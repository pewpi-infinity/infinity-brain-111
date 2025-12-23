/**
 * Example: Long-term Auctions
 * Demonstrates creating auctions with various long durations
 */

const RoosterMarketplace = require('../marketplace');

async function longTermExample() {
  console.log('🐓 Long-term Auction Example\n');
  
  const marketplace = new RoosterMarketplace();
  
  // Register a seller
  marketplace.registerUser('collector_john');
  console.log('✓ Registered user: collector_john\n');
  
  // Create auctions with different durations
  console.log('Creating auctions with various durations:\n');
  
  // 1 month auction
  const auction1 = marketplace.createAuction('collector_john', {
    title: 'Rare Rooster Painting',
    description: 'Original oil painting of rooster by famous artist',
    startingBid: 100,
    duration: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
  console.log('1. One Month Auction:');
  console.log(`   Title: ${auction1.title}`);
  console.log(`   Starting Bid: ${auction1.startingBid} RC`);
  console.log(`   Ends: ${auction1.endTime.toLocaleDateString()}\n`);
  
  // 6 month auction
  const auction2 = marketplace.createAuction('collector_john', {
    title: 'Premium Rooster Farm Tour Package',
    description: 'Exclusive 6-month access to premium rooster farms',
    startingBid: 500,
    duration: 180 * 24 * 60 * 60 * 1000 // 180 days
  });
  console.log('2. Six Month Auction:');
  console.log(`   Title: ${auction2.title}`);
  console.log(`   Starting Bid: ${auction2.startingBid} RC`);
  console.log(`   Ends: ${auction2.endTime.toLocaleDateString()}\n`);
  
  // 2 year auction
  const auction3 = marketplace.createAuction('collector_john', {
    title: 'Rooster Breeding Rights',
    description: 'Exclusive breeding rights for champion rooster lineage',
    startingBid: 2000,
    duration: 2 * 365 * 24 * 60 * 60 * 1000 // 2 years
  });
  console.log('3. Two Year Auction:');
  console.log(`   Title: ${auction3.title}`);
  console.log(`   Starting Bid: ${auction3.startingBid} RC`);
  console.log(`   Ends: ${auction3.endTime.toLocaleDateString()}\n`);
  
  // 5 year auction
  const auction4 = marketplace.createAuction('collector_john', {
    title: 'Historic Rooster Ranch',
    description: 'Stake in historic rooster ranch with 5-year commitment',
    startingBid: 5000,
    duration: 5 * 365 * 24 * 60 * 60 * 1000 // 5 years
  });
  console.log('4. Five Year Auction:');
  console.log(`   Title: ${auction4.title}`);
  console.log(`   Starting Bid: ${auction4.startingBid} RC`);
  console.log(`   Ends: ${auction4.endTime.toLocaleDateString()}\n`);
  
  // 10 year auction (maximum)
  const auction5 = marketplace.createAuction('collector_john', {
    title: 'Lifetime Rooster Legacy Membership',
    description: 'Ultimate lifetime membership with exclusive benefits',
    startingBid: 10000,
    duration: 10 * 365 * 24 * 60 * 60 * 1000 // 10 years (max)
  });
  console.log('5. Ten Year Auction (MAXIMUM):');
  console.log(`   Title: ${auction5.title}`);
  console.log(`   Starting Bid: ${auction5.startingBid} RC`);
  console.log(`   Ends: ${auction5.endTime.toLocaleDateString()}\n`);
  
  // Display summary
  const stats = marketplace.getStatistics();
  console.log('Summary:');
  console.log(`✓ Created ${stats.auctions.totalAuctions} long-term auctions`);
  console.log(`✓ All auctions are active and accepting bids\n`);
  
  console.log('✅ Long-term auction example completed!\n');
}

longTermExample().catch(console.error);
