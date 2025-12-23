# Vector-API - Infinity OS

New Vectoring Neuromorphic SPA - Infinity OS

A modern Single Page Application (SPA) for neuromorphic vector processing, built with React, TypeScript, and Vite.

## 🚀 Features

### 1. Login-Infinity
- Secure authentication system
- Modern, animated login interface
- Session persistence with localStorage
- Protected route handling

### 2. Vectoring SPA
- Real-time vector visualization
- Interactive vector operations
- Multi-dimensional vector processing
- Neuromorphic computing interface
- Live operation monitoring

### 3. Infinity Portal
- Comprehensive system dashboard
- Real-time statistics and metrics
- Configurable settings
- User management
- System overview with live data

## 📋 Prerequisites

- Node.js 18+ or later
- npm 9+ or later

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/pewpi-infinity/Vector-API.git
cd Vector-API
```

2. Install dependencies:
```bash
npm install
```

## 🏃‍♂️ Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🎨 Application Structure

```
Vector-API/
├── src/
│   ├── components/       # Reusable React components
│   │   └── ProtectedRoute.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── pages/           # Main application pages
│   │   ├── Login.tsx
│   │   ├── Portal.tsx
│   │   └── VectoringSPA.tsx
│   ├── styles/          # CSS stylesheets
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── Login.css
│   │   ├── Portal.css
│   │   └── VectoringSPA.css
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Application entry point
├── public/              # Static assets
│   └── infinity-logo.svg
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md
```

## 🔐 Authentication

For the demo version, you can log in with any username and password. In production, this should be connected to a proper backend authentication service.

## 🎯 Usage

1. **Login**: Navigate to the login page and enter any credentials
2. **Portal**: Access the Infinity Portal dashboard to view system metrics and configure settings
3. **Vectoring**: Access the Vectoring SPA to create and manipulate vectors

## 🧪 Development

### Linting

Run ESLint:
```bash
npm run lint
```

## 🛡️ Technology Stack

- **React 18.2** - UI library
- **TypeScript 5.2** - Type-safe JavaScript
- **Vite 5.0** - Build tool and dev server
- **React Router 6.20** - Client-side routing
- **CSS3** - Styling with modern features

## 🎨 Design Features

- Dark/Light mode support
- Responsive design
- Animated UI elements
- Gradient themes
- Neuromorphic visualizations
- Real-time data updates

## 📝 License

This project is part of the Infinity OS ecosystem.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔮 Future Enhancements

- Backend API integration
- Real-time WebSocket connections
- Advanced vector operations
- 3D vector visualization
- Export/Import functionality
- User role management
- API documentation
