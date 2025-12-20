/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserService } from '../modules/user/user.service';
import config from "./index";

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId as string,
      clientSecret: config.google.clientSecret as string,
      callbackURL: config.google.callbackURL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleProfile = {
          id: profile.id,
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName,
          picture: profile.photos?.[0]?.value,
        };

        const user = await UserService.findOrCreateGoogleUser(googleProfile);
        return done(null, user);



      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserService.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;