"use strict";
const User = require("../../model/user/userModel");

exports.signIn = async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({
      status: "failed",
      message: "Content can not be empty!",
    });
    return;
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const data = await User.signin(user);
    res.json({
      ...data,
    });
  } catch (err) {
    console.log(err);
    const statusCode = Number.isInteger(err.code) ? err.code : 500;
    res.status(statusCode).send({
      status: "failed",
      message: err.message || "Some error occurred while login.",
    });
  }
};

exports.signUp = async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send({
      status: "failed",
      message: "Content can not be empty!",
    });
    return;
  }

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  try {
    const data = await User.signup(user);
    res.json({
      ...data,
    });
  } catch (err) {
    const statusCode = Number.isInteger(err.code) ? err.code : 500;
    res.status(statusCode).send({
      status: "failed",
      message: err.message || "Some error occurred while creating user.",
    });
  }
};
