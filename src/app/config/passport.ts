
import { AuthProvider, Role } from "@prisma/client";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../prisma/prisma";
import config from "./index";


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

export default passport;
