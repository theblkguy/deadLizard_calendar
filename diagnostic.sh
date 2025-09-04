#!/bin/bash

# Dead Lizard Calendar Diagnostic Script
# Checks all components to ensure the application is ready for production

echo "🔍 Dead Lizard Calendar Diagnostic Check"
echo "========================================"
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
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Check if running in production directory
if [[ ! -f "package.json" ]]; then
    print_error "Must be run from the root directory of the project"
    exit 1
fi

# 1. Check Node.js and npm
print_status "Checking Node.js and npm..."
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    print_success "Node.js $(node --version) and npm $(npm --version) are installed"
else
    print_error "Node.js or npm not found"
    exit 1
fi

# 2. Check if application is built
print_status "Checking application build..."
if [[ -d "server/dist" && -f "dist/index.html" ]]; then
    print_success "Application is built"
else
    print_warning "Application not built - running build now..."
    npm run build:all
    if [[ $? -eq 0 ]]; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
fi

# 3. Check environment configuration
print_status "Checking environment configuration..."
if [[ -f "server/.env" ]]; then
    print_success "Development environment file exists"
else
    print_warning "Development environment file missing"
fi

if [[ -f ".env.production" ]]; then
    print_success "Production environment file exists"
else
    print_error "Production environment file missing"
fi

# 4. Check required environment variables
print_status "Checking required environment variables in production..."
ENV_ERRORS=0

check_env_var() {
    local var_name=$1
    local env_file=$2
    if grep -q "^${var_name}=" "$env_file" && ! grep -q "^${var_name}=your-" "$env_file" && ! grep -q "^${var_name}=change-this" "$env_file"; then
        print_success "$var_name is configured"
    else
        print_error "$var_name is not properly configured in $env_file"
        ENV_ERRORS=$((ENV_ERRORS + 1))
    fi
}

if [[ -f ".env.production" ]]; then
    check_env_var "MONGODB_URI" ".env.production"
    check_env_var "JWT_SECRET" ".env.production"
    check_env_var "GUEST_ACCESS_CODE" ".env.production"
    check_env_var "USER_ACCESS_CODE" ".env.production"
    check_env_var "ADMIN_ACCESS_CODE" ".env.production"
fi

# 5. Test server startup
print_status "Testing server startup..."
cd server
timeout 10s npm run start > /tmp/server_test.log 2>&1 &
SERVER_PID=$!
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    print_success "Server starts successfully"
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    if curl -s http://localhost:5000/api/health > /dev/null; then
        print_success "Health endpoint responding"
    else
        print_error "Health endpoint not responding"
    fi
    
    # Stop the test server
    kill $SERVER_PID 2>/dev/null
else
    print_error "Server failed to start"
    echo "Server log:"
    cat /tmp/server_test.log
fi

cd ..

# 6. Check PM2 configuration
print_status "Checking PM2 configuration..."
if [[ -f "ecosystem.config.json" ]]; then
    print_success "PM2 configuration file exists"
else
    print_error "PM2 configuration file missing"
fi

# 7. Check SSL configuration
print_status "Checking SSL configuration..."
if [[ -f "setup-ssl.sh" && -f "nginx-deadlizard.conf" ]]; then
    print_success "SSL setup scripts exist"
else
    print_warning "SSL setup scripts missing or incomplete"
fi

# 8. Summary
echo ""
echo "========================================"
echo "🔍 DIAGNOSTIC SUMMARY"
echo "========================================"

if [[ $ENV_ERRORS -gt 0 ]]; then
    print_error "$ENV_ERRORS environment configuration errors found"
    echo ""
    print_warning "To fix environment issues:"
    echo "1. Edit .env.production with your actual values"
    echo "2. Set unique access codes for production"
    echo "3. Configure Google OAuth credentials"
    echo "4. Set up MongoDB connection"
    echo ""
    print_warning "Run: ./setup-production-env.sh to help configure environment"
else
    print_success "All critical checks passed!"
    echo ""
    print_status "Ready for deployment. Next steps:"
    echo "1. Deploy to production server"
    echo "2. Configure Google OAuth credentials"
    echo "3. Set up SSL certificates"
    echo "4. Start with PM2"
fi

echo ""
print_status "For detailed deployment instructions, see:"
print_status "- AWS_DEPLOYMENT_GUIDE.md"
print_status "- DEPLOYMENT.md"
print_status "- SECURITY.md"