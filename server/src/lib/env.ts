import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

config({
  path: fileURLToPath(new URL('../../../.env', import.meta.url)),
  quiet: true,
});

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  DATABASE_URL: z.url().refine((v) => v.startsWith('postgres')),
  DATABASE_URL_UNPOOLED: z.url().refine((v) => v.startsWith('postgres')),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32)
    .refine((value) => !value.startsWith('gere-um-segredo-')),
  BETTER_AUTH_URL: z.url(),
  CLIENT_ORIGINS: z
    .string()
    .transform((v) => v.split(',').map((s) => s.trim()))
    .pipe(z.array(z.url()).min(1)),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(
    `Variáveis de ambiente inválidas: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`,
  );
}
export const env = parsed.data;
if (
  env.NODE_ENV === 'production' &&
  [env.BETTER_AUTH_URL, ...env.CLIENT_ORIGINS].some(
    (v) => !v.startsWith('https://'),
  )
) {
  throw new Error('Produção exige HTTPS na API e nas origens autorizadas.');
}
