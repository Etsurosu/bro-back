/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { Schema } = mongoose;

const UsersSchema = new Schema({
  pseudo: { type: String, unique: true, required: true, dropDups: true },
  hash: String,
  salt: String
});

UsersSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
  return this.hash === hash;
};

UsersSchema.methods.generateJWT = function() {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      pseudo: this.pseudo,
      exp: parseInt(expirationDate.getTime() / 1000, 10)
    },
    "broback"
  );
};

UsersSchema.methods.toAuthJSON = function() {
  return {
    pseudo: this.pseudo,
    token: this.generateJWT()
  };
};

UsersSchema.methods.toMeJSON = function() {
  return {
    pseudo: this.pseudo
  };
};

mongoose.model("Users", UsersSchema);
