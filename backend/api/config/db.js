
const mysql = require('mysql2/promise');

let pool;
let isConnected = false;

async function createPoolWithRetry() {
  while (!isConnected) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      // Test connection
      await pool.getConnection();
      isConnected = true;
      console.log('MySQL pool connected');
    } catch (err) {
      console.log('MySQL pool connection failed, retrying in 5 seconds...', err.message);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

createPoolWithRetry();

module.exports = {
  getPool: () => pool
};
