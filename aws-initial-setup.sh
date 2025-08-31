#!/bin/bash

# 🚀 Dead Lizard Calendar - AWS Initial Setup Script
# Run this script on your AWS EC2 instance to set up the production environment

set -e  # Exit on any error

echo "🎸 Dead Lizard Calendar - AWS Initial Setup"
echo "==========================================="
echo ""

# Colors for output
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

# Check if running as ubuntu user
if [ "$USER" != "ubuntu" ]; then
    print_error "This script should be run as the ubuntu user"
    exit 1
fi

cd ~

print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Installing required packages..."
sudo apt install -y curl git nginx certbot python3-certbot-nginx ufw

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Clone the repository
print_status "Cloning Dead Lizard Calendar repository..."
if [ -d "deadLizard_calendar" ]; then
    print_warning "Repository already exists, pulling latest changes..."
    cd deadLizard_calendar
    git fetch origin
    git checkout deployment-branch
    git pull origin deployment-branch
else
    git clone https://github.com/theblkguy/deadLizard_calendar.git
    cd deadLizard_calendar
    git checkout deployment-branch
fi

print_status "Installing dependencies..."

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

print_status "Building the application..."
npm run build

print_status "Setting up environment files..."

# Copy environment templates
if [ ! -f "server/.env.production" ]; then
    cp server/.env.production.template server/.env.production
    print_warning "Please edit server/.env.production with your actual values:"
    print_warning "- MONGODB_URI (your MongoDB Atlas connection string)"
    print_warning "- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
    print_warning "- JWT_SECRET (generate a secure random string)"
    echo ""
fi

print_status "Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

print_status "Setting up systemd service..."
sudo cp deadlizard-calendar.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable deadlizard-calendar

print_status "Making scripts executable..."
chmod +x deploy.sh
chmod +x setup-ssl.sh
chmod +x status.sh

print_success "Initial setup complete!"
echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. Edit your environment file:"
echo "   nano server/.env.production"
echo ""
echo "2. Set up SSL certificates:"
echo "   ./setup-ssl.sh"
echo ""
echo "3. Start the application:"
echo "   ./deploy.sh"
echo ""
echo "4. Check status:"
echo "   ./status.sh"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://deadlizardjam.online"
echo ""
print_warning "Remember to update your Google OAuth settings with the production URLs!"
