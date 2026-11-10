import { Router } from 'express';
import { requireFamily } from '../middleware/require-family.js';

export const financialRouter = Router();
financialRouter.use(requireFamily);
financialRouter.get('/me', (_req, res) => {
  res.json(res.locals.identity);
});

// Todos os handlers futuros usam res.locals.identity.familyId, nunca o family_id do cliente.
financialRouter.route('/transactions').all((_req, res) => {
  res
    .status(501)
    .json({ error: 'Movimentações serão implementadas na próxima etapa.' });
});
financialRouter.route('/transactions/:id').all((_req, res) => {
  res
    .status(501)
    .json({ error: 'Movimentações serão implementadas na próxima etapa.' });
});
financialRouter.get('/dashboard', (_req, res) => {
  res
    .status(501)
    .json({ error: 'Dashboard será implementado na próxima etapa.' });
});
