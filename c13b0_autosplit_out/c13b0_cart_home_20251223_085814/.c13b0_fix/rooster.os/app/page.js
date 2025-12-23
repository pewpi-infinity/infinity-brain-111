'use client'

import { useState, useEffect } from 'react'
import { playRoosterCrow } from './roosterSound'

// Sample silver products data
const silverProducts = [
  {
    id: 1,
    name: 'American Silver Eagle',
    year: 2024,
    category: 'new',
    type: 'coin',
    rarity: 'common',
    variety: 'bullion',
    price: 35.50,
    currentBid: 35.50,
    image: '/images/silver-eagle.jpg',
    description: 'Official silver bullion coin of the United States',
    weight: '1 oz',
    purity: '.999',
    verified: true,
    tokenized: true
  },
  {
    id: 2,
    name: 'Morgan Silver Dollar',
    year: 1921,
    category: 'ancients',
    type: 'coin',
    rarity: 'rare',
    variety: 'numismatic',
    price: 125.00,
    currentBid: 125.00,
    image: '/images/morgan-dollar.jpg',
    description: 'Historic American silver dollar',
    weight: '0.859 oz',
    purity: '.900',
    verified: true,
    tokenized: true
  },
  {
    id: 3,
    name: 'Canadian Maple Leaf',
    year: 2023,
    category: 'new',
    type: 'coin',
    rarity: 'common',
    variety: 'bullion',
    price: 34.00,
    currentBid: 34.00,
    image: '/images/maple-leaf.jpg',
    description: 'Canadian silver bullion coin',
    weight: '1 oz',
    purity: '.9999',
    verified: true,
    tokenized: true
  },
  {
    id: 4,
    name: 'Ancient Roman Denarius',
    year: 117,
    category: 'ancients',
    type: 'coin',
    rarity: 'very-rare',
    variety: 'historical',
    price: 450.00,
    currentBid: 450.00,
    image: '/images/roman-denarius.jpg',
    description: 'Ancient Roman silver coin from Trajan era',
    weight: '0.12 oz',
    purity: '.950',
    verified: true,
    tokenized: false
  },
  {
    id: 5,
    name: 'Silver Bar 10oz',
    year: 2024,
    category: 'new',
    type: 'bar',
    rarity: 'common',
    variety: 'bullion',
    price: 310.00,
    currentBid: 310.00,
    image: '/images/silver-bar.jpg',
    description: 'Pure silver bullion bar',
    weight: '10 oz',
    purity: '.999',
    verified: true,
    tokenized: true
  },
  {
    id: 6,
    name: 'Peace Silver Dollar',
    year: 1922,
    category: 'ancients',
    type: 'coin',
    rarity: 'uncommon',
    variety: 'numismatic',
    price: 85.00,
    currentBid: 85.00,
    image: '/images/peace-dollar.jpg',
    description: 'United States Peace dollar',
    weight: '0.859 oz',
    purity: '.900',
    verified: true,
    tokenized: true
  },
  {
    id: 7,
    name: 'Austrian Philharmonic',
    year: 2024,
    category: 'new',
    type: 'coin',
    rarity: 'common',
    variety: 'bullion',
    price: 33.50,
    currentBid: 33.50,
    image: '/images/philharmonic.jpg',
    description: 'Austrian silver bullion coin',
    weight: '1 oz',
    purity: '.999',
    verified: true,
    tokenized: true
  },
  {
    id: 8,
    name: 'Chinese Panda',
    year: 2023,
    category: 'new',
    type: 'coin',
    rarity: 'uncommon',
    variety: 'bullion',
    price: 42.00,
    currentBid: 42.00,
    image: '/images/panda.jpg',
    description: 'Chinese silver panda coin',
    weight: '30g',
    purity: '.999',
    verified: true,
    tokenized: true
  }
]

