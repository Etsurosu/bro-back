const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Users = mongoose.model("Users");

passport.use(
  new LocalStrategy(
    {
      usernameField: "user[pseudo]",
      passwordField: "user[password]"
    },
    (pseudo, password, done) => {
      Users.findOne({ pseudo })
        .then(user => {
          if (!user || !user.validatePassword(password)) {
            return done(null, false, { errors: { "pseudo or password": "is invalid" } });
          }

          return done(null, user);
        })
        .catch(done);
    }
  )
);
