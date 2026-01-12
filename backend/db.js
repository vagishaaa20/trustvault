const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "vvss",
  database: "postgres",
  port: 5432,
});

module.exports = pool;