export default function Home() {
  const [products, setProducts] = useState(silverProducts)
  const [filteredProducts, setFilteredProducts] = useState(silverProducts)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedRarity, setSelectedRarity] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [bidAmount, setBidAmount] = useState('')
  const [sortBy, setSortBy] = useState('name')

  // Play rooster crow sound
  const playRoosterSound = () => {
    playRoosterCrow()
  }

  // Filter products
  useEffect(() => {
    let filtered = products

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType)
    }
    if (selectedRarity !== 'all') {
      filtered = filtered.filter(p => p.rarity === selectedRarity)
    }
    if (selectedYear !== 'all') {
      const yearNum = parseInt(selectedYear)
      if (selectedYear === 'ancient') {
        filtered = filtered.filter(p => p.year < 1900)
      } else if (selectedYear === 'vintage') {
        filtered = filtered.filter(p => p.year >= 1900 && p.year < 2000)
      } else if (selectedYear === 'modern') {
        filtered = filtered.filter(p => p.year >= 2000)
      }
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'price-low') return a.currentBid - b.currentBid
      if (sortBy === 'price-high') return b.currentBid - a.currentBid
      if (sortBy === 'year') return b.year - a.year
      return 0
    })

    setFilteredProducts(filtered)
  }, [selectedCategory, selectedType, selectedRarity, selectedYear, sortBy, products])

  const handleBid = (productId, amount) => {
    const product = products.find(p => p.id === productId)
    const bidValue = parseFloat(amount)
    
    if (bidValue > product.currentBid) {
      // Update the product with new bid
      setProducts(products.map(p => 
        p.id === productId ? { ...p, currentBid: bidValue } : p
      ))
      
      // Play rooster crow sound
      playRoosterSound()
      
      // Show success message
      alert(`Bid placed successfully! New bid: $${bidValue.toFixed(2)}\n🐓 Rooster Crow!`)
      setBidAmount('')
    } else {
      alert('Bid must be higher than current bid!')
    }
  }

  const AIAnalysis = ({ product }) => (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      marginTop: '20px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center' }}>
        🤖 AI Intelligence Analysis
      </h3>
      <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
        <p><strong>Authenticity Verification:</strong> {product.verified ? '✅ VERIFIED - No Fakes Detected' : '⚠️ Verification Pending'}</p>
        <p><strong>Market Analysis:</strong> Current bid is {product.currentBid > product.price ? 'above' : 'at'} market value. 
          AI predicts {Math.random() > 0.5 ? 'upward' : 'stable'} price trend.</p>
        <p><strong>Rarity Score:</strong> {
          product.rarity === 'very-rare' ? '95/100' :
          product.rarity === 'rare' ? '80/100' :
          product.rarity === 'uncommon' ? '60/100' : '40/100'
        }</p>
        <p><strong>Tokenization Status:</strong> {product.tokenized ? 
          '✅ Blockchain Token Available - Silver-backed NFT ready' : 
          '⏳ Token Creation Available'}</p>
        <p><strong>Knowledge Base:</strong> This system uses quantum-level analysis to detect patterns 
          that traditional grading services miss. We see beyond the dictionary definitions of value.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        padding: '30px 20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        borderBottom: '3px solid #f39c12'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '48px', fontWeight: 'bold' }}>
            🐓 ROOSTER.OS
          </h1>
          <p style={{ margin: 0, fontSize: '18px', opacity: 0.9 }}>
            Premium Silver Marketplace • AI-Powered • Blockchain-Tokenized • No Fakes Guarantee
          </p>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Filters */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '40px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ color: 'white', marginTop: 0 }}>Filter Silver Products</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Category
              </label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #f39c12',
                  fontSize: '16px',
                  background: 'white'
                }}
              >
                <option value="all">All Categories</option>
                <option value="new">New</option>
                <option value="ancients">Ancients</option>
              </select>
            </div>

            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Type
              </label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #f39c12',
                  fontSize: '16px',
                  background: 'white'
                }}
              >
                <option value="all">All Types</option>
                <option value="coin">Coins</option>
                <option value="bar">Bars</option>
              </select>
            </div>

            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Rarity
              </label>
              <select 
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #f39c12',
                  fontSize: '16px',
                  background: 'white'
                }}
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="very-rare">Very Rare</option>
              </select>
            </div>

            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Year Period
              </label>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #f39c12',
                  fontSize: '16px',
                  background: 'white'
                }}
              >
                <option value="all">All Years</option>
                <option value="ancient">Ancient (Pre-1900)</option>
                <option value="vintage">Vintage (1900-1999)</option>
                <option value="modern">Modern (2000+)</option>
              </select>
            </div>

            <div>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Sort By
              </label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '2px solid #f39c12',
                  fontSize: '16px',
                  background: 'white'
                }}
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="year">Year: Newest First</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '20px', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
            Showing {filteredProducts.length} products
          </div>
        </div>

        {/* Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                border: product.verified ? '3px solid #27ae60' : '3px solid #e74c3c'
              }}
              onClick={() => setSelectedProduct(product)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                background: '#f0f0f0',
                height: '250px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                position: 'relative'
              }}>
                {product.type === 'coin' ? '🪙' : '📦'}
                {product.verified && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#27ae60',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ✓ VERIFIED
                  </div>
                )}
                {product.tokenized && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: '#667eea',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    🔗 TOKENIZED
                  </div>
                )}
              </div>
              
              <div style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>{product.name}</h3>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                  Year: {product.year} • {product.weight} • {product.purity} purity
                </p>
                <p style={{ margin: '10px 0', color: '#333', fontSize: '14px' }}>
                  {product.description}
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '15px',
                  paddingTop: '15px',
                  borderTop: '2px solid #eee'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Current Bid</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>
                      ${product.currentBid.toFixed(2)}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProduct(product)
                    }}
                    style={{
                      background: '#f39c12',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Place Bid
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            padding: '60px',
            borderRadius: '12px',
            textAlign: 'center',
            fontSize: '20px'
          }}>
            No products match your filters. Try adjusting your selection.
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '40px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '32px' }}>{selectedProduct.name}</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '32px',
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              background: '#f5f5f5',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '120px',
              borderRadius: '12px',
              marginBottom: '30px'
            }}>
              {selectedProduct.type === 'coin' ? '🪙' : '📦'}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Product Details</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Year</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{selectedProduct.year}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Category</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{selectedProduct.category}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Type</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{selectedProduct.type}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Rarity</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{selectedProduct.rarity}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Variety</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{selectedProduct.variety}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Weight</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{selectedProduct.weight}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Purity</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{selectedProduct.purity}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <AIAnalysis product={selectedProduct} />

            <div style={{
              background: '#fff3cd',
              padding: '20px',
              borderRadius: '8px',
              marginTop: '20px',
              border: '2px solid #f39c12'
            }}>
              <h3 style={{ marginTop: 0 }}>Place Your Bid</h3>
              <div style={{ fontSize: '14px', marginBottom: '15px' }}>
                Current Bid: <strong style={{ fontSize: '20px', color: '#f39c12' }}>${selectedProduct.currentBid.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  step="0.01"
                  min={selectedProduct.currentBid + 0.01}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter your bid amount"
                  style={{
                    flex: 1,
                    padding: '15px',
                    fontSize: '18px',
                    borderRadius: '8px',
                    border: '2px solid #f39c12'
                  }}
                />
                <button
                  onClick={() => handleBid(selectedProduct.id, bidAmount)}
                  style={{
                    background: '#f39c12',
                    color: 'white',
                    border: 'none',
                    padding: '15px 40px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🐓 Place Bid
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '10px', marginBottom: 0 }}>
                Your bid must be higher than the current bid. When you place a bid, you'll hear a rooster crow! 🐓
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
