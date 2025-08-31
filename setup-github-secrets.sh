#!/bin/bash

# GitHub Secrets Setup Guide for Dead Lizard Calendar
# This script helps you identify what secrets need to be configured

echo "🔐 GitHub Secrets Setup Guide"
echo "=============================="
echo ""
echo "You need to configure the following secrets in your GitHub repository:"
echo "Repository URL: https://github.com/theblkguy/deadLizard_calendar/settings/secrets/actions"
echo ""

echo "📋 Required Secrets:"
echo "-------------------"
echo ""

echo "1. AWS_ACCESS_KEY_ID"
echo "   - Description: Your AWS IAM user's access key ID"
echo "   - Example: AKIAIOSFODNN7EXAMPLE"
echo "   - How to get: AWS Console > IAM > Users > Your User > Security Credentials > Access Keys"
echo ""

echo "2. AWS_SECRET_ACCESS_KEY"
echo "   - Description: Your AWS IAM user's secret access key"
echo "   - Example: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
echo "   - How to get: AWS Console > IAM > Users > Your User > Security Credentials > Access Keys"
echo "   - ⚠️  IMPORTANT: This is only shown once when you create the access key!"
echo ""

echo "3. AWS_SSH_PRIVATE_KEY"
echo "   - Description: The complete content of your EC2 key pair's private key file"
echo "   - Example: The entire content of your .pem file (starts with -----BEGIN RSA PRIVATE KEY-----)"
echo "   - How to get: Use the .pem file you downloaded when creating your EC2 instance"
echo "   - Format: Include the entire file content including headers and footers"
echo ""

echo "4. AWS_HOST"
echo "   - Description: Your EC2 instance's public IP address or hostname"
echo "   - Example: 3.85.123.45 or ec2-3-85-123-45.compute-1.amazonaws.com"
echo "   - How to get: AWS Console > EC2 > Instances > Your Instance > Public IPv4 address"
echo ""

echo "5. AWS_USER"
echo "   - Description: SSH username for your EC2 instance"
echo "   - Example: ubuntu (for Ubuntu instances), ec2-user (for Amazon Linux)"
echo "   - Default: ubuntu (if you're using Ubuntu)"
echo ""

echo "🚨 IAM Permissions Required:"
echo "---------------------------"
echo "Your AWS IAM user needs the following permissions:"
echo "- EC2 access (to manage instances)"
echo "- Or attach the 'AmazonEC2FullAccess' policy for simplicity"
echo ""

echo "📖 Step-by-Step Instructions:"
echo "-----------------------------"
echo ""
echo "1. Go to AWS Console > IAM > Users"
echo "2. Create a new user or use existing user"
echo "3. Attach 'AmazonEC2FullAccess' policy (or create custom policy)"
echo "4. Go to Security Credentials tab"
echo "5. Click 'Create access key'"
echo "6. Choose 'Application running outside AWS'"
echo "7. Copy the Access Key ID and Secret Access Key"
echo "8. Add these to GitHub Secrets along with your SSH key and instance details"
echo ""

echo "🔧 Testing Your Setup:"
echo "----------------------"
echo "After adding secrets, you can test by:"
echo "1. Going to GitHub Actions tab in your repo"
echo "2. Click 'Run workflow' on the 'Deploy Dead Lizard Calendar' workflow"
echo "3. Check if the AWS credentials step passes"
echo ""

echo "📞 Need Help?"
echo "-------------"
echo "If you need help with any of these steps, let me know and I can provide more detailed guidance!"
