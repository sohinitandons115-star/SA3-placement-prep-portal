import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = fileURLToPath(new URL('../', import.meta.url));
let database;

const connectDB = () => {
  const databasePath = process.env.DB_PATH || path.join(serverDirectory, 'data', 'placement.sqlite');

  if (databasePath !== ':memory:') {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  database = new Database(databasePath);
  database.pragma('foreign_keys = ON');
  database.pragma('journal_mode = WAL');
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      coding_belts TEXT NOT NULL DEFAULT '{"java":0,"cpp":0,"python":0,"javascript":0}',
      communication_score REAL NOT NULL DEFAULT 0,
      attendance TEXT NOT NULL DEFAULT '{"quarterly":0,"yearly":0}',
      viva_score REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      applied_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'Applied'
        CHECK (status IN ('Applied', 'Online Assessment', 'Technical Interview', 'HR Interview', 'Selected', 'Rejected')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS companies_user_date_idx ON companies(user_id, applied_date);

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'DSA'
        CHECK (category IN ('DSA', 'Aptitude', 'Resume', 'Interview Experience', 'Core Subjects')),
      link TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log(`SQLite connected: ${databasePath}`);
  return database;
};

const getDB = () => {
  if (!database) {
    throw new Error('Database is not initialized. Call connectDB() before handling requests.');
  }
  return database;
};

export { getDB };
export default connectDB;
