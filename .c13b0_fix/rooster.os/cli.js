#!/usr/bin/env node

/**
 * Rooster Marketplace CLI
 * Interactive command-line interface for the marketplace
 */

const readline = require('readline');
const RoosterMarketplace = require('./marketplace');

const marketplace = new RoosterMarketplace();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let currentUser = null;

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function displayMenu() {
  console.log('\n' + '='.repeat(60));
  console.log('🐓 ROOSTER MARKETPLACE CLI 🐓');
  console.log('='.repeat(60));
  
  if (currentUser) {
    try {
      const wallet = marketplace.roosterCash.getWallet(currentUser);
      console.log(`\n👤 Current User: ${currentUser}`);
      console.log(`💰 Rooster Cash Balance: ${wallet.balance}`);
    } catch (error) {
      console.log(`\n👤 Current User: ${currentUser} (new user)`);
    }
  } else {
    console.log('\n⚠️  No user logged in');
  }
  
  console.log('\nOptions:');
  console.log('1. Register/Login User');
  console.log('2. View Payment Instructions');
  console.log('3. Purchase Rooster Cash');
  console.log('4. Create Auction');
  console.log('5. View Active Auctions');
  console.log('6. Place Bid on Auction');
  console.log('7. View My Auctions');
  console.log('8. View My Wallet');
  console.log('9. Sell Rooster Cash');
  console.log('10. View Marketplace Statistics');
  console.log('0. Exit');
  console.log('='.repeat(60));
}

async function registerUser() {
  const userId = await prompt('\nEnter User ID: ');
  
  try {
    marketplace.registerUser(userId);
    currentUser = userId;
    console.log(`✅ User registered: ${userId}`);
  } catch (error) {
    // User already exists, just login
    currentUser = userId;
    console.log(`✅ Logged in as: ${userId}`);
  }
}

async function viewPaymentInstructions() {
  console.log('\n💰 PAYMENT INSTRUCTIONS');
  console.log('='.repeat(60));
  const instructions = marketplace.getPaymentInstructions();
  console.log(`PayPal Email: ${instructions.paypalEmail}`);
  console.log(`Price per Rooster Cash: $${instructions.pricePerRoosterCash}\n`);
  instructions.instructions.forEach(line => console.log(line));
}

