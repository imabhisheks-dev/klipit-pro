import { Pool, Client } from 'pg';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://klipit:klipit@localhost:5432/klipit',
  max: parseInt(process.env.DB_POOL_SIZE || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connection test:', result.rows[0]);
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export async function initializeDatabase(): Promise<void> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://klipit:klipit@localhost:5432/klipit',
  });

  try {
    await client.connect();
    console.log('Initializing database schema...');

    // Create extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS clipboards (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        handle VARCHAR(255) UNIQUE NOT NULL,
        content TEXT,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        is_public BOOLEAN DEFAULT true,
        is_pro BOOLEAN DEFAULT false,
        password_protected BOOLEAN DEFAULT false,
        password_hash VARCHAR(255),
        read_only BOOLEAN DEFAULT false,
        data_retention_days INTEGER DEFAULT 1,
        syntax_highlight VARCHAR(50),
        expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        clipboard_id UUID REFERENCES clipboards(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(512) NOT NULL,
        file_size BIGINT,
        mime_type VARCHAR(100),
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pro_subscriptions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        tier VARCHAR(50) DEFAULT 'pro',
        max_clipboards INTEGER DEFAULT 100,
        max_file_size BIGINT DEFAULT 1073741824,
        max_storage BIGINT DEFAULT 10737418240,
        data_retention_years INTEGER DEFAULT 5,
        custom_domain_enabled BOOLEAN DEFAULT false,
        api_access_enabled BOOLEAN DEFAULT true,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        invalid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS clipboard_versions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        clipboard_id UUID REFERENCES clipboards(id) ON DELETE CASCADE,
        content TEXT,
        changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_clipboard_handle ON clipboards(handle);
      CREATE INDEX IF NOT EXISTS idx_clipboard_expires_at ON clipboards(expires_at);
      CREATE INDEX IF NOT EXISTS idx_clipboard_user_id ON clipboards(user_id);
      CREATE INDEX IF NOT EXISTS idx_files_clipboard_id ON files(clipboard_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_pro_subscriptions_user_id ON pro_subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_clipboard_versions_clipboard_id ON clipboard_versions(clipboard_id);
    `);

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  } finally {
    await client.end();
  }
}

export function getPool() {
  return pool;
}

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
