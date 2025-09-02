#!/bin/bash

# Dead Lizard Calendar - Production Environment Setup Script
# This script sets up the production environment file safely

echo "🔧 Setting up production environment..."

# Create the production environment file
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
GUEST_ACCESS_CODE=your-guest-access-code
USER_ACCESS_CODE=your-user-access-code
ADMIN_ACCESS_CODE=your-admin-access-code
MONGODB_URI=your-mongodb-connection-string-here
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=https://deadlizardjam.online/api/auth/google/callback
FRONTEND_URL=https://deadlizardjam.online
EOF

echo "✅ Environment file created successfully"

# Verify the access codes
echo "🔍 Verifying access codes:"
grep "_ACCESS_CODE" .env

# Restart PM2 if it's running
if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting PM2..."
    pm2 restart deadlizard-calendar --update-env
    echo "✅ PM2 restarted with new environment"
else
    echo "⚠️  PM2 not found. You'll need to restart your application manually."
fi

echo "🎉 Production environment setup complete!"
