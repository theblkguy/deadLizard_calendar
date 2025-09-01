// Manual Google OAuth implementation for debugging
import express from 'express';
import https from 'https';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Manual Google OAuth initiation
router.get('/google-manual', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = 'https://deadlizardjam.online/api/manual-oauth/callback';
  const scope = 'profile email';
  const state = 'deadlizard_' + Date.now(); // Simple state for security
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${state}`;
  
  console.log('🔍 Manual Google OAuth redirect:', googleAuthUrl);
  res.redirect(googleAuthUrl);
});

// Manual Google OAuth callback
router.get('/callback', async (req, res) => {
  try {
    console.log('🔍 Manual OAuth callback received:', req.query);
    
    const { code, error, state } = req.query;
    
    if (error) {
      console.error('❌ Google OAuth error:', error);
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=google_${error}`);
    }
    
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=no_code`);
    }
    
    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code as string);
    
    if (!tokenData.access_token) {
      console.error('❌ Failed to get access token');
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=no_token`);
    }
    
    // Get user profile
    const userProfile = await getUserProfile(tokenData.access_token);
    
    if (!userProfile.email) {
      console.error('❌ Failed to get user profile');
      return res.redirect(`https://deadlizardjam.online/auth/callback?error=no_profile`);
    }
    
    console.log('✅ Manual OAuth success:', {
      email: userProfile.email,
      name: userProfile.name
    });
    
    // Create JWT token manually
    const token = jwt.sign(
      {
        userId: `manual_${userProfile.id}`,
        email: userProfile.email,
        name: userProfile.name,
        picture: userProfile.picture,
        role: 'user'
      },
      process.env.JWT_SECRET || 'deadlizard-jwt-secret',
      { expiresIn: '24h' }
    );
    
    // Redirect with token
    res.redirect(`https://deadlizardjam.online/auth/callback?token=${token}&manual=true`);
    
  } catch (error) {
    console.error('❌ Manual OAuth callback error:', error);
    res.redirect(`https://deadlizardjam.online/auth/callback?error=manual_failed`);
  }
});

// Exchange authorization code for access token
async function exchangeCodeForToken(code: string): Promise<any> {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const data = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: 'https://deadlizardjam.online/api/manual-oauth/callback',
    grant_type: 'authorization_code'
  });
  
  return new Promise((resolve, reject) => {
    const req = https.request(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.toString().length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data.toString());
    req.end();
  });
}

// Get user profile from Google
async function getUserProfile(accessToken: string): Promise<any> {
  const profileUrl = `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`;
  
  return new Promise((resolve, reject) => {
    https.get(profileUrl, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

export default router;
