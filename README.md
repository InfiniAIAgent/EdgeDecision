# EdgeDecision - Complete Ecommerce Analytics Platform

A production-ready, full-stack ecommerce analytics platform similar to TripleWhale, featuring real-time data updates, AI-powered insights, multi-platform integrations, and subscription billing.

## 🚀 Features

### Core Analytics
- **Real-time Dashboard** - Live metrics with WebSocket updates
- **Multi-Touch Attribution** - Track ROI across Facebook, Google, TikTok, Instagram
- **Revenue & Profit Tracking** - Comprehensive financial analytics
- **Customer Journey Analysis** - Funnel visualization and conversion tracking
- **Product Performance** - Best-sellers and margin analysis

### Integrations
- **Shopify** - Orders, products, customers sync
- **Facebook Ads** - Campaign performance and ROAS
- **Google Ads** - Ad spend and conversion tracking
- **TikTok Ads** - Emerging channel analytics
- **Klaviyo** - Email marketing metrics
- **Instagram Ads** - Social commerce tracking

### AI Assistant
- **Claude-Powered Chat** - Conversational analytics Q&A
- **Automatic Insights** - AI-generated recommendations
- **Context-Aware** - Understands your business data
- **Forecasting** - Predict future performance

### Business Features
- **Multi-tenancy** - Support multiple organizations
- **Team Management** - Role-based access control (Owner, Admin, Member, Viewer)
- **Subscription Billing** - Stripe integration with multiple plans
- **WebSocket Real-time** - Live data updates without refresh
- **Mobile Responsive** - Works on all devices

## 📦 Tech Stack

### Backend
- **Node.js + Express** - REST API server
- **PostgreSQL** - Primary database
- **Redis** - Caching and job queues
- **Socket.io** - WebSocket server
- **Stripe** - Payment processing
- **Anthropic Claude API** - AI assistant
- **JWT** - Authentication
- **Bull** - Background job processing

### Frontend
- **React 18** - UI framework
- **Recharts** - Data visualization
- **Socket.io-client** - Real-time updates
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icon system

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Stripe account
- Anthropic API key
- Platform API keys (Shopify, Facebook, Google, etc.)

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. **Setup Database**
```bash
# Create PostgreSQL database
createdb edgedecision

# Run migrations
npm run migrate
```

4. **Start Redis**
```bash
redis-server
```

5. **Start Backend Server**
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure Environment**
```bash
# Create .env file
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001
REACT_APP_STRIPE_PK=pk_test_your_publishable_key
```

3. **Start Development Server**
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 🔑 API Keys Configuration

### Shopify
1. Create a Shopify Partner account
2. Create a custom app in your store
3. Add API key and access token to `.env`

### Facebook Ads
1. Create Facebook App at developers.facebook.com
2. Get Marketing API access
3. Generate long-lived access token
4. Add to `.env`

### Google Ads
1. Enable Google Ads API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Get developer token from Google Ads
4. Add credentials to `.env`

### TikTok Ads
1. Register for TikTok Marketing API
2. Create an app
3. Get access token and advertiser ID
4. Add to `.env`

### Klaviyo
1. Log into Klaviyo account
2. Go to Account > Settings > API Keys
3. Create a private API key
4. Add to `.env`

### Stripe
1. Create Stripe account
2. Get test API keys from Dashboard
3. Create products and prices
4. Update price IDs in `backend/routes/billing.js`
5. Add keys to `.env`

### Anthropic Claude
1. Sign up at console.anthropic.com
2. Generate API key
3. Add to `.env`

## 🗄️ Database Schema

The platform uses the following main tables:

- **organizations** - Multi-tenant organizations
- **users** - User accounts
- **organization_members** - User-organization relationships with roles
- **integrations** - Connected platform credentials
- **analytics_cache** - Cached metrics data
- **attribution_data** - Multi-touch attribution records
- **ai_chat_history** - AI conversation history
- **billing_history** - Subscription payment records

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user and organization
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Integrations
- `GET /api/integrations` - List all integrations
- `POST /api/integrations/shopify/connect` - Connect Shopify
- `POST /api/integrations/facebook/connect` - Connect Facebook Ads
- `POST /api/integrations/:platform/sync` - Trigger manual sync

### Analytics
- `GET /api/analytics` - Get analytics data
- `GET /api/analytics/attribution` - Get attribution data

