"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    port: Number(process.env.DB_PORT) || 5432,
    password: process.env.DB_PASSWORD || "MyPassword05",
    database: process.env.DB_NAME || "postgres",
});
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield pool.connect();
    try {
        yield client.query(`
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
    }
    catch (err) {
        console.error("Error initializing database:", err);
    }
    finally {
        client.release();
    }
});
exports.initializeDatabase = initializeDatabase;
exports.default = pool;
//# sourceMappingURL=database.js.map