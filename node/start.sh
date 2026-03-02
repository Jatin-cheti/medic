#!/bin/sh
# Start script for Railway deployment
# Runs migrations, seeds data, then starts the app

set -e  # Exit on error

echo "🚀 Starting Medic Backend..."
echo ""

# Run migrations
echo "📋 Running database migrations..."
node run-migrations.js
if [ $? -ne 0 ]; then
  echo "❌ Migrations failed!"
  exit 1
fi
echo "✅ Migrations completed"
echo ""

# Seed data
echo "📊 Seeding reference data..."
node seed-data.js
if [ $? -ne 0 ]; then
  echo "⚠️  Seed data failed - continuing anyway"
fi
echo "✅ Seed data completed"
echo ""

# Start the app
echo "🎯 Starting application..."
exec node dist/index.js
