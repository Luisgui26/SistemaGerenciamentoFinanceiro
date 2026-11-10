import { createAuthClient } from 'better-auth/react';

// /api é servido pelo proxy local e, em produção, pelo proxy do mesmo domínio.
export const authClient = createAuthClient();
