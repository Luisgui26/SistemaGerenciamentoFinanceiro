import { randomUUID } from 'node:crypto';
import { hashPassword } from 'better-auth/crypto';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { user, account, families, familyMembers } from '../db/schema.js';

export const newMemberSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(12).max(128),
  familyName: z.string().trim().min(2).max(100),
  role: z.enum(['admin', 'member']),
});

export class DuplicateEmailError extends Error {
  constructor() {
    super('Email já cadastrado.');
  }
}

// Executado somente pelo operador com acesso ao banco, nunca por uma rota HTTP.
export async function provisionUser(input: z.input<typeof newMemberSchema>) {
  const data = newMemberSchema.parse(input);
  const passwordHash = await hashPassword(data.password);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(74201926)`);
    const [existingUser] = await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, data.email))
      .limit(1);
    if (existingUser) throw new DuplicateEmailError();
    let [family] = await tx.select({ id: families.id }).from(families).limit(1);
    const firstMember = !family;
    if (!family) {
      [family] = await tx
        .insert(families)
        .values({ name: data.familyName })
        .returning({ id: families.id });
    }
    if (!family) throw new Error('Não foi possível preparar a família.');
    const id = randomUUID();
    await tx.insert(user).values({ id, name: data.name, email: data.email });
    await tx.insert(account).values({
      id: randomUUID(),
      userId: id,
      accountId: id,
      providerId: 'credential',
      password: passwordHash,
    });
    const role = firstMember ? 'admin' : data.role;
    await tx
      .insert(familyMembers)
      .values({ familyId: family.id, userId: id, role });
    return { id, role };
  });
}
