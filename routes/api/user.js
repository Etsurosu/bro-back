const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../auth");

const Users = mongoose.model("Users");

router.get("/me", auth.required, async (req, res) => {
  const {
    payload: { id }
  } = req;

  const user = await Users.findById(id);
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  return res.status(200).json({ user: user.toMeJSON() });
});

router.delete("/me", auth.required, async (req, res) => {
  const {
    payload: { id }
  } = req;

  await Users.findByIdAndDelete(id, err => {
    if (err) {
      res.status(500).json({
        error: "cannot delete profile"
      });
    }
  });
  return res.status(200);
});

router.patch("/me", auth.required, async (req, res) => {
  const {
    payload: { id },
    body: { user }
  } = req;
  if (!user) {
    return res.status(400).json({ error: "bad request" });
  }
  let finalUser = await Users.findById(id);
  if (user.pseudo) {
    finalUser = await Users.findByIdAndUpdate(
      id,
      { pseudo: user.pseudo },
      { returnNewDocument: true },
      err => {
        if (err) {
          res.status(400).json({
            errors: {
              message: "pseudo is already taken"
            }
          });
        }
      }
    );
  }
  if (user && user.password && finalUser) {
    finalUser.setPassword(user.password);
  }
  if (!finalUser) {
    return res.status(404).json({ error: "user not found" });
  }
  await finalUser.save();
  return res.status(200).json({ user: finalUser.toMeJSON() });
});

module.exports = router;
