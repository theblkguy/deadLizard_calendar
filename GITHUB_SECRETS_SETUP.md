# GitHub Secrets Setup for Dead Lizard Calendar

## 🔐 Required GitHub Secrets

Go to: `https://github.com/theblkguy/deadLizard_calendar/settings/secrets/actions`

Add the following secrets:

### 1. AWS_HOST
**Name**: `AWS_HOST`  
**Value**: `3.15.83.121`

### 2. AWS_USER
**Name**: `AWS_USER`  
**Value**: `ubuntu`

### 3. AWS_SSH_KEY
**Name**: `AWS_SSH_KEY`  
**Value**: [The entire content of your .pem file]

This should be the complete content of the private key file you used to SSH into your EC2 instance, including:
```
-----BEGIN RSA PRIVATE KEY-----
[your private key content]
-----END RSA PRIVATE KEY-----
```

### 4. AWS_ACCESS_KEY_ID
**Name**: `AWS_ACCESS_KEY_ID`  
**Value**: [Your AWS access key ID]

### 5. AWS_SECRET_ACCESS_KEY
**Name**: `AWS_SECRET_ACCESS_KEY`  
**Value**: [Your AWS secret access key]

## 🚨 Missing AWS Credentials

You still need to obtain AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY. Here are your options:

### Option A: Use Existing AWS Credentials
If you already have AWS access keys, use those.

### Option B: Create New IAM User (Recommended)

1. Go to AWS Console: https://console.aws.amazon.com/iam/
2. Click "Users" in the left sidebar
3. Click "Create user"
4. Enter username: `deadlizard-github-actions`
5. Click "Next"
6. Select "Attach policies directly"
7. Search for and select: `AmazonEC2FullAccess`
8. Click "Next" then "Create user"
9. Click on the created user
10. Go to "Security credentials" tab
11. Click "Create access key"
12. Select "Application running outside AWS"
13. Click "Next" then "Create access key"
14. **IMPORTANT**: Copy both the Access Key ID and Secret Access Key immediately!

### Option C: Use AWS CLI on EC2 Instance
If your EC2 instance already has an IAM role attached with appropriate permissions, you can skip AWS credentials entirely by modifying the GitHub Actions workflow.

## 🧪 Testing the Setup

After adding all secrets:

1. Go to: https://github.com/theblkguy/deadLizard_calendar/actions
2. Click on "Deploy Dead Lizard Calendar" workflow
3. Click "Run workflow"
4. Select "deployment-branch" 
5. Check "Force deployment even if no changes"
6. Click "Run workflow"

## 📋 Current Status

✅ AWS_HOST: `3.15.83.121`  
✅ AWS_USER: `ubuntu`  
⚠️ AWS_SSH_KEY: [Needs your .pem file content]  
⚠️ AWS_ACCESS_KEY_ID: [Needs AWS credentials]  
⚠️ AWS_SECRET_ACCESS_KEY: [Needs AWS credentials]  

## 🔧 Alternative: IAM Role Approach (Advanced)

If you prefer not to use access keys, you can attach an IAM role to your EC2 instance and modify the GitHub Actions workflow to use OIDC authentication instead. Let me know if you'd like to explore this option.
