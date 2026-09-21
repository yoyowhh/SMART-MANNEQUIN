"use strict";

const moment = require("moment-timezone");
const db = require("../../dbconfig");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../../utils");
const bcrypt = require("bcryptjs");
const { validateEmail, validatePassword } = require("../../utils/validation");

const bcryptSalt = 10;

const User = function (user) {
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
};

User.signup = async (newUser) => {
  // check if payload is empty
  if (!newUser.email || !newUser.name || !newUser.password) {
    throw { code: 400, message: "name, email, and password cannot be empty" };
  }

  // Check if email is valid
  if (!validateEmail(newUser.email)) {
    throw { code: 400, message: "Email is not valid" };
  }

  // Check if email already exist
  const queryCheck = `SELECT * FROM users WHERE email = ?`;
  const [rowsCheck, fieldsCheck] = await db.execute(queryCheck, [
    newUser.email,
  ]);
  if (rowsCheck.length) {
    throw { code: 400, message: "Email already exist" };
  }

  // password length is at least 8 characters
  if (!validatePassword(newUser.password)) {
    throw { code: 400, message: "Password must be at least 8 characters" };
  }

  // Hash password
  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashedPassword = bcrypt.hashSync(newUser.password, salt);

  // Generate token
  const token = await generateAccessToken({ email: newUser.email });

  try {
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    const [rows, fields] = await db.execute(query, [
      newUser.name,
      newUser.email,
      hashedPassword,
    ]);
    return {
      // id: rows.insertId,
      // email: newUser.email
      name: newUser.name,
      token,
      expired_at: moment
        .tz(new Date(), "Asia/Jakarta")
        .add(1, "hours")
        .format("YYYY-MM-DD HH:mm:ss"),
    };
  } catch (err) {
    console.error("Error in User.create:", err);
    throw err;
  }
};

User.signin = async (user) => {
  // check if payload is empty
  if (!user.email || !user.password) {
    throw { code: 400, message: "email and password cannot be empty" };
  }

  try {
    // check if email exist
    const query = `SELECT * FROM users WHERE email = ?`;
    const [rows] = await db.execute(query, [user.email]);

    if (!rows.length) {
      throw { code: 404, message: "wrong email or password" };
    }

    // check password if is match
    const isPasswordMatch = bcrypt.compareSync(user.password, rows[0].password);

    if (isPasswordMatch) {
      const token = await generateAccessToken({ email: user.email });

      return {
        name: rows[0].name,
        email: rows[0].email,
        token,
        expired_at: moment
          .tz(new Date(), "Asia/Jakarta")
          .add(1, "hours")
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    } else {
      throw { code: 404, message: "wrong email or password" };
    }
  } catch (err) {
    console.error("Error in User.signin:", err);
    throw err;
  }
};

module.exports = User;
