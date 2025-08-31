#!/bin/bash

# SSL Setup Script for Dead Lizard Calendar
# Sets up Let's Encrypt SSL certificate for deadlizardjam.online

echo "🔐 Setting up SSL for deadlizardjam.online"
echo "=========================================="

# Update system
sudo apt update

# Install Certbot and Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Install Nginx if not already installed
sudo apt install -y nginx

# Create Nginx configuration for your domain
sudo tee /etc/nginx/sites-available/deadlizardjam.online << 'EOF'
server {
    listen 80;
    server_name deadlizardjam.online www.deadlizardjam.online;

    # Serve static files
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
        
        # Security headers
        proxy_set_header X-Frame-Options DENY;
        proxy_set_header X-Content-Type-Options nosniff;
        proxy_set_header X-XSS-Protection "1; mode=block";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/deadlizardjam.online /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Get SSL certificate
echo "🔐 Obtaining SSL certificate..."
sudo certbot --nginx -d deadlizardjam.online -d www.deadlizardjam.online --non-interactive --agree-tos --email your-email@example.com

# Set up automatic renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "✅ SSL setup complete!"
echo "🌐 Your site should now be available at:"
echo "   https://deadlizardjam.online"
echo "   https://www.deadlizardjam.online"
EOF
