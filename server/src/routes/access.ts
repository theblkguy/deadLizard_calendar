import express from 'express';
import rateLimit from 'express-rate-limit';
import { AccessCodeManager, AccessRateLimit } from '../utils/passwordManager';

const router = express.Router();

// Rate limiting middleware for access code attempts
const accessCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many access attempts, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize access codes
AccessCodeManager.initialize();

// Verify access code route
router.post('/verify-access', accessCodeLimiter, async (req, res) => {
  try {
    const { accessCode } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    // Check if IP is rate limited
    if (AccessRateLimit.isRateLimited(clientIP)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later.',
        retryAfter: 15 * 60 * 1000 // 15 minutes in milliseconds
      });
    }

    if (!accessCode || typeof accessCode !== 'string') {
      AccessRateLimit.recordAttempt(clientIP);
      return res.status(400).json({
        success: false,
        message: 'Access code is required'
      });
    }

    // Verify the access code
    const role = await AccessCodeManager.verifyAccessCode(accessCode.trim());

    if (!role) {
      AccessRateLimit.recordAttempt(clientIP);
      
      // Log failed attempt (without logging the actual code)
      console.log(`🚫 Failed access attempt from IP: ${clientIP} at ${new Date().toISOString()}`);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid access code'
      });
    }

    // Successful access
    console.log(`✅ Successful ${role} access from IP: ${clientIP} at ${new Date().toISOString()}`);

    return res.json({
      success: true,
      role: role,
      permissions: getPermissionsForRole(role),
      message: `Welcome! You have ${role} access.`
    });

  } catch (error) {
    console.error('Access verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get available access levels (public endpoint)
router.get('/access-levels', (req, res) => {
  res.json({
    levels: AccessCodeManager.getAccessLevels(),
    descriptions: {
      guest: 'Read-only access to view calendar',
      user: 'Book and manage your own studio sessions',
      admin: 'Full access to manage all bookings and users'
    }
  });
});

// Helper function to define permissions for each role
function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case 'guest':
      return ['view_calendar', 'view_bookings'];
    case 'user':
      return ['view_calendar', 'view_bookings', 'create_booking', 'edit_own_booking', 'cancel_own_booking'];
    case 'admin':
      return ['view_calendar', 'view_bookings', 'create_booking', 'edit_all_bookings', 'cancel_all_bookings', 'manage_users'];
    default:
      return [];
  }
}

export default router;
