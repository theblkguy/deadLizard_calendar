#!/bin/bash

# 🔑 SSH Connection Helper for Dead Lizard Calendar AWS Instance
echo "🔑 Connecting to Dead Lizard Calendar AWS Instance..."

# Method 1: Direct SSH (if you have the key locally)
echo "If you have the SSH key locally, use:"
echo "ssh -i ~/.ssh/baj0k0.pem ubuntu@deadlizardjam.online"
echo ""

# Method 2: Copy key from Windows to WSL
echo "To copy your key from Windows to WSL:"
echo "1. Copy the key to your WSL home directory:"
echo "   cp /mnt/c/Users/Bradley/Downloads/baj0k0.pem ~/.ssh/"
echo "   chmod 600 ~/.ssh/baj0k0.pem"
echo ""
echo "2. Then connect:"
echo "   ssh -i ~/.ssh/baj0k0.pem ubuntu@deadlizardjam.online"
echo ""

# Method 3: AWS Session Manager (no SSH key needed)
echo "Method 3: AWS Session Manager (no SSH key needed):"
echo "1. Configure AWS CLI with your credentials"
echo "2. Install Session Manager plugin"
echo "3. Connect without SSH keys"
echo ""

echo "Choose the method that works best for you!"
