/**
 * Database Connection
 * ------------------------------------
 * Creates (and reuses) a mysql2 connection pool.
 * Credentials are read from environment variables - never hardcoded.
 * This replaces config/database.php (getDBConnection()).
 */
import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      decimalNumbers: true,
      // Return DATE/DATETIME columns as plain strings (e.g. "2026-06-24")
      // instead of JS Date objects, matching the PHP version's output.
      dateStrings: true,
    });
  }
  return pool;
}

/**
 * query(sql, params)
 * Runs a parameterized query and returns just the rows/result.
 * Always use parameterized queries (never string-concatenate user input).
 */
export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

/**
 * getConnection()
 * Grabs a single connection from the pool for manual transactions
 * (BEGIN / COMMIT / ROLLBACK), mirroring the PDO beginTransaction()
 * usage in the original borrow/return handlers.
 */
export async function getConnection() {
  return getPool().getConnection();
}
