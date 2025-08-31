#!/bin/bash

echo "🔐 GitHub Secrets Configuration Helper"
echo "======================================"
echo ""

echo "✅ Confirmed Information:"
echo "AWS_HOST: 3.15.83.121"
echo "AWS_USER: ubuntu"
echo ""

echo "📋 GitHub Secrets Checklist:"
echo "----------------------------"
echo "Go to: https://github.com/theblkguy/deadLizard_calendar/settings/secrets/actions"
echo ""

echo "1. ✅ AWS_HOST = 3.15.83.121"
echo "2. ✅ AWS_USER = ubuntu"
echo "3. ⚠️  AWS_SSH_KEY = [Copy your entire .pem file content]"
echo "4. ⚠️  AWS_ACCESS_KEY_ID = [Get from AWS IAM]"
echo "5. ⚠️  AWS_SECRET_ACCESS_KEY = [Get from AWS IAM]"
echo ""

echo "🔑 To get your SSH private key content:"
echo "On your local machine (where you have the .pem file):"
echo "cat path/to/your-key.pem"
echo ""

echo "💡 Quick AWS IAM Setup:"
echo "1. Go to: https://console.aws.amazon.com/iam/home#/users"
echo "2. Create user: 'deadlizard-github-actions'"
echo "3. Attach policy: 'AmazonEC2FullAccess'"
echo "4. Create access key for 'Application running outside AWS'"
echo "5. Copy both Access Key ID and Secret Access Key"
echo ""

echo "🧪 After setup, test with:"
echo "GitHub Actions -> 'Deploy Dead Lizard Calendar' -> 'Run workflow'"
