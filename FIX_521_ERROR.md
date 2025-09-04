# 🚨 Fixing 521 Web Server Down Error

This guide helps resolve the 521 error preventing access to deadlizardjam.online and Google OAuth login.

## ✅ Quick Fix (Most Common Solution)

**Step 1: Run the diagnostic script**
```bash
./check-521-error.sh
```

**Step 2: If PM2 is not running**
```bash
# Stop any existing processes
pm2 stop deadlizard-calendar
pm2 delete deadlizard-calendar

# Deploy fresh
./deploy-production.sh
```

**Step 3: If nginx is not running**
```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

## 🔍 Complete Diagnostic Process

### 1. Check Server Status
```bash
# Run comprehensive check
./diagnostic.sh

# Check specific 521 error causes
./check-521-error.sh
```

### 2. Verify Application is Running
```bash
# Check PM2 status
pm2 status

# Check if port 5000 is listening
sudo netstat -tulpn | grep :5000

# Test health endpoint
curl http://localhost:5000/api/health
```

### 3. Check nginx Configuration
```bash
# Test nginx configuration
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# Restart nginx if needed
sudo systemctl restart nginx
```

### 4. Verify SSL Certificates
```bash
# Check certificate status
sudo certbot certificates

# Check if certificate is valid
openssl x509 -noout -dates -in /etc/letsencrypt/live/deadlizardjam.online/fullchain.pem

# Renew if needed
sudo certbot renew
```

## 🛠️ Fix Common Issues

### Issue 1: Application Not Running
```bash
# Deploy the application
./deploy-production.sh

# Or manually start with PM2
pm2 start ecosystem.config.json --env production
pm2 save
```

### Issue 2: Wrong Environment Configuration
```bash
# Fix environment variables
cp .env.production server/.env.production

# Edit with correct values
nano server/.env.production

# Restart application
pm2 restart deadlizard-calendar
```

### Issue 3: nginx Not Configured
```bash
# Set up SSL and nginx
./setup-ssl.sh

# Or copy nginx configuration
sudo cp nginx-deadlizard.conf /etc/nginx/sites-available/deadlizardjam.online
sudo ln -sf /etc/nginx/sites-available/deadlizardjam.online /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Issue 4: Firewall Blocking Connections
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

### Issue 5: DNS Not Pointing to Server
```bash
# Check DNS resolution
nslookup deadlizardjam.online

# Check server IP
curl ifconfig.me

# If different, update DNS records with your domain provider
```

## 🔧 Google OAuth Configuration

**After fixing 521 error, configure Google OAuth:**

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**

2. **Add authorized redirect URIs:**
   - `https://deadlizardjam.online/api/auth/google/callback`
   - `https://www.deadlizardjam.online/api/auth/google/callback`

3. **Update environment variables:**
```bash
nano server/.env.production
# Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

# Restart application
pm2 restart deadlizard-calendar
```

## 📊 Monitoring Commands

```bash
# Check all services status
./status.sh

# Monitor PM2 logs
pm2 logs deadlizard-calendar

# Monitor nginx logs
sudo tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
```

## 🚀 Complete Deployment Process

For fresh deployment or complete fix:

```bash
# 1. Clone/update repository
git pull origin main

# 2. Install dependencies
npm run install-all

# 3. Run diagnostic
./diagnostic.sh

# 4. Deploy to production
./deploy-production.sh

# 5. Set up SSL (if needed)
./setup-ssl.sh

# 6. Check 521 errors are resolved
./check-521-error.sh
```

## ❌ If Problems Persist

1. **Check hosting provider status**
2. **Verify server resources (CPU, memory, disk)**
3. **Check for DDoS protection settings**
4. **Contact hosting support**

## 📋 Required Environment Variables

Make sure these are set in `.env.production`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/deadlizard_calendar_prod
JWT_SECRET=your-secure-jwt-secret
GUEST_ACCESS_CODE=your-guest-code
USER_ACCESS_CODE=your-user-code
ADMIN_ACCESS_CODE=your-admin-code
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://deadlizardjam.online/api/auth/google/callback
FRONTEND_URL=https://deadlizardjam.online
```

## 🎯 Success Indicators

Your site is working when:
- ✅ `./check-521-error.sh` shows all green checks
- ✅ `https://deadlizardjam.online` loads without 521 error
- ✅ `https://deadlizardjam.online/api/health` returns healthy status
- ✅ Google OAuth login works correctly
- ✅ Calendar is accessible to users

---

**Need help?** Check the detailed guides:
- [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [SECURITY.md](./SECURITY.md)