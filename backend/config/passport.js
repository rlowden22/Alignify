// backend/config/passport.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

function initializePassport(db) {
  // Get users collection
  const usersCollection = db.collection("users");

  // Define the local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await usersCollection.findOne({
            email: email.toLowerCase(),
          });

          if (!user) {
            return done(null, false, { message: "User not found" });
          }

          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, { message: "Invalid credentials" });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await usersCollection.findOne({
        _id: new ObjectId(id),
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  return passport;
}

export default initializePassport;
