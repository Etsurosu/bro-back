const mongoose = require("mongoose");
const passport = require("passport");
const router = require("express").Router();
const auth = require("../auth");

const Users = mongoose.model("Users");

router.post("/register", auth.optional, async (req, res) => {
  const {
    body: { user }
  } = req;

  if (!user.pseudo) {
    return res.status(400).json({
      errors: {
        pseudo: "is required"
      }
    });
  }

  if (!user.password) {
    return res.status(400).json({
      errors: {
        password: "is required"
      }
    });
  }

  const finalUser = new Users(user);

  await finalUser.setPassword(user.password);

  return finalUser
    .save()
    .then(() => res.json({ user: finalUser.toAuthJSON() }))
    .catch(() =>
      res.status(400).json({
        errors: {
          message: "user already exist"
        }
      })
    );
});

router.post("/login", auth.optional, (req, res, next) => {
  const {
    body: { user }
  } = req;

  if (!user.pseudo) {
    return res.status(400).json({
      errors: {
        pseudo: "is required"
      }
    });
  }

  if (!user.password) {
    return res.status(400).json({
      errors: {
        password: "is required"
      }
    });
  }

  return passport.authenticate("local", { session: false }, (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      const userPp = passportUser;
      userPp.token = passportUser.generateJWT();

      return res.json({ user: userPp.toAuthJSON() });
    }

    return res.status(400).send(info);
  })(req, res, next);
});

router.get("/current", auth.required, async (req, res) => {
  const {
    payload: { id }
  } = req;

  const user = await Users.findById(id);
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  return res.json({ user: user.toAuthJSON() });
});

module.exports = router;
