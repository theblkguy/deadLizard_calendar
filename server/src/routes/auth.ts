import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';

const router = express.Router();

// Google OAuth routes
// Working Google OAuth (bypasses passport completely)
router.get('/google-working', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = 'https://deadlizardjam.online/api/auth/google/callback'; // Use existing URI
  const scope = 'profile email';
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}`;
  
  console.log('🔍 Working Google OAuth redirect:', googleAuthUrl);
  res.redirect(googleAuthUrl);
});

// Working Google OAuth callback (bypasses passport)
router.get('/google-working-callback', async (req, res) => {
  try {
    console.log('🔍 Working OAuth callback received:', req.query);
    
    const { code, error } = req.query;
    
    if (error) {
      console.error('❌ Google OAuth error:', error);
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=google_${error}`);
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=no_code`);
    }
    
    // Exchange code for token using fetch
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: 'https://deadlizardjam.online/api/auth/google/callback',
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json() as any;
    
    if (!tokenData.access_token) {
      console.error('❌ Failed to get access token:', tokenData);
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=no_token`);
    }
    
    // Get user profile
    const profileResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
    const userProfile = await profileResponse.json() as any;
    
    if (!userProfile.email) {
      console.error('❌ Failed to get user profile:', userProfile);
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=no_profile`);
    }
    
    console.log('✅ Working OAuth success:', {
      email: userProfile.email,
      name: userProfile.name
    });
    
    // Find or create user in database
    let user;
    try {
      // Check if user already exists
      user = await User.findOne({ googleId: userProfile.id });
      
      if (!user) {
        // Create new user
        user = new User({
          googleId: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          picture: userProfile.picture,
          role: 'user'
        });
        
        await user.save();
        console.log('✅ Created new user in database:', user.email);
      } else {
        console.log('✅ Found existing user in database:', user.email);
      }
    } catch (dbError) {
      console.error('❌ Database error during user creation:', dbError);
      // If database fails, continue with temporary user data
      console.log('⚠️ Continuing without database - creating temporary JWT');
    }
    
    // Create JWT token with proper user ID
    const jwtPayload = user ? {
      userId: user._id.toString(), // Use MongoDB ObjectId for proper database lookup
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role
    } : {
      userId: `google_${userProfile.id}`, // Fallback if database failed
      email: userProfile.email,
      name: userProfile.name,
      picture: userProfile.picture,
      role: 'user'
    };
    
    const token = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET || 'deadlizard-jwt-secret',
      { expiresIn: '24h' }
    );
    
    // Redirect with token (URL encode the token to prevent corruption)
    res.redirect(`https://deadlizardjam.online/auth/callback?token=${encodeURIComponent(token)}&working=true`);
    
  } catch (error) {
    console.error('❌ Working OAuth callback error:', error);
    res.redirect(`https://deadlizardjam.online/auth/callback?error=working_failed`);
  }
});

// Test route to verify JWT token encoding/decoding works
router.get('/test-token', (req, res) => {
  try {
    console.log('🧪 Test token route called');
    
    // Create a test JWT token
    const testToken = jwt.sign(
      {
        userId: 'test_12345',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://via.placeholder.com/40',
        role: 'user'
      },
      process.env.JWT_SECRET || 'deadlizard-jwt-secret',
      { expiresIn: '24h' }
    );
    
    console.log('🧪 Test token created:', testToken);
    console.log('🧪 Test token length:', testToken.length);
    console.log('🧪 Test token parts:', testToken.split('.').length);
    
    // Redirect with URL-encoded token
    res.redirect(`https://deadlizardjam.online/auth/callback?token=${encodeURIComponent(testToken)}&test=true`);
    
  } catch (error) {
    console.error('❌ Test token error:', error);
    res.redirect(`https://deadlizardjam.online/auth/callback?error=test_failed`);
  }
});

// Standard Google OAuth route (what people expect)
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = 'https://deadlizardjam.online/api/auth/google/callback';
  const scope = 'profile email';
  const role = typeof req.query.role === 'string' ? req.query.role : ''; // Get role from query parameter
  
  // Build the Google OAuth URL
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}` +
    (role ? `&state=${encodeURIComponent(role)}` : ''); // Pass role as state
  
  console.log('🔍 Google OAuth redirect with role:', role);
  res.redirect(googleAuthUrl);
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

// Debug callback to see what Google is actually sending us
router.get('/debug-callback', (req, res) => {
  console.log('🔍 Debug callback received from Google:');
  console.log('🔍 Query params:', req.query);
  console.log('🔍 Headers:', req.headers);
  
  res.json({
    message: 'Debug callback - Google OAuth data',
    query: req.query,
    timestamp: new Date().toISOString(),
    receivedCode: req.query.code ? 'Yes' : 'No',
    codeLength: req.query.code ? (req.query.code as string).length : 0
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

router.get('/google/callback', async (req, res) => {
  try {
    console.log('🔍 Fixed OAuth callback received:', req.query);
    console.log('🔍 All query parameters:', Object.keys(req.query));
    console.log('🔍 Code present:', !!req.query.code);
    console.log('🔍 Error present:', !!req.query.error);
    
    const { code, error } = req.query;
    
    if (error) {
      console.error('❌ Google OAuth error:', error);
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=google_${error}&debug=error_from_google`);
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      console.error('❌ Available parameters:', Object.keys(req.query));
      console.error('❌ Full query object:', req.query);
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=no_code&debug=missing_auth_code&params=${encodeURIComponent(JSON.stringify(req.query))}`);
    }
    
    // Exchange code for token using fetch
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: 'https://deadlizardjam.online/api/auth/google/callback',
        grant_type: 'authorization_code'
      })
    });
    
    const tokenData = await tokenResponse.json() as any;
    
    if (!tokenData.access_token) {
      console.error('❌ Failed to get access token:', tokenData);
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=no_token`);
    }
    
    // Get user profile
    const profileResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`);
    const userProfile = await profileResponse.json() as any;
    
    if (!userProfile.email) {
      console.error('❌ Failed to get user profile:', userProfile);
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=no_profile`);
    }
    
    console.log('✅ Fixed OAuth success:', {
      email: userProfile.email,
      name: userProfile.name
    });
    
    // Create JWT token
    const token = jwt.sign(
      {
        userId: `google_${userProfile.id}`,
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        role: 'user'
      },
      process.env.JWT_SECRET || 'deadlizard-jwt-secret',
      { expiresIn: '24h' }
    );
    
    // Redirect with token (URL encode the token to prevent corruption)
    res.redirect(`https://deadlizardjam.online/auth/callback?token=${encodeURIComponent(token)}&fixed=true`);
    
  } catch (error) {
    console.error('❌ Fixed OAuth callback error:', error);
    res.redirect(`https://deadlizardjam.online/auth/callback?error=fixed_failed`);
  }
});

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
