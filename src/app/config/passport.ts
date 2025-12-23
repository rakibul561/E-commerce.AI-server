
import { AuthProvider, Role } from "@prisma/client";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { prisma } from "../prisma/prisma";
import config from "./index";

// * google login
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId as string,
      clientSecret: config.google.clientSecret as string,
      callbackURL: config.google.callbackURL as string
    },
    async (_, __, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false, { message: "No email found" });
        }
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              profilePicture: profile.photos?.[0]?.value,
              role: Role.USER,
              isVerified: true,
              authProvider: AuthProvider.GOOGLE
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// * facebook login
passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientId as string,
      clientSecret: config.facebook.clientSecret as string,
      callbackURL: config.facebook.callbackURL as string,
      profileFields: ["id", "displayName", "emails", "photos"],
    },
    async (_, __, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false, { message: "Facebook email not found" });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              profilePicture: profile.photos?.[0]?.value,
              role: Role.USER,
              isVerified: true,
              authProvider: AuthProvider.FACEBOOK,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);


export default passport;
