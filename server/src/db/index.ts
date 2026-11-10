import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '../lib/env.js';
import * as schema from './schema.js';

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});
pool.on('error', () =>
  console.error('Conexão ociosa com o banco foi interrompida.'),
);
export const db = drizzle(pool, { schema });
