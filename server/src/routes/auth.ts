import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Store the role from query parameter in session for use in callback
  if (req.query.role) {
    req.session = req.session || {};
    (req.session as any).pendingRole = req.query.role;
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/auth/callback?error=oauth_failed'
  }),
  async (req, res) => {
    try {
      const user = req.user as any;
      
      // Get the role from session (passed from initial OAuth request)
      const pendingRole = (req.session as any)?.pendingRole || 'guest';
      
      // Map role strings to enum values (lowercase for database)
      const roleMap: { [key: string]: 'guest' | 'user' | 'admin' } = {
        'guest': 'guest',
        'user': 'user',
        'admin': 'admin'
      };
      
      const finalRole = roleMap[pendingRole] || 'guest';
      
      // Clean up the name by removing special characters and emojis
      const cleanName = user.name
        .replace(/[⚡️🔥💥✨🌟⭐️🎵🎶🎸🥁🎤🎧🎼🎹]/g, '') // Remove common emojis
        .replace(/[^\w\s.-]/g, '') // Remove non-alphanumeric characters except spaces, dots, hyphens
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim(); // Remove leading/trailing whitespace

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
