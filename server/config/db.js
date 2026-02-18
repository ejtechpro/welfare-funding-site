// db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: "localhost",
  user: "teamnost_t_user",
  password: "@dev.ej1",
  database: "teamnost_t_db",
  port: 3306,
});

module.exports = db;
