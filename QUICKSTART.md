# 🚀 Quick Start Guide - Get Running in 10 Minutes

This guide will get your EdgeDecision platform running locally with:
✅ User registration working
✅ AI chat powered by Claude
✅ Shopify data syncing
✅ Real-time dashboard

## 📋 Prerequisites

1. **Docker Desktop** (recommended) OR Node.js 18+, PostgreSQL, Redis
2. **API Keys** (get these first):
   - Anthropic Claude API key
   - Shopify API credentials (from your test store)
   - Stripe test API keys

---

## 🐳 OPTION 1: Docker Setup (Easiest - 10 Minutes)

### Step 1: Get Your API Keys

#### A) Anthropic Claude API (REQUIRED for AI chat)
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Click "Get API Keys"
4. Create a new key
5. Copy it (starts with `sk-ant-`)

#### B) Shopify API (REQUIRED for data sync)
1. Go to your Shopify admin panel
2. Navigate to: Settings > Apps and sales channels > Develop apps
3. Click "Create an app"
4. Name it "EdgeDecision"
5. Go to "Configuration" tab
6. Under "Admin API access scopes" select:
   - `read_orders`
   - `read_products`
   - `read_customers`
7. Click "Save"
8. Go to "API credentials" tab
9. Click "Install app"
10. Copy the "Admin API access token" (this is your SHOPIFY_API_KEY)
11. Copy the "API secret key" (this is your SHOPIFY_API_SECRET)

#### C) Stripe API (OPTIONAL - for billing features)
1. Go to https://dashboard.stripe.com/register
2. Sign up for free
3. Go to Developers > API keys
4. Copy "Secret key" and "Publishable key" (use TEST mode)

### Step 2: Configure Environment

```bash
# In the ecommerce-platform directory
cp .env.template .env
```

Edit `.env` file and add your keys:
```env
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
SHOPIFY_API_KEY=shpat_your-access-token
SHOPIFY_API_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

### Step 3: Start Everything

```bash
# Make sure Docker Desktop is running, then:
docker-compose up --build
```

Wait for all services to start (about 2-3 minutes). You'll see:
```
✅ PostgreSQL ready
✅ Redis ready  
✅ Backend running on port 3001
✅ Frontend running on port 3000
```

### Step 4: Access the Application

Open your browser:
- **Frontend**: http://localhost:3000
- **API Health Check**: http://localhost:3001/health

### Step 5: Create Your Account

1. Click "Register" on the homepage
2. Fill in:
   - Email: your@email.com
   - Password: (at least 8 characters)
   - First Name: Your name
   - Last Name: Your last name
   - Organization Name: Your Company
3. Click "Register"
4. You're now logged in with a 14-day trial!

### Step 6: Connect Shopify

1. Go to "Integrations" tab
2. Click "Connect Shopify"
3. Enter:
   - Shop Domain: `your-store.myshopify.com`
   - Access Token: (the token you copied earlier)
4. Click "Connect"
5. The system will start syncing your orders automatically!

### Step 7: Test AI Chat

1. Go to "AI Assistant" tab
2. Try asking:
   - "What's my total revenue this month?"
   - "Which channel has the best ROAS?"
   - "How many orders did I get yesterday?"
3. Claude will analyze your Shopify data and respond!

---

## 💻 OPTION 2: Manual Setup (Without Docker)

### Prerequisites:
- Node.js 18+
- PostgreSQL 15+
- Redis 6+

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### Step 2: Setup Database

```bash
# Install PostgreSQL if not installed
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
# Windows: Download from postgresql.org

# Create database
createdb edgedecision

# Run migrations
cd backend
npm run migrate
```

### Step 3: Install Redis

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from: https://github.com/microsoftarchive/redis/releases
```

### Step 4: Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edgedecision
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-this
CORS_ORIGIN=http://localhost:3000

# Your API keys
ANTHROPIC_API_KEY=sk-ant-your-key
SHOPIFY_API_KEY=shpat_your-token
SHOPIFY_API_SECRET=your-secret
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

### Step 5: Configure Frontend

```bash
cd frontend
```

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001
REACT_APP_STRIPE_PK=pk_test_your-key
```

### Step 6: Start Services

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm start

# Terminal 3: Redis (if not running as service)
redis-server
```

---

## 🎯 Testing Everything Works

### Test 1: API is Running
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test 2: Register a User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Company"
  }'
```

### Test 3: Connect Shopify
```bash
# Get your auth token first from the register response, then:
curl -X POST http://localhost:3001/api/integrations/shopify/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "shopDomain": "your-store.myshopify.com",
    "accessToken": "shpat_your_token"
  }'
```

### Test 4: Ask AI a Question
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "message": "What is my total revenue?"
  }'
```

---

## 📊 Verify Data Sync is Working

After connecting Shopify, check:

1. **Backend Logs** - You should see:
```
Starting Shopify sync for org: [org-id]
Fetched 250 orders from Shopify
Shopify sync completed
```

2. **Database** - Check data was imported:
```bash
# Connect to database
docker exec -it edgedecision-db psql -U postgres -d edgedecision

# Check data
SELECT COUNT(*) FROM analytics_cache;
SELECT COUNT(*) FROM attribution_data;
```

3. **Dashboard** - Refresh your browser, you should see:
   - Revenue metrics updated
   - Order counts
   - Channel attribution data

---

## 🔧 Troubleshooting

### "Cannot connect to database"
```bash
# Make sure PostgreSQL is running
docker ps | grep postgres
# or
pg_isready
```

### "Redis connection refused"
```bash
# Make sure Redis is running
docker ps | grep redis
# or
redis-cli ping
```

### "Shopify sync not working"
- Verify your shop domain is correct: `yourstore.myshopify.com`
- Check access token has correct permissions
- Look at backend logs for specific error

### "AI chat not responding"
- Verify ANTHROPIC_API_KEY is set correctly
- Check you have API credits in your Anthropic account
- Look at backend console for errors

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 🎨 Next Steps

Once everything is running:

1. **Explore the Dashboard**
   - View revenue trends
   - Check channel attribution
   - Analyze customer journey

2. **Test AI Assistant**
   - Ask about your metrics
   - Request insights
   - Generate forecasts

3. **Add More Integrations**
   - Connect Facebook Ads
   - Add Google Ads
   - Link Klaviyo

4. **Invite Team Members**
   - Go to Settings > Team
   - Add members with different roles

5. **Customize**
   - Update branding
   - Add custom metrics
   - Build unique features

---

## 📞 Common Commands

### Docker
```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild after code changes
docker-compose up --build

# Reset database
docker-compose down -v
docker-compose up --build
```

### Database
```bash
# Access database
docker exec -it edgedecision-db psql -U postgres -d edgedecision

# Run migrations
docker exec -it edgedecision-backend npm run migrate

# View all tables
docker exec -it edgedecision-db psql -U postgres -d edgedecision -c "\dt"
```

---

## ✅ Success Checklist

- [ ] Docker running (or PostgreSQL + Redis)
- [ ] Got Anthropic API key
- [ ] Got Shopify credentials
- [ ] `.env` file configured
- [ ] `docker-compose up` successful
- [ ] Frontend opens at localhost:3000
- [ ] Registered a new account
- [ ] Connected Shopify integration
- [ ] Data syncing (check backend logs)
- [ ] Dashboard showing metrics
- [ ] AI chat responding to questions

**Congratulations! Your ecommerce analytics platform is now running! 🎉**

---

## 🚀 Ready for Production?

See `README.md` for:
- Production deployment guides
- Security hardening
- Performance optimization
- Scaling strategies
