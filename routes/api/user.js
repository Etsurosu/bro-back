const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../auth");

const Users = mongoose.model("Users");

router.get("/me", auth.required, async (req, res) => {
  const {
    payload: { id }
  } = req;

  const user = await Users.findById(id);
  res.status(200).json({ user: user.toAuthJSON() });
});

module.exports = router;
