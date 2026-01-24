const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "khan7209",
  database: "trustvault",
  port: 5432,
});

module.exports = pool;
