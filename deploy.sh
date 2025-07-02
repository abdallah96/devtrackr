#!/bin/bash

echo "🚀 Deploying G-Tracker to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Please create one with your DATABASE_URL"
    echo "Example:"
    echo "DATABASE_URL=\"postgresql://user:password@host:port/database\""
    echo "NODE_ENV=production"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run vercel-build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment complete!"
echo "📝 Don't forget to:"
echo "   1. Set DATABASE_URL in Vercel dashboard"
echo "   2. Run database migrations: npx prisma db push"
echo "   3. Test your API endpoints" 