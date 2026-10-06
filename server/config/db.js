import pg from 'pg';

const { Pool } = pg;
let pool;

const initializeSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      coding_belts JSONB NOT NULL DEFAULT '{"java":0,"cpp":0,"python":0,"javascript":0}'::jsonb,
      communication_score DOUBLE PRECISION NOT NULL DEFAULT 0,
      attendance JSONB NOT NULL DEFAULT '{"quarterly":0,"yearly":0}'::jsonb,
      viva_score DOUBLE PRECISION NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS companies (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      applied_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'Applied'
        CHECK (status IN ('Applied', 'Online Assessment', 'Technical Interview', 'HR Interview', 'Selected', 'Rejected')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS companies_user_date_idx ON companies(user_id, applied_date DESC);

    CREATE TABLE IF NOT EXISTS resources (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'DSA'
        CHECK (category IN ('DSA', 'Aptitude', 'Resume', 'Interview Experience', 'Core Subjects')),
      link TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

const connectDB = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to connect to PostgreSQL.');
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
  });
  await pool.query('SELECT 1');
  await initializeSchema();
  console.log('PostgreSQL connected');
  return pool;
};

const getDB = () => {
  if (!pool) {
    throw new Error('Database is not initialized. Call connectDB() before handling requests.');
  }
  return pool;
};

const setPoolForTests = (testPool) => {
  pool = testPool;
};

export { getDB, initializeSchema, setPoolForTests };
export default connectDB;