async function purchaseRoosterCash() {
  if (!currentUser) {
    console.log('❌ Please login first!');
    return;
  }
  
  const amount = parseInt(await prompt('\nAmount of Rooster Cash to purchase: '));
  const txnId = await prompt('PayPal Transaction ID: ');
  
  try {
    const transaction = marketplace.purchaseRoosterCash(currentUser, amount, txnId);
    console.log(`✅ Purchased ${transaction.amount} Rooster Cash`);
    console.log(`   Total cost: $${transaction.totalCost}`);
    console.log(`   Transaction ID: ${transaction.id}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function createAuction() {
  if (!currentUser) {
    console.log('❌ Please login first!');
    return;
  }
  
  console.log('\n📦 CREATE NEW AUCTION');
  const title = await prompt('Title: ');
  const description = await prompt('Description: ');
  const startingBid = parseInt(await prompt('Starting Bid (Rooster Cash): '));
  
  console.log('\nDuration Options:');
  console.log('1. 1 hour');
  console.log('2. 1 day');
  console.log('3. 1 week');
  console.log('4. 1 month');
  console.log('5. 1 year');
  console.log('6. 10 years (maximum)');
  console.log('7. Custom');
  
  const durationChoice = await prompt('Choose duration: ');
  let duration;
  
  switch (durationChoice) {
    case '1': duration = 60 * 60 * 1000; break;
    case '2': duration = 24 * 60 * 60 * 1000; break;
    case '3': duration = 7 * 24 * 60 * 60 * 1000; break;
    case '4': duration = 30 * 24 * 60 * 60 * 1000; break;
    case '5': duration = 365 * 24 * 60 * 60 * 1000; break;
    case '6': duration = 10 * 365 * 24 * 60 * 60 * 1000; break;
    case '7':
      const days = parseInt(await prompt('Enter number of days: '));
      duration = days * 24 * 60 * 60 * 1000;
      break;
    default:
      console.log('❌ Invalid choice');
      return;
  }
  
  try {
    const auction = marketplace.createAuction(currentUser, {
      title,
      description,
      startingBid,
      duration
    });
    console.log(`✅ Auction created!`);
    console.log(`   ID: ${auction.id}`);
    console.log(`   Ends at: ${auction.endTime.toLocaleString()}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function viewActiveAuctions() {
  console.log('\n🏪 ACTIVE AUCTIONS');
  console.log('='.repeat(60));
  
  const auctions = marketplace.getActiveAuctions();
  
  if (auctions.length === 0) {
    console.log('No active auctions at the moment.');
    return;
  }
  
  auctions.forEach((auction, index) => {
    console.log(`\n[${index + 1}] ${auction.title}`);
    console.log(`    ID: ${auction.id}`);
    console.log(`    Description: ${auction.description}`);
    console.log(`    Current Bid: ${auction.currentBid} Rooster Cash`);
    console.log(`    Highest Bidder: ${auction.highestBidder || 'None yet'}`);
    console.log(`    Total Bids: ${auction.bids.length}`);
    console.log(`    Seller: ${auction.sellerId}`);
    console.log(`    Ends: ${auction.endTime.toLocaleString()}`);
  });
}

async function placeBid() {
  if (!currentUser) {
    console.log('❌ Please login first!');
    return;
  }
  
  const auctionId = await prompt('\nAuction ID: ');
  const bidAmount = parseInt(await prompt('Bid Amount (Rooster Cash): '));
  
  try {
    const result = marketplace.placeBid(auctionId, currentUser, bidAmount);
    console.log(`✅ ${result.message}`);
    console.log(`   Your bid of ${bidAmount} Rooster Cash has been placed!`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function viewMyAuctions() {
  if (!currentUser) {
    console.log('❌ Please login first!');
    return;
  }
  
  console.log('\n📦 MY AUCTIONS');
  console.log('='.repeat(60));
  
  try {
    const auctions = marketplace.auctions.getUserAuctions(currentUser);
    
    if (auctions.length === 0) {
      console.log('You have not created any auctions yet.');
      return;
    }
    
    auctions.forEach((auction, index) => {
      console.log(`\n[${index + 1}] ${auction.title}`);
      console.log(`    Status: ${auction.status}`);
      console.log(`    Current Bid: ${auction.currentBid} Rooster Cash`);
      console.log(`    Highest Bidder: ${auction.highestBidder || 'None yet'}`);
      console.log(`    Total Bids: ${auction.bids.length}`);
      console.log(`    Ends: ${auction.endTime.toLocaleString()}`);
    });
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function viewWallet() {
  if (!currentUser) {
    console.log('❌ Please login first!');
    return;
  }
  
  console.log('\n💰 MY WALLET');
  console.log('='.repeat(60));
  
  try {
    const wallet = marketplace.roosterCash.getWallet(currentUser);
    console.log(`User ID: ${currentUser}`);
    console.log(`Balance: ${wallet.balance} Rooster Cash`);
    console.log(`Created: ${wallet.createdAt.toLocaleString()}`);
    
    if (wallet.transactions.length > 0) {
      console.log(`\nRecent Transactions (${wallet.transactions.length} total):`);
      wallet.transactions.slice(-5).reverse().forEach(txn => {
        console.log(`  • ${txn.type}: ${txn.amount} RC - ${txn.timestamp.toLocaleString()}`);
      });
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function sellRoosterCash() {
  if (!currentUser) {
    console.log('❌ Please login first!');
    return;
  }
  
  const amount = parseInt(await prompt('\nAmount of Rooster Cash to sell: '));
  
  try {
    const transaction = marketplace.sellRoosterCash(currentUser, amount);
    console.log(`✅ Sold ${transaction.amount} Rooster Cash`);
    console.log(`   Refund amount: $${transaction.refundAmount}`);
    console.log(`   PayPal email: ${transaction.paypalEmail}`);
    console.log(`   Status: ${transaction.status}`);
    console.log(`   Transaction ID: ${transaction.id}`);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function viewStatistics() {
  console.log('\n📊 MARKETPLACE STATISTICS');
  console.log('='.repeat(60));
  
  const stats = marketplace.getStatistics();
  console.log(`Total Users: ${stats.users.total}`);
  console.log(`Total Rooster Cash in Circulation: ${stats.roosterCash.totalInCirculation}`);
  console.log(`Total Transactions: ${stats.roosterCash.totalTransactions}`);
  console.log('\nAuctions:');
  console.log(`  Total: ${stats.auctions.totalAuctions}`);
  console.log(`  Active: ${stats.auctions.activeAuctions}`);
  console.log(`  Completed: ${stats.auctions.completedAuctions}`);
  console.log(`  Cancelled: ${stats.auctions.cancelledAuctions}`);
  console.log(`  Total Bids: ${stats.auctions.totalBids}`);
  console.log(`  Total Value: ${stats.auctions.totalValue} Rooster Cash`);
}

async function main() {
  console.log('\n🐓 Welcome to Rooster Marketplace CLI! 🐓\n');
  
  let running = true;
  
  while (running) {
    displayMenu();
    const choice = await prompt('\nSelect an option: ');
    
    switch (choice) {
      case '1':
        await registerUser();
        break;
      case '2':
        await viewPaymentInstructions();
        break;
      case '3':
        await purchaseRoosterCash();
        break;
      case '4':
        await createAuction();
        break;
      case '5':
        await viewActiveAuctions();
        break;
      case '6':
        await placeBid();
        break;
      case '7':
        await viewMyAuctions();
        break;
      case '8':
        await viewWallet();
        break;
      case '9':
        await sellRoosterCash();
        break;
      case '10':
        await viewStatistics();
        break;
      case '0':
        running = false;
        console.log('\n🐓 Thank you for using Rooster Marketplace! Goodbye! 🐓\n');
        break;
      default:
        console.log('❌ Invalid option. Please try again.');
    }
    
    if (running && choice !== '0') {
      await prompt('\nPress Enter to continue...');
    }
  }
  
  rl.close();
}

// Run the CLI
main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
