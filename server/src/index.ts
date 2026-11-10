import { app } from './app.js';
import { pool } from './db/index.js';
import { env } from './lib/env.js';

const server = app.listen(env.PORT, '127.0.0.1', () =>
  console.log(`API disponível na porta ${env.PORT}.`),
);
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    server.close(() => {
      void pool.end().then(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
}
