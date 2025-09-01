import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';

const router = express.Router();

// Google OAuth routes
router.get('/google', (req, res, next) => {
  console.log('🔍 Google OAuth initiation requested');
  console.log('🔍 Query parameters:', req.query);
  
  // Store the role from query parameter in session for use in callback
  if (req.query.role) {
    req.session = req.session || {};
    (req.session as any).pendingRole = req.query.role;
    console.log('🔍 Stored pending role in session:', req.query.role);
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Test Google OAuth with direct redirect (bypass passport)
router.get('/google-direct', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = 'https://deadlizardjam.online/api/auth/test-direct-callback';
  const scope = 'profile email';
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  
  res.redirect(googleAuthUrl);
});

// Test endpoint to check if passport is working
router.get('/test-passport', (req, res) => {
  res.json({
    message: 'Passport auth routes are working',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check environment variables
router.get('/debug-env', (req, res) => {
  res.json({
    message: 'Environment variable status',
    googleClientId: process.env.GOOGLE_CLIENT_ID ? `Set (${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...)` : 'Not set',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? `Set (${process.env.GOOGLE_CLIENT_SECRET.substring(0, 6)}...)` : 'Not set',
    mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Simple test callback to verify routing works
router.get('/test-direct-callback', (req, res) => {
  console.log('🚨 Direct callback test reached');
  console.log('🚨 Query params:', req.query);
  res.json({
    message: 'Direct callback test working',
    query: req.query,
    timestamp: new Date().toISOString(),
    receivedCode: req.query.code ? 'Yes' : 'No'
  });
});

// Test endpoint to check if passport is working
router.get('/test-callback', (req, res) => {
  console.log('🚨 Test callback reached');
  console.log('🚨 Query params:', req.query);
  res.json({
    message: 'Test callback endpoint working',
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

router.get('/google/callback',
  (req, res, next) => {
    console.log('🔍 OAuth callback initiated');
    console.log('🔍 Query params:', req.query);
    
    passport.authenticate('google', { 
      session: false
    }, (err, user, info) => {
      console.log('🔍 Passport authenticate callback:', { err, user: user ? 'Present' : 'Missing', info });
      
      if (err) {
        console.error('❌ Passport authentication error:', err);
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5000';
        return res.redirect(`${frontendURL}/auth/callback?error=passport_error`);
      }
      
      if (!user) {
        console.error('❌ No user returned from passport');
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5000';
        return res.redirect(`${frontendURL}/auth/callback?error=no_user`);
      }
      
      // Manually set user on request and continue
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    try {
      console.log('🔍 Google OAuth callback reached after authentication');
      const user = req.user as any;
      
      if (!user) {
        console.error('❌ No user data received from Google OAuth');
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5000';
        return res.redirect(`${frontendURL}/auth/callback?error=no_user_data`);
      }

      console.log('🔍 User data from Google:', {
        id: user.id,
        email: user.email,
        name: user.name
      });

      // Get the role from session (passed from initial OAuth request)
      const pendingRole = (req.session as any)?.pendingRole || 'guest';
      console.log('🔍 Pending role from session:', pendingRole);
      
      // Map role strings to enum values (lowercase for database)
      const roleMap: { [key: string]: 'guest' | 'user' | 'admin' } = {
        'guest': 'guest',
        'user': 'user',
        'admin': 'admin'
      };
      
      const finalRole = roleMap[pendingRole] || 'guest';
      console.log('🔍 Final role assigned:', finalRole);
      
      // Clean up the name by removing special characters and emojis
      const cleanName = user.name
        .replace(/[⚡️🔥💥✨🌟⭐️🎵🎶🎸🥁🎤🎧🎼🎹]/g, '') // Remove common emojis
        .replace(/[^\w\s.-]/g, '') // Remove non-alphanumeric characters except spaces, dots, hyphens
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing whitespace

      console.log('🔍 Cleaned name:', cleanName);

      // Check database connection before trying to query
      if (mongoose.connection.readyState !== 1) {
        console.error('❌ Database not connected, creating temporary token');
        // Create a temporary JWT token without database interaction
        const tempToken = jwt.sign(
          { 
            userId: `temp_${user.id}`,
            email: user.email, 
            name: cleanName,
            picture: user.picture,
            role: finalRole
          },
          process.env.JWT_SECRET || 'deadlizard-jwt-secret',
          { expiresIn: '24h' }
        );
        
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5000';
        return res.redirect(`${frontendURL}/auth/callback?token=${tempToken}&temp=true`);
      }

      // Find or create user in database
      // First try to find by Google ID, then by email
      let dbUser = await User.findOne({ 
        $or: [
          { googleId: user.id },
          { email: user.email }
        ]
      });
      
      if (!dbUser) {
        // Create new user if none exists
        dbUser = new User({
          googleId: user.id,
          email: user.email,
          name: cleanName,
          picture: user.picture,
          role: finalRole
        });
        await dbUser.save();
        console.log(`✅ Created new user: ${user.email} with role: ${finalRole}`);
      } else {
        // Update existing user info
        dbUser.name = cleanName;
        dbUser.picture = user.picture;
        
        // Update Google ID if it's missing (for users who signed up via email)
        if (!dbUser.googleId) {
          dbUser.googleId = user.id;
        }
        
        // Keep the user's existing role instead of overriding with session role
        // Only override if the user is accessing with admin credentials
        if (finalRole === 'admin' && dbUser.role !== 'admin') {
          console.log(`🔄 Updating user ${user.email} role from ${dbUser.role} to ${finalRole}`);
          dbUser.role = finalRole;
        }
        
        await dbUser.save();
        console.log(`✅ Updated existing user: ${user.email} (role: ${dbUser.role})`);
      }

      // Create JWT token
      const token = jwt.sign(
        { 
          userId: dbUser._id,
          email: user.email, 
          name: cleanName,
          picture: user.picture,
          role: dbUser.role  // Use the actual role from database, not session role
        },
        process.env.JWT_SECRET || 'deadlizard-jwt-secret',
        { expiresIn: '24h' }
      );
      
      // Clear the pending role from session
      if (req.session) {
        delete (req.session as any).pendingRole;
      }
      
      // Redirect to frontend with token
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5000';
      res.redirect(`${frontendURL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        user: req.user ? { id: (req.user as any).id, email: (req.user as any).email } : 'No user'
      });
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5000';
      res.redirect(`${frontendURL}/auth/callback?error=auth_failed`);
    }
  }
);

// Cleanup route for development - remove invalid users
router.delete('/cleanup', async (req: any, res: any) => {
  try {
    // Remove users with invalid roles (for development only)
    const result = await User.deleteMany({ 
      role: { $nin: ['guest', 'user', 'admin'] } 
    });
    
    res.json({ 
      message: 'Cleanup completed', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Cleanup failed' });
  }
});

// Remove specific user by email (for development)
router.delete('/cleanup/:email', async (req: any, res: any) => {
  try {
    const { email } = req.params;
    const result = await User.deleteOne({ email });
    
    res.json({ 
      message: `User ${email} cleanup completed`, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('User cleanup error:', error);
    res.status(500).json({ message: 'User cleanup failed' });
  }
});

// Get current user info
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
  const user = req.user as any;
  res.json({
    id: user._id,
    email: user.email,
    name: user.name,
    picture: user.picture,
    role: user.role
  });
});

// Logout route
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Verify token route
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400).json({ message: 'Token is required' });
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'deadlizard-jwt-secret') as any;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

export default router;
