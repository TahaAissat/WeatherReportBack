var express = require("express");
var router = express.Router();
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { checkBody } = require("../modules/checkBody");

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "password", "email"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  User.findOne({ email: req.body.email }).then((userData) => {
    if (userData) {
      res.json({
        result: false,
        error: "An account with this email already exists",
      });
    } else {
      const token = uid2(32);
      const hash = bcrypt.hashSync(req.body.password, 10);
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: token,
        favorites: [],
      });
      newUser.save().then((userData) => {
        res.json({
          result: true,
          data: {
            username: userData.username,
            token: userData.token,
            favorites: [],
          },
        });
      });
    }
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  User.findOne({ email: req.body.email }).then((userData) => {
    if (!userData) {
      res.json({
        result: false,
        error: "There is no account associated with this email",
      });
    } else {
      if (
        userData &&
        bcrypt.compareSync(req.body.password, userData.password)
      ) {
        res.json({
          result: true,
          data: {
            username: userData.username,
            token: userData.token,
            favorites: userData.favorites,
          },
        });
      } else {
        res.json({
          result: false,
          error: "The password does not match the account",
        });
      }
    }
  });
});

module.exports = router;
