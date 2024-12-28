import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  port: Number(process.env.DB_PORT) || 5432,
  password: process.env.DB_PASSWORD || "MyPassword05",
  database: process.env.DB_NAME || "postgres",
});

export const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS lpr_events (
          id SERIAL PRIMARY KEY,
          plate_number VARCHAR(20) NOT NULL,
          event_type VARCHAR(10) NOT NULL CHECK (event_type IN ('entry', 'exit')),
          event_time TIMESTAMP DEFAULT NOW(),
          metadata JSONB
      );

      CREATE TABLE IF NOT EXISTS lpr_sessions (
          session_id SERIAL PRIMARY KEY,
          plate_number VARCHAR(20) NOT NULL,
          session_start TIMESTAMP DEFAULT NOW(),
          session_end TIMESTAMP,
          metadata JSONB
      );
    `);
    console.log("Database tables created or already exist.");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    client.release();
  }
};

export default pool;