import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { app } from './app.js';
import { pool } from './db/index.js';
import { env } from './lib/env.js';

test('API pública, autenticação e proteção de rotas', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    await t.test('health não expõe informações internas', async () => {
      const response = await fetch(`${base}/api/health`);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { status: 'ok' });
      assert.equal(response.headers.get('x-powered-by'), null);
    });
    await t.test('origem desconhecida é rejeitada', async () => {
      const response = await fetch(`${base}/api/health`, {
        headers: { origin: 'https://untrusted.invalid' },
      });
      assert.equal(response.status, 403);
      assert.equal(response.headers.get('access-control-allow-origin'), null);
    });
    await t.test(
      'rotas financeiras não aceitam family_id como autorização',
      async () => {
        for (const path of [
          '/me',
          '/dashboard',
          '/transactions?family_id=qualquer',
        ]) {
          const response = await fetch(`${base}/api${path}`);
          assert.equal(response.status, 401);
        }
      },
    );
    await t.test(
      'Better Auth está montado e não há sessão anônima',
      async () => {
        const ok = await fetch(`${base}/api/auth/ok`);
        assert.equal(ok.status, 200);
        const response = await fetch(`${base}/api/auth/get-session`);
        assert.equal(response.status, 200);
        assert.equal(await response.json(), null);
      },
    );
    await t.test('cadastro público é bloqueado', async () => {
      const response = await fetch(`${base}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: env.CLIENT_ORIGINS[0]!,
        },
        body: JSON.stringify({
          name: 'Blocked',
          email: 'blocked@example.invalid',
          password: 'NotAnActualPassword-123',
        }),
      });
      assert.equal(response.status, 400);
      const body = (await response.json()) as { code: string };
      assert.equal(body.code, 'EMAIL_PASSWORD_SIGN_UP_DISABLED');
    });
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await pool.end();
  }
});
