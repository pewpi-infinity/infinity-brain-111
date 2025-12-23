const outputBox = document.getElementById('outputBox');
const tiles = document.querySelectorAll('.tile');

const snippets = {
  "new-portal": "New portal shell goes here (we can paste the full HTML from earlier).",
  "token-page": "Token/PayPal page (wired to watsonkris611@gmail.com).",
  "socializer": "Socializer image→AI description UI."
};

tiles.forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.load;
    outputBox.textContent = snippets[key] || "Unknown tile.";
  });
});
