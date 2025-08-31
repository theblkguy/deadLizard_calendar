# 🔐 Custom Password Setup Guide

## Perfect! Now You Can Use Any Passwords You Want

Your Dead Lizard Studio Calendar now supports **custom passwords** that get securely salted and hashed. This gives you the best of both worlds: memorable passwords for your band + bank-level security.

## 🚀 Quick Setup Options

### Option 1: Use the Interactive Script (Recommended)
```bash
cd server
npm run hash-passwords
```

This will:
- Prompt you for custom passwords
- Generate secure bcrypt hashes 
- Give you both plaintext and hashed versions
- Provide copy-paste ready environment variables

### Option 2: Quick Setup with Examples
```bash
cd server  
npm run quick-setup
```

Uses these example passwords:
- 🏠 Guest: `StudioGuest2024!`
- 👤 User: `DeadLizardBand!` 
- 🔑 Admin: `StudioAdmin2024!`

### Option 3: Manual Setup
Just edit your `.env` file directly:
```bash
# Use your own custom passwords
GUEST_ACCESS_CODE=YourGuestPassword123!
USER_ACCESS_CODE=YourBandPassword456!
ADMIN_ACCESS_CODE=YourAdminPassword789!
```

## 🔒 Security Levels

### Development (Simple)
Use plaintext passwords in `.env`:
```bash
GUEST_ACCESS_CODE=MyGuestPass
USER_ACCESS_CODE=MyBandPass  
ADMIN_ACCESS_CODE=MyAdminPass
```

### Production (Secure)
Use hashed passwords in `.env`:
```bash
GUEST_ACCESS_CODE_HASH=$2b$12$xyz...
USER_ACCESS_CODE_HASH=$2b$12$abc...
ADMIN_ACCESS_CODE_HASH=$2b$12$def...
```

## 💡 Password Ideas

### For Band Use
- `StudioTime2024!`
- `DeadLizardRocks!`
- `BandPractice123!`
- `JamSession2024!`

### For Guests  
- `StudioGuest!`
- `VisitorAccess!`
- `CalendarView!`

### For Admins
- `StudioManager2024!`
- `AdminControl!`
- `MasterAccess!`

## 🛡️ System Features

✅ **Supports both methods**:
- Plaintext passwords (simple, good for dev)
- Bcrypt hashed passwords (secure, good for production)

✅ **Automatic salt generation** (each password gets unique salt)

✅ **Timing-safe comparison** (prevents timing attacks)

✅ **Rate limiting** (5 attempts per 15 minutes)

✅ **Access logging** (tracks all access attempts)

## 🔄 How It Works

1. **You set custom passwords** like `"MyBandPassword123!"`
2. **System automatically salts and hashes** them using bcrypt
3. **When someone enters the password**, it gets hashed and compared
4. **No plaintext passwords stored** (if using hashed method)

## 📋 Environment Variable Options

```bash
# Method 1: Plaintext (simple)
GUEST_ACCESS_CODE=YourGuestPassword
USER_ACCESS_CODE=YourBandPassword
ADMIN_ACCESS_CODE=YourAdminPassword

# Method 2: Hashed (secure) 
GUEST_ACCESS_CODE_HASH=$2b$12$hash...
USER_ACCESS_CODE_HASH=$2b$12$hash...
ADMIN_ACCESS_CODE_HASH=$2b$12$hash...

# You can mix both methods if needed
```

## 🎵 Sharing with Band Members

Just give them the actual passwords:
- "Hey, the studio calendar password is `DeadLizardRocks!`"
- "Use `StudioGuest!` to view the schedule"
- "Admin access is `StudioManager2024!`"

The system handles all the security behind the scenes!

## 🔧 Commands Reference

```bash
# Interactive password setup
npm run hash-passwords

# Quick setup with examples  
npm run quick-setup

# Start development server
npm run dev

# View security documentation
npm run security-help
```

---

**Perfect!** Now you can use any passwords you want while maintaining maximum security. The system automatically handles the salting, hashing, and secure verification for you! 🎸🔐
