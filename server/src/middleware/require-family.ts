import type { RequestHandler } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { eq } from 'drizzle-orm';
import { auth } from '../auth.js';
import { db } from '../db/index.js';
import { familyMembers, families } from '../db/schema.js';

export const requireFamily: RequestHandler = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    res.status(401).json({ error: 'Faça login para continuar.' });
    return;
  }
  const [membership] = await db
    .select({
      familyId: familyMembers.familyId,
      role: familyMembers.role,
      familyName: families.name,
    })
    .from(familyMembers)
    .innerJoin(families, eq(families.id, familyMembers.familyId))
    .where(eq(familyMembers.userId, session.user.id))
    .limit(1);
  if (!membership) {
    res.status(403).json({ error: 'Usuário sem acesso à família.' });
    return;
  }
  res.locals.identity = {
    userId: session.user.id,
    name: session.user.name,
    ...membership,
  };
  next();
};