### AI Assistant
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/insights` - Generate insights
- `GET /api/ai/conversations` - List conversations

### Billing
- `GET /api/billing/plans` - List available plans
- `POST /api/billing/checkout` - Create checkout session
- `POST /api/billing/portal` - Customer portal
- `GET /api/billing/usage` - Current usage

## 📊 WebSocket Events

### Client → Server
- `subscribe:metrics` - Subscribe to specific metrics
- `request:analytics` - Request current data

### Server → Client
- `analytics:update` - Real-time analytics data
- `metric:update` - Specific metric updated
- `notification` - System notifications

## 🎨 Customization Guide

### Adding New Integration

1. Create service file: `backend/services/yourPlatform.js`
2. Implement methods:
   - `validateConnection()`
   - `syncData(organizationId)`
3. Add route in `backend/routes/integrations.js`
4. Update frontend integration UI

### Custom Metrics

1. Add metric type to database schema
2. Create sync logic in integration service
3. Update `analytics_cache` table
4. Add visualization in frontend dashboard

### AI Assistant Customization

Edit the system prompt in `backend/routes/ai.js` to customize:
- Tone and personality
- Available capabilities
- Response format
- Domain expertise

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. **Prepare for deployment**
```bash
# Ensure all dependencies are in package.json
npm install --production
```

2. **Set environment variables** on your platform

3. **Deploy**
```bash
git push heroku main
# or use platform-specific deployment
```

4. **Run migrations**
```bash
heroku run npm run migrate
# or platform equivalent
```

### Frontend Deployment (Vercel/Netlify)

1. **Build production bundle**
```bash
npm run build
```

2. **Deploy** using platform CLI or Git integration

3. **Set environment variables** in platform dashboard

### Database (Heroku Postgres/Supabase)

1. Provision PostgreSQL instance
2. Update `DATABASE_URL` in backend `.env`
3. Run migrations

### Redis (Heroku Redis/Upstash)

1. Provision Redis instance
2. Update `REDIS_URL` in backend `.env`

## 📈 Scaling Considerations

### Performance Optimization
- **Caching** - Use Redis for frequently accessed data
- **Database Indexing** - Index on `organization_id`, `date`, `metric_type`
- **Rate Limiting** - Protect API endpoints
- **CDN** - Serve frontend assets via CDN
- **Database Connection Pooling** - Optimize concurrent connections

### High Availability
- **Load Balancing** - Multiple backend instances
- **Database Replication** - Read replicas for analytics queries
- **Queue Workers** - Separate processes for background jobs
- **Monitoring** - Use DataDog, New Relic, or similar

## 🔐 Security Best Practices

1. **Environment Variables** - Never commit `.env` files
2. **API Key Encryption** - Encrypt platform credentials in database
3. **HTTPS Only** - Enforce SSL in production
4. **Rate Limiting** - Prevent abuse
5. **Input Validation** - Validate all user inputs
6. **CORS** - Configure allowed origins
7. **Helmet.js** - Security headers
8. **Regular Updates** - Keep dependencies updated

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For issues, feature requests, or questions:
- GitHub Issues (if applicable)
- Email: support@edgedecision.com
- Documentation: docs.edgedecision.com

## 🎯 Next Steps to Productize

1. **Complete Integration Implementations**
   - Finish Google Ads service
   - Finish TikTok Ads service
   - Add Instagram integration

2. **Enhanced Features**
   - Custom dashboard builder
   - Automated alerts
   - Export functionality (CSV, PDF)
   - API access for customers
   - Slack/Discord integrations

3. **Business Features**
   - Onboarding flow
   - In-app tutorials
   - Customer success dashboard
   - Admin panel

4. **Security Enhancements**
   - 2FA authentication
   - SSO integration
   - Audit logging
   - GDPR compliance

5. **Performance**
   - Optimize database queries
   - Implement full-text search
   - Add query result caching
   - Background job optimization

## 📚 Additional Resources

- [Shopify API Docs](https://shopify.dev/docs/api)
- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis)
- [Google Ads API](https://developers.google.com/google-ads/api/docs/start)
- [TikTok Marketing API](https://ads.tiktok.com/marketing_api/docs)
- [Klaviyo API](https://developers.klaviyo.com/en/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)

---

Built with ❤️ for ecommerce analytics
