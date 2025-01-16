const express = require("express");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }
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
