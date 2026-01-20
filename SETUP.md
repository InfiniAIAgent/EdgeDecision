# 🚀 Setup Instructions - Fixed for Database Issues

## Choose Your Setup Method:

### Option A: Docker (Recommended if Docker works)
### Option B: Manual Setup (Recommended if Docker has issues)

---

## 🐳 OPTION A: Docker Setup

### Step 1: Prerequisites
- Docker Desktop installed and running
- Get your API keys ready

### Step 2: Configure Environment
```bash
cd ecommerce-platform
cp .env.template .env
```

Edit `.env` and add your API keys:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
SHOPIFY_API_KEY=shpat_your-token
SHOPIFY_API_SECRET=your-secret
```

### Step 3: Start Everything
```bash
docker-compose up --build
```

**Wait 2-3 minutes** for:
- PostgreSQL to start
- Database migrations to run
- Backend server to start
- Frontend to compile

### Step 4: Access Application
Open: http://localhost:3000

---

## 💻 OPTION B: Manual Setup (No Docker)

### Step 1: Install Prerequisites

**Node.js 18+:**
```bash
# Check if you have it
node --version  # Should be v18 or higher

# If not, download from: https://nodejs.org/
```

**PostgreSQL:**
```bash
# Mac
brew install postgresql@15
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from: https://www.postgresql.org/download/windows/
```

### Step 2: Setup Project
```bash
cd ecommerce-platform

# Run auto-setup script
chmod +x manual-setup.sh
./manual-setup.sh
```

This script will:
- Install all dependencies
- Create database
- Generate .env files
- Run migrations

### Step 3: Configure API Keys

Edit `backend/.env`:
```bash
nano backend/.env  # or use any text editor
```

Add your keys:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
SHOPIFY_API_KEY=shpat_your-token
SHOPIFY_API_SECRET=your-secret
```

### Step 4: Initialize Database

```bash
cd backend
chmod +x init-db.sh
./init-db.sh
```

This will:
- Check PostgreSQL is running
- Create database if needed
- Run migrations

### Step 5: Start Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3001
📊 Environment: development
🔌 WebSocket server initialized
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Browser will open automatically at http://localhost:3000

---

## ✅ Verify Everything Works

### 1. Check API
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Check Database
```bash
# Connect to database
psql edgedecision

# List tables
\dt

# Should see: organizations, users, integrations, etc.

# Exit
\q
```

### 3. Register Account
1. Go to http://localhost:3000
2. Click "Register"
3. Fill in details
4. Click "Register"
5. You should be logged in!

---

## 🔧 Troubleshooting

### "No configuration file found" (The error you got)

This means Knex config is missing. **Fixed in new version!**

Download the updated package and you'll have:
- `backend/knexfile.js` ✅
- `backend/init-db.sh` ✅
- Updated migration scripts ✅

### "Cannot connect to database"

**Check PostgreSQL is running:**
```bash
# Mac/Linux
pg_isready

# If not running:
brew services start postgresql  # Mac
sudo systemctl start postgresql  # Linux
```

**Check connection details in .env:**
```env
# Should look like this for local setup:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edgedecision

# For Docker:
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/edgedecision
```

### "Database does not exist"

**Create it manually:**
```bash
createdb edgedecision

# Or with specific user:
createdb -U postgres edgedecision
```

**Then run migrations:**
```bash
cd backend
npm run migrate
```

### "Port already in use"

**Backend (3001):**
```bash
# Find what's using it
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill it or change port in backend/.env:
PORT=3002
```

**Frontend (3000):**
```bash
# Kill process using port 3000
# Or frontend will ask to use 3001 instead
```

### "Cannot find module"

```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Quick Commands Reference

### Database Commands
```bash
# Create database
createdb edgedecision

# Drop database (careful!)
dropdb edgedecision

# Connect to database
psql edgedecision

# Run migrations
cd backend && npm run migrate

# Rollback last migration
cd backend && npm run migrate:rollback
```

### Docker Commands
```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart just backend
docker-compose restart backend

# Reset everything (deletes data!)
docker-compose down -v
docker-compose up --build
```

### Application Commands
```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm run migrate      # Run database migrations
npm start           # Start production server

# Frontend
cd frontend
npm install          # Install dependencies
npm start           # Start development server
npm run build       # Build for production
```

---

## 🎯 Next Steps

Once everything is running:

1. **Register Account** at http://localhost:3000
2. **Connect Shopify**:
   - Go to Integrations tab
   - Enter shop domain: `yourstore.myshopify.com`
   - Paste access token
   - Click Connect

3. **Test AI Chat**:
   - Go to AI Assistant tab
   - Ask: "What's my total revenue?"
   - Claude will analyze your data!

4. **Explore Dashboard**:
   - View metrics
   - Check attribution
   - See real-time updates

---

## 🆘 Still Having Issues?

### For Docker Issues:
See `DOCKER-TROUBLESHOOTING.md`

### For Database Issues:
```bash
# Check PostgreSQL logs
# Mac:
tail -f /usr/local/var/log/postgres.log

# Linux:
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Docker:
docker-compose logs postgres
```

### For Application Errors:
```bash
# Backend logs
cd backend
npm run dev
# Watch for error messages

# Frontend logs
cd frontend
npm start
# Check browser console (F12)
```

---

## 📦 Files You Need

Make sure you have these files:

```
backend/
├── knexfile.js          ← Knex configuration (NEW!)
├── init-db.sh          ← Database setup script (NEW!)
├── package.json        ← Updated with proper scripts
├── .env               ← Your API keys
├── server.js
├── config/
│   └── database.js
├── migrations/
│   └── 001_initial_schema.js
└── routes/
    └── (all route files)
```

If any are missing, download the updated package!

---

## ✅ Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with API keys
- [ ] Database created (`createdb edgedecision`)
- [ ] Migrations run (`npm run migrate`)
- [ ] Backend starts without errors
- [ ] Frontend opens in browser
- [ ] Can register a new account
- [ ] Can connect to Shopify
- [ ] AI chat responds to questions

**All checked? You're ready to go! 🎉**
