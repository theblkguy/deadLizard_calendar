# 🚀 Dead Lizard Calendar AWS Deployment Guide

## Step 1: SSH into your AWS instance
```bash
# From your Windows machine, use your SSH key:
ssh -i "C:\Users\Bradley\Downloads\baj0k0.pem" ubuntu@deadlizardjam.online
```

## Step 2: Run the initial setup
```bash
# Download and run the setup script
curl -sSL https://raw.githubusercontent.com/theblkguy/deadLizard_calendar/deployment-branch/aws-initial-setup.sh | bash
```

Or manually:
```bash
# Clone the repository
git clone https://github.com/theblkguy/deadLizard_calendar.git
cd deadLizard_calendar
git checkout deployment-branch

# Run the setup script
chmod +x aws-initial-setup.sh
./aws-initial-setup.sh
```

## Step 3: Configure Environment Variables
```bash
cd deadLizard_calendar
nano server/.env.production
```

Add your actual values:
```env
# MongoDB Atlas connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/deadlizard_calendar

# Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secure-jwt-secret-key

# Server configuration
NODE_ENV=production
PORT=5000

# Domain configuration
FRONTEND_URL=https://deadlizardjam.online
BACKEND_URL=https://deadlizardjam.online/api
```

## Step 4: Set up SSL and Deploy
```bash
# Set up SSL certificates with Let's Encrypt
./setup-ssl.sh

# Deploy the application
./deploy.sh

# Check status
./status.sh
```

## Step 5: Update Google OAuth Settings
Go to [Google Cloud Console](https://console.cloud.google.com):
- Add authorized redirect URIs:
  - `https://deadlizardjam.online/auth/google/callback`
  - `https://www.deadlizardjam.online/auth/google/callback`

## Your site will be live at:
🌐 **https://deadlizardjam.online**

## Useful Commands:
```bash
# Check application status
./status.sh

# View logs
pm2 logs deadlizard-calendar

# Restart application
pm2 restart deadlizard-calendar

# Update SSL certificates (automatic renewal)
sudo certbot renew --dry-run
```

## GitHub Actions will handle automatic deployments every 30 minutes! 🎉
