#!/bin/bash

echo "🔍 EdgeDecision Setup Verification"
echo "===================================="
echo ""

# Check Docker
echo "Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker installed: $(docker --version)"
else
    echo "❌ Docker not found. Please install Docker Desktop"
    echo "   Download from: https://www.docker.com/products/docker-desktop"
fi

echo ""

# Check docker-compose
echo "Checking docker-compose..."
if command -v docker-compose &> /dev/null; then
    echo "✅ docker-compose installed: $(docker-compose --version)"
else
    echo "❌ docker-compose not found"
fi

echo ""

# Check .env file
echo "Checking environment configuration..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    
    # Check for required keys
    if grep -q "ANTHROPIC_API_KEY=sk-ant-" .env; then
        echo "✅ Anthropic API key configured"
    else
        echo "⚠️  Anthropic API key not set (required for AI chat)"
    fi
    
    if grep -q "SHOPIFY_API_KEY=" .env && ! grep -q "SHOPIFY_API_KEY=$" .env; then
        echo "✅ Shopify API key configured"
    else
        echo "⚠️  Shopify credentials not set (required for data sync)"
    fi
else
    echo "❌ .env file not found"
    echo "   Run: cp .env.template .env"
    echo "   Then edit .env with your API keys"
fi

echo ""

# Check if Docker is running
echo "Checking if Docker daemon is running..."
if docker info &> /dev/null; then
    echo "✅ Docker daemon is running"
else
    echo "❌ Docker daemon not running. Please start Docker Desktop"
fi

echo ""

# Check if services are running
echo "Checking running services..."
if docker ps | grep -q "edgedecision"; then
    echo "✅ EdgeDecision services are running:"
    docker ps --filter "name=edgedecision" --format "   - {{.Names}} ({{.Status}})"
else
    echo "ℹ️  Services not running yet"
    echo "   Start with: docker-compose up"
fi

echo ""
echo "===================================="
echo "Setup Verification Complete!"
echo ""

# Final recommendations
if [ ! -f .env ]; then
    echo "📝 Next Steps:"
    echo "1. Create .env file: cp .env.template .env"
    echo "2. Edit .env and add your API keys"
    echo "3. Run: docker-compose up --build"
    echo "4. Open http://localhost:3000"
else
    echo "📝 Next Steps:"
    echo "1. Run: docker-compose up --build"
    echo "2. Wait for services to start (~2 minutes)"
    echo "3. Open http://localhost:3000"
    echo "4. Register a new account"
    echo "5. Connect your Shopify store"
fi

echo ""
