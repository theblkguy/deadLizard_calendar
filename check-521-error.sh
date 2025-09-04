#!/bin/bash

# Dead Lizard Calendar 521 Error Diagnostic Script
# Comprehensive check for all services that could cause 521 errors

echo "🔍 Dead Lizard Calendar 521 Error Diagnostic"
echo "============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
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

ERRORS=0

# 1. Check if server is running
print_status "Checking if Node.js server is running..."
if pgrep -f "node.*server.js" > /dev/null; then
    print_success "Node.js server process is running"
else
    print_error "Node.js server is not running"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check PM2 status
print_status "Checking PM2 status..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "deadlizard-calendar.*online"; then
        print_success "PM2 process is running"
    else
        print_error "PM2 process is not running or not online"
        pm2 list
        ERRORS=$((ERRORS + 1))
    fi
else
    print_warning "PM2 not installed"
fi

# 3. Check port 5000 is listening
print_status "Checking if port 5000 is listening..."
if netstat -tuln | grep -q ":5000.*LISTEN" || ss -tuln | grep -q ":5000.*LISTEN"; then
    print_success "Port 5000 is listening"
else
    print_error "Port 5000 is not listening"
    ERRORS=$((ERRORS + 1))
fi

# 4. Test local health endpoint
print_status "Testing local health endpoint..."
if curl -s --connect-timeout 5 http://localhost:5000/api/health > /dev/null; then
    print_success "Local health endpoint responds"
    HEALTH_DATA=$(curl -s http://localhost:5000/api/health | jq -r .status 2>/dev/null)
    if [[ "$HEALTH_DATA" == "healthy" ]]; then
        print_success "Health check reports healthy status"
    else
        print_warning "Health check status: $HEALTH_DATA"
    fi
else
    print_error "Local health endpoint not responding"
    ERRORS=$((ERRORS + 1))
fi

# 5. Check nginx status
print_status "Checking nginx status..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
    
    # Check nginx configuration
    if nginx -t 2>/dev/null; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration has errors"
        nginx -t
        ERRORS=$((ERRORS + 1))
    fi
else
    print_error "Nginx is not running"
    ERRORS=$((ERRORS + 1))
fi

# 6. Check SSL certificates
print_status "Checking SSL certificates..."
if [[ -f "/etc/letsencrypt/live/deadlizardjam.online/fullchain.pem" ]]; then
    print_success "SSL certificate file exists"
    
    # Check certificate expiry
    if openssl x509 -noout -checkend 86400 -in /etc/letsencrypt/live/deadlizardjam.online/fullchain.pem 2>/dev/null; then
        print_success "SSL certificate is valid and not expiring soon"
    else
        print_error "SSL certificate is expired or expiring within 24 hours"
        ERRORS=$((ERRORS + 1))
    fi
else
    print_error "SSL certificate not found"
    ERRORS=$((ERRORS + 1))
fi

# 7. Check firewall status
print_status "Checking firewall configuration..."
if command -v ufw &> /dev/null; then
    UFW_STATUS=$(ufw status 2>/dev/null | head -1)
    if [[ "$UFW_STATUS" == *"active"* ]]; then
        print_success "UFW firewall is active"
        if ufw status | grep -q "80/tcp.*ALLOW" && ufw status | grep -q "443/tcp.*ALLOW"; then
            print_success "HTTP and HTTPS ports are allowed"
        else
            print_warning "HTTP/HTTPS ports may not be properly allowed"
        fi
    else
        print_warning "UFW firewall is not active"
    fi
else
    print_warning "UFW not installed - check other firewall"
fi

# 8. Test external connectivity
print_status "Testing external domain resolution..."
if nslookup deadlizardjam.online > /dev/null 2>&1; then
    print_success "Domain resolves correctly"
    IP=$(nslookup deadlizardjam.online | grep -A 1 "Name:" | tail -n1 | awk '{print $2}' | head -1)
    LOCAL_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null)
    if [[ "$IP" == "$LOCAL_IP" ]]; then
        print_success "Domain points to this server"
    else
        print_warning "Domain may not point to this server (DNS: $IP, Server: $LOCAL_IP)"
    fi
else
    print_error "Domain does not resolve"
    ERRORS=$((ERRORS + 1))
fi

# 9. Check MongoDB connection
print_status "Checking MongoDB connection..."
if pgrep mongod > /dev/null; then
    print_success "MongoDB process is running"
else
    print_warning "MongoDB process not found (may be external/Atlas)"
fi

# 10. Check logs for errors
print_status "Checking recent error logs..."
if [[ -f "/var/log/nginx/error.log" ]]; then
    RECENT_ERRORS=$(tail -20 /var/log/nginx/error.log | grep -i error | wc -l)
    if [[ $RECENT_ERRORS -eq 0 ]]; then
        print_success "No recent nginx errors"
    else
        print_warning "$RECENT_ERRORS recent nginx errors found"
        tail -5 /var/log/nginx/error.log | grep -i error
    fi
fi

# Summary and recommendations
echo ""
echo "============================================="
echo "🔍 DIAGNOSTIC SUMMARY"
echo "============================================="
echo ""

if [[ $ERRORS -eq 0 ]]; then
    print_success "All critical checks passed! 521 error may be temporary or external."
    echo ""
    print_status "If 521 error persists, check:"
    print_status "1. Cloudflare settings (if using Cloudflare)"
    print_status "2. Server load and performance"
    print_status "3. Network connectivity from external sources"
    print_status "4. Check with your hosting provider"
else
    print_error "$ERRORS critical issues found that could cause 521 errors"
    echo ""
    print_status "To fix 521 errors, address the failed checks above:"
    print_status "1. Ensure the application is running (PM2 or systemd)"
    print_status "2. Fix nginx configuration and restart nginx"
    print_status "3. Renew SSL certificates if expired"
    print_status "4. Check firewall allows HTTP/HTTPS traffic"
    print_status "5. Verify DNS points to correct server"
fi

echo ""
print_status "Quick fix commands:"
print_status "- pm2 restart deadlizard-calendar    # Restart application"
print_status "- sudo systemctl restart nginx      # Restart nginx"
print_status "- sudo certbot renew                # Renew SSL certificates"
print_status "- sudo ufw allow 80 && sudo ufw allow 443  # Allow HTTP/HTTPS"
echo ""
print_status "For detailed logs:"
print_status "- pm2 logs deadlizard-calendar      # Application logs"
print_status "- sudo tail -f /var/log/nginx/error.log  # Nginx error logs"
print_status "- sudo journalctl -u nginx -f       # Nginx service logs"