#!/bin/bash

# Dead Lizard Calendar Deployment Status Check
# Usage: ./status.sh

echo "🦎 Dead Lizard Calendar Deployment Status Check"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_service() {
    local service=$1
    local name=$2
    
    if systemctl is-active --quiet "$service"; then
        echo -e "${GREEN}✅ $name is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not running${NC}"
        return 1
    fi
}

check_port() {
    local port=$1
    local name=$2
    
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${GREEN}✅ $name (port $port) is listening${NC}"
        return 0
    else
        echo -e "${RED}❌ $name (port $port) is not listening${NC}"
        return 1
    fi
}

check_url() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is responding${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is not responding${NC}"
        return 1
    fi
}

echo -e "${BLUE}System Services:${NC}"
check_service "mongod" "MongoDB"
check_service "deadlizard-calendar" "Dead Lizard Calendar Service" || {
    echo -e "${YELLOW}ℹ️  Checking PM2 instead...${NC}"
    if pm2 jlist 2>/dev/null | grep -q "deadlizard-calendar"; then
        echo -e "${GREEN}✅ Dead Lizard Calendar (PM2) is running${NC}"
    else
        echo -e "${RED}❌ Dead Lizard Calendar is not running (neither systemd nor PM2)${NC}"
    fi
}

echo -e "\n${BLUE}Network Ports:${NC}"
check_port "27017" "MongoDB"
check_port "5000" "Application API"

echo -e "\n${BLUE}Application Health:${NC}"
check_url "http://localhost:5000/api/health" "Health Check Endpoint"

echo -e "\n${BLUE}File System:${NC}"
if [ -f "/opt/deadlizard-calendar/server/dist/server.js" ]; then
    echo -e "${GREEN}✅ Application files exist${NC}"
else
    echo -e "${RED}❌ Application files not found in /opt/deadlizard-calendar${NC}"
fi

if [ -f "/opt/deadlizard-calendar/server/.env.production" ]; then
    echo -e "${GREEN}✅ Production environment file exists${NC}"
else
    echo -e "${YELLOW}⚠️  Production environment file not found${NC}"
fi

echo -e "\n${BLUE}Process Information:${NC}"
echo "Node.js processes:"
ps aux | grep -E "(node|pm2)" | grep -v grep | head -5

echo -e "\n${BLUE}Recent Logs:${NC}"
if systemctl is-active --quiet deadlizard-calendar; then
    echo "Last 5 systemd logs:"
    journalctl -u deadlizard-calendar --no-pager -n 5
elif pm2 jlist 2>/dev/null | grep -q "deadlizard-calendar"; then
    echo "PM2 status:"
    pm2 status deadlizard-calendar 2>/dev/null || echo "PM2 not available"
fi

echo -e "\n${BLUE}Storage Information:${NC}"
echo "Disk usage for application directory:"
du -sh /opt/deadlizard-calendar 2>/dev/null || echo "Application directory not found"

echo -e "\n${BLUE}GitHub Actions Secrets Check:${NC}"
echo -e "${YELLOW}⚠️  Verify these secrets are set in your GitHub repository:${NC}"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY" 
echo "  - AWS_SSH_PRIVATE_KEY"
echo "  - AWS_HOST"
echo "  - AWS_USER"

echo -e "\n🎵 Status check complete!"
