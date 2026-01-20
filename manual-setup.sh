#!/bin/bash

echo "🚀 EdgeDecision Manual Setup (No Docker)"
echo "=========================================="
echo ""

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
    
    # Check if version is 18 or higher
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        echo "⚠️  Warning: Node.js 18+ recommended. You have v$MAJOR_VERSION"
        echo "   Download from: https://nodejs.org/"
    fi
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo ""

# Check PostgreSQL
echo "Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL installed"
else
    echo "⚠️  PostgreSQL not found"
    echo "   Mac: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql"
    echo "   Windows: Download from postgresql.org"
fi

echo ""

# Check if PostgreSQL is running
if pg_isready &> /dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "⚠️  PostgreSQL not running. Start it with:"
    echo "   Mac: brew services start postgresql"
    echo "   Ubuntu: sudo systemctl start postgresql"
    echo "   Windows: Check Services app"
fi

echo ""

# Create database
echo "Creating database..."
if createdb edgedecision 2>/dev/null; then
    echo "✅ Database 'edgedecision' created"
else
    echo "ℹ️  Database 'edgedecision' already exists (this is fine)"
fi

echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
if [ -f "package.json" ]; then
    npm install
    echo "✅ Backend dependencies installed"
else
    echo "❌ backend/package.json not found. Are you in the right directory?"
    exit 1
fi

# Create .env if doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cat > .env << 'EOF'
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edgedecision
JWT_SECRET=dev-secret-change-in-production
CORS_ORIGIN=http://localhost:3000

# REQUIRED: Add your API keys here
ANTHROPIC_API_KEY=
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=

# OPTIONAL: Add when ready
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
EOF
    echo "✅ Created backend/.env (PLEASE EDIT AND ADD YOUR API KEYS)"
fi

# Run migrations
echo "Running database migrations..."
npm run migrate
echo "✅ Migrations complete"

cd ..

echo ""

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
if [ -f "package.json" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "❌ frontend/package.json not found"
    exit 1
fi

# Create frontend .env
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001
REACT_APP_STRIPE_PK=pk_test_placeholder
EOF
    echo "✅ Created frontend/.env"
fi

cd ..

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo ""
echo "📝 Before you start:"
echo "1. Edit backend/.env and add your API keys"
echo "2. Make sure PostgreSQL is running"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Then open: http://localhost:3000"
echo ""
