import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import mongoose from 'mongoose';
import User from '../models/User';

export const configurePassport = (): void => {
  try {
    console.log('🔍 Configuring passport strategies...');
    
    // Google OAuth Strategy
    const callbackURL = process.env.NODE_ENV === 'production' 
      ? "https://deadlizardjam.online/api/auth/google/callback"
      : "/api/auth/google/callback";
    
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    console.log('🔍 Google OAuth configuration:', {
      clientID: clientID ? `Set (${clientID.substring(0, 10)}...)` : 'Not set',
      clientSecret: clientSecret ? `Set (${clientSecret.substring(0, 6)}...)` : 'Not set',
      callbackURL: callbackURL
    });

    if (!clientID || !clientSecret) {
      console.error('❌ Google OAuth credentials not found! Skipping Google strategy.');
      console.error('Missing:', {
        clientID: !clientID,
        clientSecret: !clientSecret
      });
      return;
    }

    passport.use(new GoogleStrategy({
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL
    },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔍 Google strategy callback received:', {
        profileId: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });

      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️ Database not connected, returning profile data directly');
        // Return profile data directly without database interaction
        const tempUser = {
          id: profile.id,
          googleId: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || '',
          picture: profile.photos?.[0]?.value || '',
          role: 'user',
          isTemporary: true
        };
        return done(null, tempUser);
      }

      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log('✅ Found existing user:', user.email);
        return done(null, user);
      }
      
      // Create new user
      user = new User({
        googleId: profile.id,
        email: profile.emails?.[0]?.value || '',
        name: profile.displayName || '',
        picture: profile.photos?.[0]?.value || '',
        role: 'user' // Default role
      });
      
      await user.save();
      console.log('✅ Created new user:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('❌ Google strategy error:', error);
      return done(error, false);
    }
  }));

  // JWT Strategy
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'deadlizard-jwt-secret'
  },
  async (payload, done) => {
    try {
      const user = await User.findById(payload.userId);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  });
  
  console.log('✅ Passport configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure passport:', error);
    // Don't throw error - let the server continue
    console.log('⚠️  Server will continue without passport authentication');
  }
};
