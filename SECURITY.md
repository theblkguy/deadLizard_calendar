# 🔐 Secure Access Code Setup Guide

## Overview
Your Dead Lizard Studio Calendar uses a three-tier access system with secure codes instead of traditional user accounts. This provides simple access control while maintaining security.

## Access Levels

### 🏠 **Guest Access**
- **Purpose**: Read-only calendar viewing
- **Permissions**: View bookings, see studio availability
- **Share with**: Friends, collaborators who just need to see the schedule

### 👤 **User Access** 
- **Purpose**: Band members who need to book studio time
- **Permissions**: View calendar, create bookings, edit their own bookings
- **Share with**: Regular band members, trusted collaborators

### 🔑 **Admin Access**
- **Purpose**: Studio management and full control
- **Permissions**: All user permissions + manage all bookings, user management
- **Share with**: Studio owners, primary band leaders only

## Setting Up Access Codes

### Method 1: Generate Secure Codes (Recommended)

```bash
# Navigate to server directory
cd server

# Run the code generator
npx ts-node scripts/generateAccessCodes.ts
```

This will generate:
- Cryptographically secure random codes
- Optional bcrypt hashes for enhanced security
- Both memorable and ultra-secure options

### Method 2: Manual Setup

1. **Create strong access codes**:
   ```bash
   # Generate secure random codes
   openssl rand -base64 24
   ```

2. **Add to your `.env` file**:
   ```bash
   # Access Codes - Keep these secret!
   GUEST_ACCESS_CODE=your-guest-code-here
   USER_ACCESS_CODE=your-user-code-here
   ADMIN_ACCESS_CODE=your-admin-code-here
   ```

## Security Best Practices

### 🚨 **Critical Security Rules**

1. **Never commit `.env` files to Git**
   ```bash
   # Ensure .env is in .gitignore
   echo "server/.env" >> .gitignore
   ```

2. **Use different codes for dev/production**
   - Development: Use simpler codes for testing
   - Production: Use cryptographically secure codes

3. **Rotate codes periodically**
   - Change codes every 3-6 months
   - Change immediately if compromised
   - Use the generator script to create new codes

### 🛡️ **Built-in Security Features**

Your system includes:
- **Rate limiting**: 5 attempts per 15 minutes per IP
- **Timing attack protection**: Secure string comparison
- **Access logging**: Failed attempts are logged
- **No password storage**: Codes are compared directly (or hashed)

### 📊 **Monitoring & Logs**

The system logs all access attempts:
```
✅ Successful user access from IP: 192.168.1.100 at 2024-08-30T10:30:00.000Z
🚫 Failed access attempt from IP: 192.168.1.101 at 2024-08-30T10:31:00.000Z
```

Monitor these logs for suspicious activity.

## Sharing Access Codes Securely

### ✅ **Do:**
- Share codes via secure messaging (Signal, encrypted email)
- Share verbally in person
- Use password managers to store codes
- Create different codes for different people if needed

### ❌ **Don't:**
- Send codes via unencrypted email
- Post codes in public forums or chat rooms
- Store codes in plaintext files
- Share admin codes with non-essential people

## API Endpoints

### Verify Access Code
```http
POST /api/access/verify-access
Content-Type: application/json

{
  "accessCode": "your-access-code-here"
}
```

**Response:**
```json
{
  "success": true,
  "role": "user",
  "permissions": ["view_calendar", "create_booking", "edit_own_booking"],
  "message": "Welcome! You have user access."
}
```

### Get Access Levels
```http
GET /api/access/access-levels
```

## Troubleshooting

### Rate Limited
If you get "Too many failed attempts":
- Wait 15 minutes before trying again
- Check if you're using the correct code
- Contact admin if codes may have changed

### Code Not Working
1. Verify the code is copied correctly (no extra spaces)
2. Check if codes have been rotated recently
3. Ensure you're using the right code for your access level

### Security Breach
If codes are compromised:
1. Generate new codes immediately
2. Update the `.env` file
3. Restart the server
4. Inform all legitimate users of new codes

## Environment Variables Reference

```bash
# Required Access Codes
GUEST_ACCESS_CODE=your-secure-guest-code
USER_ACCESS_CODE=your-secure-user-code  
ADMIN_ACCESS_CODE=your-secure-admin-code

# Optional: Enhanced Security with Bcrypt
GUEST_ACCESS_CODE_HASH=$2b$12$...
USER_ACCESS_CODE_HASH=$2b$12$...
ADMIN_ACCESS_CODE_HASH=$2b$12$...
```

## Integration with Frontend

The frontend HomePage component will:
1. Prompt for access code
2. Send code to `/api/access/verify-access`
3. Redirect based on role:
   - `guest` → Read-only calendar view
   - `user` → Full calendar with booking capabilities  
   - `admin` → Admin dashboard with management tools

---

**Remember**: The security of your studio calendar depends on keeping these access codes secure. Treat them like passwords and follow the security practices outlined above.
