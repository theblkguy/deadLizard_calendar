# 🚀 Dead Lizard Calendar Deployment Guide

## Prerequisites

### AWS Instance Setup
- **Instance Type**: t3.small or larger (2 vCPU, 2GB RAM minimum)
- **OS**: Ubuntu 22.04 LTS
- **Security Groups**: 
  - SSH (22) from your IP
  - HTTP (80) from anywhere
  - HTTPS (443) from anywhere
  - Custom TCP (5000) from anywhere (for API)

### Required Software on AWS Instance
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Install PM2 globally
sudo npm install -g pm2

# Install nginx (optional, for reverse proxy)
sudo apt install -y nginx

# Start services
sudo systemctl start mongod
sudo systemctl enable mongod
```

## GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

### Required Secrets
- `AWS_ACCESS_KEY_ID`: Your AWS IAM access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS IAM secret key
- `AWS_SSH_PRIVATE_KEY`: Your AWS instance SSH private key (content of .pem file)
- `AWS_HOST`: Your AWS instance public IP or domain
- `AWS_USER`: SSH username (usually `ubuntu` for Ubuntu instances)

### Environment Variables
- `DEPLOYMENT_URL`: Your application URL (e.g., http://your-aws-ip:5000)

## GitHub Actions Workflow Features

### ⏰ Automatic Deployment Every 30 Minutes
- Checks for new commits in the last 30 minutes
- Only deploys if changes are detected
- Runs 24/7 to keep your app updated

### 🔧 Manual Deployment Trigger
- Go to Actions tab → "Deploy Dead Lizard Calendar" → "Run workflow"
- Choose environment (production/staging)
- Option to force deployment even without changes

### 📊 Deployment Process
1. **Check Changes**: Detects if deployment is needed
2. **Build & Test**: Compiles TypeScript, runs type checks
3. **Package**: Creates deployment archive
4. **Deploy**: Uploads and installs on AWS instance
5. **Health Check**: Verifies application is running
6. **Cleanup**: Removes old artifacts and backups

## Manual Deployment Steps

### 1. Initial Setup on AWS Instance
```bash
# Create application directory
sudo mkdir -p /opt/deadlizard-calendar
sudo chown $USER:$USER /opt/deadlizard-calendar

# Create service user (optional)
sudo useradd -r -s /bin/false deadlizard

# Install systemd service
sudo cp deadlizard-calendar.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable deadlizard-calendar
```

### 2. Environment Configuration
```bash
# Copy environment template
cp server/.env.production.template server/.env.production

# Edit production environment
nano server/.env.production
```

**Required Updates in `.env.production`:**
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Generate a strong secret key
- `SESSION_SECRET`: Generate a strong session secret
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: Your production callback URL
- `FRONTEND_URL`: Your production domain

### 3. Deploy Application
```bash
# Run deployment script
./deploy.sh

# Or deploy manually
npm run build:all
cd server
npm ci --only=production
sudo systemctl start deadlizard-calendar
```

### 4. Setup Reverse Proxy (Optional)
```nginx
# /etc/nginx/sites-available/deadlizard-calendar
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/deadlizard-calendar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Monitoring & Maintenance

### Health Checks
```bash
# Check application health
curl http://localhost:5000/api/health

# Check service status
sudo systemctl status deadlizard-calendar

# View logs
sudo journalctl -u deadlizard-calendar -f
```

### Database Backup
```bash
# Create backup script
cat > /opt/deadlizard-calendar/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/deadlizard-calendar-backups/db"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
mongodump --db deadlizard_calendar_prod --out $BACKUP_DIR/backup_$DATE
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
EOF

chmod +x /opt/deadlizard-calendar/backup.sh

# Add to crontab for daily backups
echo "0 2 * * * /opt/deadlizard-calendar/backup.sh" | crontab -
```

### Performance Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View real-time monitoring
pm2 monit
```

## Security Considerations

1. **Firewall Configuration**
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000  # Only if not using reverse proxy
```

2. **SSL Certificate** (Recommended)
```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

3. **Environment Variables**
- Never commit `.env.production` to version control
- Use strong, unique secrets for JWT and session
- Rotate secrets periodically

## Troubleshooting

### Common Issues
1. **Port 5000 already in use**: Check for other Node.js processes
2. **MongoDB connection failed**: Verify MongoDB is running and connection string
3. **Health check failed**: Check application logs and environment variables
4. **Permission denied**: Ensure correct file permissions and ownership

### Debug Commands
```bash
# Check running processes
ps aux | grep node

# Check MongoDB status
sudo systemctl status mongod

# View application logs
sudo journalctl -u deadlizard-calendar --since "1 hour ago"

# Test API endpoints
curl -v http://localhost:5000/api/health
```

## 🎵 Your Dead Lizard Calendar is now ready for production! 🦎
