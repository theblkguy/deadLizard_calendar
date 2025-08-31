#!/bin/bash

# Dead Lizard Calendar Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🦎 Starting Dead Lizard Calendar Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Install dependencies
print_status "Installing dependencies..."
npm run install-all

# Type checking
print_status "Running type check..."
npm run type-check

# Build the application
print_status "Building application..."
npm run build:all

# Check if production environment file exists
if [ ! -f "server/.env.production" ]; then
    print_warning "Production environment file not found. Creating from template..."
    cp server/.env.production.template server/.env.production 2>/dev/null || true
fi

# Start the application
print_status "Starting application in production mode..."
print_warning "Make sure to:"
print_warning "1. Update environment variables in server/.env.production"
print_warning "2. Configure your reverse proxy (nginx/apache)"
print_warning "3. Set up process manager (PM2)"
print_warning "4. Configure firewall rules"

print_success "Build completed successfully!"
print_status "To start the server: cd server && npm run start"
print_status "To use PM2: pm2 start server/dist/server.js --name 'deadlizard-calendar'"

echo "🎵 Dead Lizard Calendar is ready for deployment!"
