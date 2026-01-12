const pool = require("./db");

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("DB connected at:", res.rows[0]);
  } catch (err) {
    console.error("DB connection error:", err);
  }
}

testConnection();
