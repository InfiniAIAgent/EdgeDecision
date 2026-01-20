#!/bin/bash

echo "🗄️  Database Initialization Script"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your database configuration"
    echo "Example:"
    echo "  DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/edgedecision"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Parse DATABASE_URL if it exists
if [ ! -z "$DATABASE_URL" ]; then
    echo "✅ Using DATABASE_URL from .env"
    
    # Extract database name from URL
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    # Extract host, port, user from URL
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\(.*\):.*/\1/p')
    
    echo "  Database: $DB_NAME"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
else
    echo "⚠️  DATABASE_URL not found in .env"
    DB_NAME=${DB_NAME:-edgedecision}
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_USER=${DB_USER:-postgres}
    echo "  Using defaults: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
fi

echo ""

# Check if PostgreSQL is accessible
echo "Checking PostgreSQL connection..."
if command -v pg_isready &> /dev/null; then
    if pg_isready -h $DB_HOST -p $DB_PORT &> /dev/null; then
        echo "✅ PostgreSQL is running"
    else
        echo "❌ Cannot connect to PostgreSQL at $DB_HOST:$DB_PORT"
        echo "Please make sure PostgreSQL is running"
        exit 1
    fi
else
    echo "⚠️  pg_isready not found, skipping connection check"
fi

echo ""

# Check if database exists, create if not
echo "Checking if database exists..."
if command -v psql &> /dev/null; then
    # Try to connect to the database
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw $DB_NAME; then
        echo "✅ Database '$DB_NAME' exists"
    else
        echo "📦 Creating database '$DB_NAME'..."
        createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✅ Database created successfully"
        else
            echo "⚠️  Could not create database automatically"
            echo "Please create it manually: createdb $DB_NAME"
        fi
    fi
else
    echo "⚠️  psql command not found, skipping database creation"
    echo "If database doesn't exist, create it manually: createdb $DB_NAME"
fi

echo ""

# Run migrations
echo "Running database migrations..."
npm run migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Database initialization complete!"
    echo "=========================================="
    echo ""
    echo "You can now start the server with:"
    echo "  npm run dev"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "❌ Migration failed!"
    echo "=========================================="
    echo ""
    echo "Please check the error above and fix any issues"
    echo ""
    exit 1
fi
