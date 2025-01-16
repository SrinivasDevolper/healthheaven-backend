const express = require("express");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization.split(" ")[1]) {
    // console.log(authorization, "authorization");
    return res.status(404).send("Please Login");
  }
  const jwtToken = authorization.split(" ")[1];
  // console.log("jwtToken", jwtToken);
  jwt.verify(
    jwtToken,
    process.env.SECRET_TOKEN,
    {
      expiresIn: "30d",
    },
    (err, result) => {
      if (err) {
        console.log(err, "err");
        return res.status(401).send("Invalid jwtToken");
      } else {
        // console.log(result);
        req.users = result;
        next();
      }
    }
  );
};

module.exports = authMiddleware;
