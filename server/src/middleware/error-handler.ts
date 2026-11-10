import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Dados inválidos.',
      fields: error.issues.map((i) => i.path.join('.')),
    });
    return;
  }
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: 'JSON inválido.' });
    return;
  }
  console.error('Falha ao processar requisição.');
  res.status(500).json({ error: 'Não foi possível processar a solicitação.' });
};
