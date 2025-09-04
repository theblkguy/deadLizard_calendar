#!/bin/bash

# Dead Lizard Calendar Production Deployment Script
# Fixes 521 errors by ensuring proper server configuration and startup

echo "🦎 Dead Lizard Calendar Production Deployment"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Set error handling
set -e

# Check if running as correct user
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# 1. Stop any existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop deadlizard-calendar 2>/dev/null || true
pm2 delete deadlizard-calendar 2>/dev/null || true

# 2. Build the application
print_status "Building application..."
npm run build:all

# 3. Copy production environment
print_status "Setting up production environment..."
cp .env.production server/.env.production

# 4. Install production dependencies
print_status "Installing production dependencies..."
cd server
npm ci --only=production
cd ..

# 5. Test server startup
print_status "Testing server startup..."
cd server
timeout 10s NODE_ENV=production npm run start > /tmp/production_test.log 2>&1 &
SERVER_PID=$!
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Server starts successfully in production mode"
    
    # Test health endpoint
    if curl -s http://localhost:5000/api/health > /dev/null; then
        print_success "Health endpoint responding"
    else
        print_warning "Health endpoint not responding immediately"
    fi
    
    # Stop the test server
    kill $SERVER_PID 2>/dev/null
else
    print_error "Server failed to start in production mode"
    echo "Error log:"
    cat /tmp/production_test.log
    exit 1
fi

cd ..

# 6. Start with PM2
print_status "Starting with PM2..."
pm2 start ecosystem.config.json --env production

# 7. Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# 8. Set up PM2 to start on boot
print_status "Setting up PM2 startup script..."
pm2 startup || print_warning "PM2 startup setup requires manual configuration"

# 9. Check final status
print_status "Checking deployment status..."
sleep 3

if pm2 list | grep -q "deadlizard-calendar.*online"; then
    print_success "Application is running with PM2"
else
    print_error "Application failed to start with PM2"
    pm2 logs deadlizard-calendar --lines 20
    exit 1
fi

# 10. Test health endpoint
print_status "Testing production health endpoint..."
if curl -s http://localhost:5000/api/health | jq . > /dev/null; then
    print_success "Production health endpoint is working"
else
    print_warning "Health endpoint test failed - check logs"
fi

echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
print_status "Next steps to fix 521 error:"
print_status "1. Ensure nginx is configured and running"
print_status "2. Check SSL certificates are valid"
print_status "3. Verify domain DNS points to this server"
print_status "4. Test external connectivity"
echo ""
print_status "Useful commands:"
print_status "- pm2 status           # Check app status"
print_status "- pm2 logs deadlizard-calendar  # View logs"
print_status "- pm2 restart deadlizard-calendar  # Restart app"
print_status "- ./status.sh          # Check all services"
echo ""
print_warning "Remember to:"
print_warning "1. Configure Google OAuth credentials in .env.production"
print_warning "2. Set up MongoDB if using external database"
print_warning "3. Configure SSL certificates with ./setup-ssl.sh"