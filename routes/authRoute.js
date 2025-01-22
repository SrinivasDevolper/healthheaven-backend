const express = require("express");
const RouterAuth = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dbConnect = require("../config/db");
const dotenv = require("dotenv");
dotenv.config();
RouterAuth.post("/register", async (req, res) => {
  const { name, email, password, role = "user" } = req.body;
  const bcryptPassword = await bcrypt.hash(password, 10);
  if (!name || !email || !password) {
    return res.status(400).send("Please Enter Full details");
  } else {
    const getUserData = `
        SELECT * FROM healthhaven.users
        WHERE email = ?
    `;
    dbConnect.query(getUserData, [email], (err, result) => {
      console.log("user data", result);
      if (err) {
        res.status(400).send({ message: "Get Query Error" });
      } else {
        if (result.length > 0) {
          console.log("register Ok");
          res.status(422).send({ message: "User Already Exists" });
        } else {
          if (!bcryptPassword) {
            return res.status(404).send("password hashing error");
          }
          //created profile here
          const postProfileData = `
                          INSERT INTO
                          healthhaven.users(name, email, password,role)
                          VALUES (?, ?, ?,?)
                        `;
          dbConnect.query(
            postProfileData,
            [name, email, bcryptPassword, role],
            (err, result) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .send({ message: "Error inserting into login table" });
              }
              // If the first query succeeds, execute the second query
              res
                .status(200)
                .send({ message: "User details successfully added" });
            }
          );
        }
      }
    });
  }
});

RouterAuth.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.send({ message: "Please Fill All details" });
  } else {
    const getUserData = `
      SELECT * FROM healthhaven.users WHERE email = ?
    `;
    dbConnect.query(getUserData, [email], async (err, result) => {
      if (err) {
        return res.status(400).send({ message: "Get Query Error" });
      }
      if (result.length === 0) {
        console.log("register Ok");
        return res
          .status(402)
          .send({ message: "Please register for an account" });
      } else {
        const comparePassword = await bcrypt.compare(
          password,
          result[0].password
        );
        // console.log(comparePassword, "compare", result[0].password);
        if (!comparePassword) {
          return res.status(404).send({ message: "Invalid Password" });
        } else {
          const payload = { email, role: result[0].role, id: result[0].id };
          const jwtToken = jwt.sign(payload, process.env.SECRET_TOKEN, {
            expiresIn: "30d",
          });
          return res.status(200).json({ jwtToken, payload });
        }
      }
    });
  }
});

module.exports = RouterAuth;
