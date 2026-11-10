import { confirm, input, password as passwordPrompt } from '@inquirer/prompts';
import { hashPassword } from 'better-auth/crypto';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, pool } from '../db/index.js';
import { account, user } from '../db/schema.js';
import { env } from '../lib/env.js';

try {
  if (!process.stdin.isTTY) throw new Error('Use um terminal interativo.');
  if (env.NODE_ENV !== 'development') {
    throw new Error('Este comando só pode ser usado no ambiente local.');
  }

  const host = new URL(env.DATABASE_URL).hostname;
  const accepted = await confirm({
    message: `Atualizar a senha local no banco ${host}?`,
    default: false,
  });
  if (!accepted) {
    console.log('Nenhuma alteração foi feita.');
  } else {
    const email = await input({
      message: 'Email da conta:',
      validate: (value) =>
        z.email().safeParse(value.trim().toLowerCase()).success ||
        'Informe um email válido.',
    });
    const secret = await passwordPrompt({
      message: 'Nova senha (12 a 128 caracteres):',
      mask: '*',
      validate: (value) =>
        (value.length >= 12 && value.length <= 128) ||
        'A senha deve ter entre 12 e 128 caracteres.',
    });
    await passwordPrompt({
      message: 'Confirme a senha:',
      mask: '*',
      validate: (value) =>
        value === secret || 'As senhas não coincidem. Tente novamente.',
    });

    const passwordHash = await hashPassword(secret);
    const updated = await db.transaction(async (tx) => {
      const [existingUser] = await tx
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email.trim().toLowerCase()))
        .limit(1);
      if (!existingUser) return false;

      const rows = await tx
        .update(account)
        .set({ password: passwordHash })
        .where(
          and(
            eq(account.userId, existingUser.id),
            eq(account.providerId, 'credential'),
          ),
        )
        .returning({ id: account.id });
      return rows.length > 0;
    });

    if (!updated) {
      console.error('Conta não encontrada neste banco ou sem login por senha.');
      process.exitCode = 1;
    } else {
      console.log('Senha atualizada. Você já pode entrar no sistema local.');
    }
  }
} catch (error) {
  if (!process.stdin.isTTY) {
    console.error('Use este comando em um terminal interativo.');
  } else {
    console.error(
      error instanceof Error
        ? error.message
        : 'Não foi possível atualizar a senha.',
    );
  }
  process.exitCode = 1;
} finally {
  await pool.end();
}
