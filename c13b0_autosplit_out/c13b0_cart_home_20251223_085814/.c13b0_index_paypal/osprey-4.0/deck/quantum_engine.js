// 🔮 OSPREY Quantum Vector Layer (Phase 5)
async function loadDeck(){
  const res=await fetch('deck/deck.json');
  const deck=await res.json();
  window.ospreyDeck=deck;
  console.log(`[🃏] Infinity Deck loaded (${deck.length} cards)`);
  return deck;
}

function drawRandomCard(){
  if(!window.ospreyDeck) return null;
  const card=window.ospreyDeck[Math.floor(Math.random()*window.ospreyDeck.length)];
  console.log(`[✨] Drawn: ${card.rank} of ${card.suit} – ${card.meaning}`);
  return card;
}

window.OspreyQuantum={loadDeck,drawRandomCard};
