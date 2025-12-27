# Rooster Marketplace API Documentation

## Table of Contents
1. [RoosterCashSystem](#roostercashsystem)
2. [AuctionSystem](#auctionsystem)
3. [RoosterMarketplace](#roostermarketplace)
4. [Data Structures](#data-structures)

---

## RoosterCashSystem

The `RoosterCashSystem` class manages the virtual currency for the marketplace.

### Constructor

```javascript
const roosterCash = new RoosterCashSystem();
```

### Methods

#### `createWallet(userId)`
Create a new user wallet.

**Parameters:**
- `userId` (string): Unique user identifier

**Returns:** Object containing wallet information

**Example:**
```javascript
const wallet = roosterCash.createWallet('user123');
// { userId: 'user123', balance: 0, transactions: [], createdAt: Date }
```

#### `getWallet(userId)`
Get user wallet information.

**Parameters:**
- `userId` (string): User identifier

**Returns:** Object with wallet details

**Throws:** Error if wallet not found

#### `purchaseRoosterCash(userId, amount, paypalTransactionId)`
Purchase rooster cash via PayPal.

**Parameters:**
- `userId` (string): User identifier
- `amount` (number): Amount of rooster cash to purchase
- `paypalTransactionId` (string): PayPal transaction ID

**Returns:** Transaction object

**Example:**
```javascript
const transaction = roosterCash.purchaseRoosterCash('user123', 100, 'PP_TXN_001');
// { id, userId, type: 'purchase', amount, paypalTransactionId, totalCost, timestamp }
```

#### `sellRoosterCash(userId, amount)`
Sell rooster cash back to PayPal.

**Parameters:**
- `userId` (string): User identifier
- `amount` (number): Amount to sell

**Returns:** Transaction object with refund details

**Throws:** Error if insufficient balance

#### `transferRoosterCash(fromUserId, toUserId, amount)`
Transfer rooster cash between users.

**Parameters:**
- `fromUserId` (string): Sender user ID
- `toUserId` (string): Recipient user ID
- `amount` (number): Amount to transfer

**Returns:** Transaction object

**Throws:** Error if insufficient balance

#### `hasSufficientBalance(userId, amount)`
Check if user has sufficient balance.

**Parameters:**
- `userId` (string): User identifier
- `amount` (number): Amount to check

**Returns:** Boolean

#### `getPaymentInstructions()`
Get payment instructions for purchasing rooster cash.

**Returns:** Object with PayPal email and instructions

---

## AuctionSystem

The `AuctionSystem` class manages auctions with configurable durations.

### Constructor

```javascript
const auctions = new AuctionSystem(roosterCashSystem);
```

**Parameters:**
- `roosterCashSystem` (RoosterCashSystem): Instance of RoosterCashSystem

### Methods

#### `createAuction(userId, auctionData)`
Create a new auction.

**Parameters:**
- `userId` (string): Auction creator's user ID
- `auctionData` (object):
  - `title` (string): Auction title
  - `description` (string): Auction description
  - `startingBid` (number): Starting bid amount in rooster cash
  - `duration` (number): Duration in milliseconds (max: 10 years)

**Returns:** Auction object

**Example:**
```javascript
const auction = auctions.createAuction('seller123', {
  title: 'Vintage Rooster Clock',
  description: 'Beautiful antique clock',
  startingBid: 50,
  duration: 7 * 24 * 60 * 60 * 1000 // 1 week
});
```

#### `placeBid(auctionId, bidderId, bidAmount)`
Place a bid on an auction.

**Parameters:**
- `auctionId` (string): Auction identifier
- `bidderId` (string): Bidder's user ID
- `bidAmount` (number): Bid amount in rooster cash

**Returns:** Object with auction, bid, and rooster crow message

**Throws:** Error if:
- Auction not found or not active
- Bidder is the seller
- Bid amount too low
- Insufficient rooster cash balance

**Example:**
```javascript
const result = auctions.placeBid('auction_123', 'bidder456', 75);
// { auction, bid, message: '🐓 ROOSTER CROW! You got a bid on your auction!' }
```

#### `getAuction(auctionId)`
Get auction details.

**Parameters:**
- `auctionId` (string): Auction identifier

**Returns:** Auction object

**Throws:** Error if auction not found

#### `getUserAuctions(userId)`
Get all auctions for a user.

**Parameters:**
- `userId` (string): User identifier

**Returns:** Array of auction objects

#### `getActiveAuctions()`
Get all active auctions.

**Returns:** Array of active auction objects, sorted by creation date (newest first)

#### `closeAuction(auctionId)`
Close an auction.

**Parameters:**
- `auctionId` (string): Auction identifier

**Returns:** Closed auction with winner information

**Note:** Automatically transfers rooster cash from winner to seller

#### `cancelAuction(auctionId, userId)`
Cancel an auction (only by seller before any bids).

**Parameters:**
- `auctionId` (string): Auction identifier
- `userId` (string): User requesting cancellation

**Returns:** Cancelled auction

**Throws:** Error if:
- Not the seller
- Auction already has bids

#### `getStatistics()`
Get auction statistics.

**Returns:** Object with marketplace statistics

---

## RoosterMarketplace

The `RoosterMarketplace` class is the main interface combining both systems.

### Constructor

```javascript
const marketplace = new RoosterMarketplace();
```

### Methods

#### `registerUser(userId)`
Register a new user.

**Parameters:**
- `userId` (string): Unique user identifier

**Returns:** User wallet information

#### `getUserInfo(userId)`
Get complete user information.

**Parameters:**
- `userId` (string): User identifier

**Returns:** Object with wallet, auctions, and statistics

**Example:**
```javascript
const info = marketplace.getUserInfo('user123');
// {
//   userId,
//   wallet: { balance, transactions, createdAt },
//   auctions: [...],
//   statistics: { totalAuctions, activeAuctions, completedAuctions }
// }
```

#### `getPaymentInstructions()`
Get payment instructions for rooster cash.

**Returns:** Object with PayPal details and instructions

#### `purchaseRoosterCash(userId, amount, paypalTransactionId)`
Purchase rooster cash.

**Parameters:**
- `userId` (string): User identifier
- `amount` (number): Amount to purchase
- `paypalTransactionId` (string): PayPal transaction ID

**Returns:** Transaction details

#### `sellRoosterCash(userId, amount)`
Sell rooster cash back.

**Parameters:**
- `userId` (string): User identifier
- `amount` (number): Amount to sell

**Returns:** Transaction details

#### `createAuction(userId, auctionData)`
Create a new auction.

**Parameters:**
- `userId` (string): Seller user ID
- `auctionData` (object): Auction details (see AuctionSystem.createAuction)

**Returns:** Created auction

#### `placeBid(auctionId, bidderId, bidAmount)`
Place a bid on an auction.

**Parameters:**
- `auctionId` (string): Auction identifier
- `bidderId` (string): Bidder user ID
- `bidAmount` (number): Bid amount

**Returns:** Bid result with rooster crow notification

#### `getAuction(auctionId)`
Get auction details.

**Parameters:**
- `auctionId` (string): Auction identifier

**Returns:** Auction object

#### `getActiveAuctions()`
Get all active auctions.

**Returns:** Array of active auctions

#### `cancelAuction(auctionId, userId)`
Cancel an auction.

**Parameters:**
- `auctionId` (string): Auction identifier
- `userId` (string): User requesting cancellation

**Returns:** Cancelled auction

#### `getStatistics()`
Get marketplace statistics.

**Returns:** Object with comprehensive statistics

**Example:**
```javascript
const stats = marketplace.getStatistics();
// {
//   users: { total },
//   roosterCash: { totalInCirculation, totalTransactions },
//   auctions: { totalAuctions, activeAuctions, completedAuctions, ... }
// }
```

---

## Data Structures

### Wallet Object
```javascript
{
  userId: string,
  balance: number,
  transactions: Array<Transaction>,
  createdAt: Date
}
```

### Transaction Object
```javascript
{
  id: string,
  userId: string,
  type: 'purchase' | 'sell' | 'transfer',
  amount: number,
  timestamp: Date,
  // Additional fields depending on type:
  paypalTransactionId?: string,  // for 'purchase'
  totalCost?: number,             // for 'purchase'
  refundAmount?: number,          // for 'sell'
  paypalEmail?: string,           // for 'sell'
  status?: string,                // for 'sell'
  fromUserId?: string,            // for 'transfer'
  toUserId?: string               // for 'transfer'
}
```

### Auction Object
```javascript
{
  id: string,
  sellerId: string,
  title: string,
  description: string,
  startingBid: number,
  currentBid: number,
  highestBidder: string | null,
  bids: Array<Bid>,
  status: 'active' | 'completed' | 'cancelled',
  createdAt: Date,
  endTime: Date,
  duration: number,
  winnerPaid?: boolean,
  paymentError?: string
}
```

### Bid Object
```javascript
{
  id: string,
  bidderId: string,
  amount: number,
  timestamp: Date
}
```

### Statistics Object
```javascript
{
  users: {
    total: number
  },
  roosterCash: {
    totalInCirculation: number,
    totalTransactions: number
  },
  auctions: {
    totalAuctions: number,
    activeAuctions: number,
    completedAuctions: number,
    cancelledAuctions: number,
    totalBids: number,
    totalValue: number
  }
}
```

---

## Duration Constants

Common auction duration values:

```javascript
const DURATIONS = {
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
  SIX_MONTHS: 180 * 24 * 60 * 60 * 1000,
  ONE_YEAR: 365 * 24 * 60 * 60 * 1000,
  TEN_YEARS: 10 * 365 * 24 * 60 * 60 * 1000  // Maximum
};
```

---

## Error Handling

All methods throw descriptive errors when operations fail. Always wrap calls in try-catch blocks:

```javascript
try {
  const result = marketplace.placeBid(auctionId, userId, amount);
  console.log('Bid placed successfully');
} catch (error) {
  console.error('Bid failed:', error.message);
}
```

Common errors:
- `"User wallet not found"`
- `"Auction not found"`
- `"Insufficient rooster cash balance"`
- `"Cannot bid on your own auction"`
- `"Auction is not active"`
- `"Bid must be higher than current bid"`

---

## Best Practices

1. **Always validate user input** before calling API methods
2. **Check balances** before allowing users to place bids
3. **Handle errors gracefully** with user-friendly messages
4. **Store PayPal transaction IDs** for audit purposes
5. **Monitor auction end times** and close auctions automatically
6. **Use the rooster crow notification** to alert sellers of new bids

---

For more examples, see the `examples/` directory in the repository.
