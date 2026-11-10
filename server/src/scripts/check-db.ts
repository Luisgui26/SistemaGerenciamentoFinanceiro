import { pool } from '../db/index.js';
try {
  await pool.query('select 1');
  console.log('Conexão com PostgreSQL confirmada.');
} catch {
  console.error(
    'Não foi possível conectar ao PostgreSQL. Verifique o .env e a rede.',
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
