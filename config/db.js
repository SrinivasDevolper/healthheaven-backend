const mysql = require("mysql2");
const dotenv = require("dotenv").config();
const dbConnect = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
// console.log(process.env.DATABASE);
dbConnect.getConnection((err, connection) => {
  if (err) {
    console.log("db is DISConnected", err);
    process.exit(1);
    return;
  } else {
    console.log("db is connected");
    connection.release();
  }
});

module.exports = dbConnect;
