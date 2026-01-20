# EdgeDecision Frontend

React-based frontend for the EdgeDecision ecommerce analytics platform.

## Features

- Real-time analytics dashboard with WebSocket updates
- AI assistant powered by Claude API
- Multi-touch attribution tracking
- Integration management (Shopify, Facebook Ads, Google Ads, TikTok, Klaviyo)
- Subscription billing with Stripe
- Team management
- Mobile responsive design

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_WS_URL=http://localhost:3001
   REACT_APP_STRIPE_PK=pk_test_your_key
   ```

3. Start development server:
   ```bash
   npm start
   ```

## Key Files

- `src/App.jsx` - Main application with routing
- `src/services/api.js` - API client with authentication
- `src/services/websocket.js` - WebSocket connection manager
- `src/store/useStore.js` - Zustand state management
- `src/components/Dashboard.jsx` - Main analytics dashboard
- `src/components/AIAssistant.jsx` - AI chat interface
- `src/components/Integrations.jsx` - Platform connections
- `src/components/Billing.jsx` - Subscription management

## Architecture

- Uses WebSocket for real-time data updates
- Axios for REST API calls
- Zustand for state management
- Recharts for data visualization
- Socket.io-client for WebSocket connection
