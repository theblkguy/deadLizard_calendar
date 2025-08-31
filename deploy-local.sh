#!/bin/bash

# Pull-based deployment script
# This script runs ON your EC2 instance to pull and deploy the latest code

echo "🚀 Starting Dead Lizard Calendar deployment..."

# Configuration
REPO_URL="https://github.com/theblkguy/deadLizard_calendar.git"
BRANCH="deployment-branch"
APP_DIR="/opt/deadlizard-calendar"
SERVICE_NAME="deadlizard-calendar"

# Create app directory if it doesn't exist
sudo mkdir -p $APP_DIR
cd $APP_DIR

# If it's first time, clone the repo
if [ ! -d ".git" ]; then
    echo "📦 Initial clone of repository..."
    sudo git clone $REPO_URL .
    sudo chown -R $USER:$USER .
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/$BRANCH

# Install dependencies
echo "📋 Installing dependencies..."
npm ci

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Build server  
echo "🏗️ Building server..."
cd server && npm ci && npm run build && cd ..

# Stop existing service
echo "⏹️ Stopping existing service..."
sudo systemctl stop $SERVICE_NAME 2>/dev/null || true
pkill -f "node.*server" 2>/dev/null || true

# Start the application
echo "▶️ Starting application..."
cd server
pm2 stop deadlizard-calendar 2>/dev/null || true
pm2 start dist/server.js --name deadlizard-calendar
pm2 save

# Health check
echo "🏥 Performing health check..."
sleep 5
if curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo "✅ Deployment successful!"
    echo "🔗 Application is running at http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000"
else
    echo "❌ Health check failed!"
    pm2 logs deadlizard-calendar --lines 20
    exit 1
fi

echo "🎵 Dead Lizard Calendar deployment completed!"
