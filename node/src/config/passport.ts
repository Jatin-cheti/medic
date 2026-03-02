import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

export function setupPassport() {
  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback
      ) => {
        try {
          // Extract user info from Google profile
          const googleId = profile.id;
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';
          const displayName = profile.displayName || '';

          if (!googleId || !email) {
            return done(new Error('Invalid Google profile data'), undefined);
          }

          // Return user data to be handled by route
          return done(null, {
            googleId,
            email,
            firstName,
            lastName,
            displayName
          });
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );

  // Serialize user for session (not used in stateless JWT auth, but required by passport)
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
}
