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
try {
  AccessCodeManager.initialize();
} catch (error) {
  console.error('❌ Failed to initialize access codes:', error);
  console.error('Environment check:', {
    GUEST_ACCESS_CODE: process.env.GUEST_ACCESS_CODE ? `Set (${process.env.GUEST_ACCESS_CODE.length} chars)` : 'Not set',
    USER_ACCESS_CODE: process.env.USER_ACCESS_CODE ? `Set (${process.env.USER_ACCESS_CODE.length} chars)` : 'Not set',
    ADMIN_ACCESS_CODE: process.env.ADMIN_ACCESS_CODE ? `Set (${process.env.ADMIN_ACCESS_CODE.length} chars)` : 'Not set',
    GUEST_ACCESS_CODE_HASH: process.env.GUEST_ACCESS_CODE_HASH ? 'Set' : 'Not set',
    USER_ACCESS_CODE_HASH: process.env.USER_ACCESS_CODE_HASH ? 'Set' : 'Not set',
    ADMIN_ACCESS_CODE_HASH: process.env.ADMIN_ACCESS_CODE_HASH ? 'Set' : 'Not set'
  });
  // Don't crash the server - just log the error
  console.error('⚠️  Access code system will be disabled until this is fixed');
}

// Verify access code route
router.post('/verify-access', accessCodeLimiter, async (req, res) => {
  try {
    const { accessCode } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    // Check if access codes are properly initialized
    if (!AccessCodeManager.isInitialized()) {
      console.error('❌ Access codes not initialized - check environment variables');
      return res.status(500).json({
        success: false,
        message: 'Authentication system not properly configured'
      });
    }

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

// Diagnostic endpoint for debugging environment issues
router.get('/diagnostic', (req, res) => {
  res.json({
    initialized: AccessCodeManager.isInitialized(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      GUEST_ACCESS_CODE: process.env.GUEST_ACCESS_CODE ? `Set (${process.env.GUEST_ACCESS_CODE.length} chars)` : 'Not set',
      USER_ACCESS_CODE: process.env.USER_ACCESS_CODE ? `Set (${process.env.USER_ACCESS_CODE.length} chars)` : 'Not set',
      ADMIN_ACCESS_CODE: process.env.ADMIN_ACCESS_CODE ? `Set (${process.env.ADMIN_ACCESS_CODE.length} chars)` : 'Not set',
      GUEST_ACCESS_CODE_HASH: process.env.GUEST_ACCESS_CODE_HASH ? 'Set' : 'Not set',
      USER_ACCESS_CODE_HASH: process.env.USER_ACCESS_CODE_HASH ? 'Set' : 'Not set',
      ADMIN_ACCESS_CODE_HASH: process.env.ADMIN_ACCESS_CODE_HASH ? 'Set' : 'Not set'
    },
    timestamp: new Date().toISOString()
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
