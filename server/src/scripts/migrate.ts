import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { fileURLToPath } from 'node:url';
import { env } from '../lib/env.js';

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL_UNPOOLED,
  max: 1,
  connectionTimeoutMillis: 10000,
});
try {
  await migrate(drizzle(pool), {
    migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)),
  });
  console.log('Migrações aplicadas.');
} catch {
  console.error(
    'Falha na migração. Verifique a conexão e as migrações versionadas.',
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
