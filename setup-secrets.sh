#!/bin/bash

# GitHub Secrets Setup Helper for Dead Lizard Calendar
# This script helps you prepare the values needed for GitHub Actions secrets

echo "🔐 GitHub Secrets Setup Helper"
echo "=============================="

echo ""
echo "You need to add these secrets to your GitHub repository:"
echo "Go to: https://github.com/theblkguy/deadLizard_calendar/settings/secrets/actions"
echo ""

echo "1. AWS_ACCESS_KEY_ID"
echo "   Value: Your AWS IAM user access key ID"
echo "   How to get: AWS Console → IAM → Users → Your User → Security credentials"
echo ""

echo "2. AWS_SECRET_ACCESS_KEY" 
echo "   Value: Your AWS IAM user secret access key"
echo "   How to get: AWS Console → IAM → Users → Your User → Security credentials"
echo ""

echo "3. AWS_SSH_PRIVATE_KEY"
echo "   Value: The content of your .pem file (the entire file content)"
echo "   How to get: The .pem file you downloaded when creating your EC2 instance"
if [ -f ~/.ssh/*.pem ]; then
    echo "   Found .pem files in ~/.ssh/:"
    ls -la ~/.ssh/*.pem
    echo "   To copy content: cat ~/.ssh/your-key.pem"
fi
echo ""

echo "4. AWS_HOST"
echo "   Value: Your AWS instance public IP address or domain name"
echo "   How to get: AWS Console → EC2 → Instances → Your Instance → Public IPv4 address"
echo ""

echo "5. AWS_USER"
echo "   Value: SSH username for your instance (usually 'ubuntu' for Ubuntu instances)"
echo "   Default: ubuntu"
echo ""

echo "Environment Variables (in Variables tab):"
echo "6. DEPLOYMENT_URL"
echo "   Value: http://YOUR_AWS_IP:5000 (replace YOUR_AWS_IP with actual IP)"
echo ""

echo "🚨 IMPORTANT SECURITY NOTES:"
echo "- Never share these secrets publicly"
echo "- Use IAM user with minimal required permissions"
echo "- Regularly rotate your access keys"
echo "- Use separate IAM users for different environments"
echo ""

echo "✅ Required IAM Permissions for deployment user:"
echo "- EC2: DescribeInstances"
echo "- Optional: S3 access if you want to store backups"
echo ""

echo "🎯 Next Steps:"
echo "1. Add all secrets to GitHub repository"
echo "2. Update AWS_HOST in ecosystem.config.json with your actual IP"
echo "3. Set up your AWS instance with the deployment guide"
echo "4. Push to deployment-branch to trigger first deployment"
echo ""

echo "🦎 Ready to deploy your Dead Lizard Calendar!"
