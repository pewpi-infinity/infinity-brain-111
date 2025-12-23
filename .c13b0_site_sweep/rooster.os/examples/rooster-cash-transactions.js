/**
 * Example: Rooster Cash Transactions
 * Demonstrates purchasing, transferring, and selling Rooster Cash
 */

const RoosterMarketplace = require('../marketplace');

async function roosterCashExample() {
  console.log('🐓 Rooster Cash Transaction Example\n');
  
  const marketplace = new RoosterMarketplace();
  
  // Register users
  console.log('Setting up users...');
  marketplace.registerUser('user_alice');
  marketplace.registerUser('user_bob');
  marketplace.registerUser('user_charlie');
  console.log('✓ Registered 3 users\n');
  
  // Show payment instructions
  console.log('💰 Payment Instructions:');
  const instructions = marketplace.getPaymentInstructions();
  console.log(`   PayPal: ${instructions.paypalEmail}`);
  console.log(`   Price: $${instructions.pricePerRoosterCash} per Rooster Cash\n`);
  
  // Purchase Rooster Cash
  console.log('1. Purchasing Rooster Cash...');
  const txn1 = marketplace.purchaseRoosterCash('user_alice', 100, 'PP_TXN_001');
  console.log(`   ✓ Alice bought ${txn1.amount} RC for $${txn1.totalCost}`);
  
  const txn2 = marketplace.purchaseRoosterCash('user_bob', 200, 'PP_TXN_002');
  console.log(`   ✓ Bob bought ${txn2.amount} RC for $${txn2.totalCost}`);
  
  const txn3 = marketplace.purchaseRoosterCash('user_charlie', 50, 'PP_TXN_003');
  console.log(`   ✓ Charlie bought ${txn3.amount} RC for $${txn3.totalCost}\n`);
  
  // Check balances
  console.log('2. Checking wallet balances...');
  const aliceWallet = marketplace.roosterCash.getWallet('user_alice');
  const bobWallet = marketplace.roosterCash.getWallet('user_bob');
  const charlieWallet = marketplace.roosterCash.getWallet('user_charlie');
  console.log(`   Alice: ${aliceWallet.balance} RC`);
  console.log(`   Bob: ${bobWallet.balance} RC`);
  console.log(`   Charlie: ${charlieWallet.balance} RC\n`);
  
  // Transfer between users
  console.log('3. Transferring Rooster Cash...');
  const transfer = marketplace.roosterCash.transferRoosterCash('user_bob', 'user_charlie', 30);
  console.log(`   ✓ Bob sent 30 RC to Charlie`);
  console.log(`   Transaction ID: ${transfer.id}\n`);
  
  // Check updated balances
  console.log('4. Updated balances after transfer:');
  const bobWallet2 = marketplace.roosterCash.getWallet('user_bob');
  const charlieWallet2 = marketplace.roosterCash.getWallet('user_charlie');
  console.log(`   Bob: ${bobWallet2.balance} RC`);
  console.log(`   Charlie: ${charlieWallet2.balance} RC\n`);
  
  // Sell Rooster Cash back
  console.log('5. Selling Rooster Cash back to PayPal...');
  const sellTxn = marketplace.sellRoosterCash('user_alice', 25);
  console.log(`   ✓ Alice sold ${sellTxn.amount} RC`);
  console.log(`   Refund: $${sellTxn.refundAmount}`);
  console.log(`   Status: ${sellTxn.status}`);
  console.log(`   PayPal: ${sellTxn.paypalEmail}\n`);
  
  // Final balances
  console.log('6. Final wallet balances:');
  const aliceWallet2 = marketplace.roosterCash.getWallet('user_alice');
  console.log(`   Alice: ${aliceWallet2.balance} RC`);
  console.log(`   Bob: ${bobWallet2.balance} RC`);
  console.log(`   Charlie: ${charlieWallet2.balance} RC\n`);
  
  // Transaction summary
  console.log('Summary:');
  const stats = marketplace.getStatistics();
  console.log(`✓ Total users: ${stats.users.total}`);
  console.log(`✓ Total RC in circulation: ${stats.roosterCash.totalInCirculation}`);
  console.log(`✓ Total transactions: ${stats.roosterCash.totalTransactions}\n`);
  
  console.log('✅ Rooster Cash transaction example completed!\n');
}

roosterCashExample().catch(console.error);
