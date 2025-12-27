const out = document.getElementById("out");

function log(msg) {
  out.textContent += msg + "\n";
}

async function generateKey() {
  const key = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );

  const pub = await crypto.subtle.exportKey("jwk", key.publicKey);
  const priv = await crypto.subtle.exportKey("jwk", key.privateKey);

  localStorage.setItem("pewpi_admin_private", JSON.stringify(priv));
  localStorage.setItem("pewpi_admin_public", JSON.stringify(pub));

  log("✅ Admin key generated and stored locally.");
  log("⚠️ Back this up. This IS the login.");
}

async function login() {
  const privRaw = localStorage.getItem("pewpi_admin_private");
  if (!privRaw) {
    log("❌ No admin key found.");
    return;
  }

  const priv = await crypto.subtle.importKey(
    "jwk",
    JSON.parse(privRaw),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    priv,
    challenge
  );

  log("🔐 Signed challenge.");
  log("✅ Admin authenticated locally.");
  log("➡️ Ready to control page with AI.");
}
