const mysql = require("mysql2");
const dotenv = require("dotenv").config();
const dbConnect = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
});
// console.log(process.env.DATABASE);
dbConnect.connect((err) => {
  if (err) {
    console.log("db is DISConnected", err);
    process.exit(1);
  } else {
    console.log("db is connected");
  }
});

module.exports = dbConnect;
