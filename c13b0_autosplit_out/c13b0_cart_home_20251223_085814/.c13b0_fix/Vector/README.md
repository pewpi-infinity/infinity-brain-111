# ∞ Infinity Vector App

**A clean starter kit for building neuromorphic web applications with local-first, privacy-first architecture.**

Vector placement of apps in neuromorphic programming of OS SPA - featuring dynamic vector navigation, encrypted authentication, and modular zone architecture.

## 🚀 Features

- **∞ Infinity Sign-In Modal**
  - Local, encrypted, browser-based authentication
  - No third-party servers or external dependencies
  - Passphrase stored securely using Web Crypto API
  - 24-hour session management

- **🧭 Vector Web Navigation**
  - Dynamic vector "words/nodes" system
  - Smooth transitions between vector spaces
  - Visual feedback and active state management
  - Responsive horizontal navigation

- **🎯 Modular Zone Architecture**
  - Home Dashboard
  - Projects Management
  - Data Visualization
  - Development Tools
  - Settings & Configuration

- **🎨 Modern UI/UX**
  - Gradient-based design system
  - Smooth animations and transitions
  - Fully responsive layout
  - Dark theme optimized for extended use

- **🔒 Privacy-First Design**
  - Zero Trust architecture
  - All data stored locally
  - Client-side encryption
  - No telemetry or tracking

## 📦 Installation

Simply clone and open - no build process required!

```bash
git clone https://github.com/pewpi-infinity/Vector.git
cd Vector
```

## 🏃 Getting Started

### Option 1: Direct File Open
Simply open `index.html` in your web browser - it Just Works™!

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

### Option 2: Local Server (Recommended)
For the best experience, serve via a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## 🔐 First-Time Setup

1. **Open the app** in your browser
2. **Enter a passphrase** (minimum 8 characters) in the Infinity Sign-In modal
3. Your passphrase will be hashed and stored locally in your browser
4. Click "Sign In" to access the app
5. Navigate through vector nodes using the navigation bar

**Note:** Your passphrase is never sent to any server. It's stored locally and hashed using SHA-256 via the Web Crypto API. For production use, implement proper salted hashing with key derivation functions like PBKDF2.

## 📂 Project Structure

```
Vector/
├── index.html          # Main HTML entry point
├── styles.css          # Complete styling and animations
├── app.js             # Application logic and authentication
└── README.md          # This file
```

## 🎯 Vector Zones

### Home (🏠)
Dashboard and overview with quick access cards for common tasks.

### Projects (📁)
Manage and organize your vector projects with templates and existing project browsing.

### Data (📊)
Visualize and manage your vector data with datasets, search, and import/export capabilities.

### Tools (🔧)
Development utilities including vector builder, testing suite, code editor, and debug console.

### Settings (⚙️)
Configure your preferences including profile, security, appearance, and notifications.

## 🛠️ Customization

### Adding New Vector Nodes

Edit `app.js` and add to the `vectorNodes` array:

```javascript
this.vectorNodes = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'your-zone', label: 'Your Zone', icon: '🌟' },
    // ... other nodes
];
```

Then add the corresponding zone content in the `getZoneContent()` method.

### Customizing Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #6366f1;      /* Primary brand color */
    --secondary-color: #8b5cf6;    /* Secondary accent */
    --background-dark: #0f172a;    /* Dark background */
    /* ... more variables */
}
```

### Modifying Authentication

Update the `hashPassphrase()` method in `app.js` for custom hashing logic. The current implementation uses SHA-256 hashing as a simplified starter. For production:

```javascript
// Consider implementing:
// - Salted hashes with PBKDF2 or Argon2
// - Multi-factor authentication
// - Biometric authentication
// - Hardware security keys
```

## 🔒 Security Features

- **Client-Side Only**: No data leaves your browser
- **Hashed Storage**: Passphrases hashed using Web Crypto API (SHA-256)
- **Session Management**: 24-hour automatic timeout
- **No Third Parties**: Zero external dependencies for core functionality

**Note**: This starter kit uses simplified authentication. For production applications, implement proper security measures including salted hashes, key derivation functions (PBKDF2/Argon2), and stronger passphrase requirements.

## 🌐 Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

Requires browsers with Web Crypto API support.

## 📱 Responsive Design

The app is fully responsive and works great on:
- 💻 Desktop computers
- 📱 Tablets
- 📱 Mobile phones

## 🤝 Contributing

This is a starter kit - feel free to fork, modify, and build upon it for your own neuromorphic applications!

## 📄 License

Open source - use freely for your projects.

## 🎨 Architecture Philosophy

**Neuromorphic Programming**: The vector navigation mimics neural pathways, allowing fluid movement between different "thought spaces" (zones) in your application.

**Local-First**: All data and authentication happens in your browser. No cloud dependency.

**Zero Trust**: Every component operates independently without relying on external validation.

**SPA Architecture**: Single Page Application with dynamic content loading for smooth user experience.

## 🚀 Next Steps

1. **Customize the zones** to match your application needs
2. **Add persistence** by implementing IndexedDB or localStorage for zone data
3. **Extend authentication** with biometric options or hardware keys
4. **Build features** within each zone module
5. **Deploy** to GitHub Pages, Netlify, or Vercel for free hosting

## 💡 Pro Tips

- Use browser DevTools to inspect the vector node structure
- Session persists for 24 hours - sign out manually if sharing a device
- Add your own zones by following the existing pattern
- Customize the infinity logo and branding to match your project

---

**Built with 💜 for the neuromorphic web**

*Infinity Vector - Where neurons meet vectors*
