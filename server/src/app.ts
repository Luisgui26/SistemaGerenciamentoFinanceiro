import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { env } from './lib/env.js';
import { financialRouter } from './routes/financial.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use((req, res, next) => {
  if (req.headers.origin && !env.CLIENT_ORIGINS.includes(req.headers.origin)) {
    res.status(403).json({ error: 'Origem não autorizada.' });
    return;
  }
  next();
});
app.use(
  cors({
    origin: env.CLIENT_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
);
// Express 5: wildcard nomeado, antes do parser JSON.
app.all('/api/auth/*splat', toNodeHandler(auth));
app.use(express.json({ limit: '16kb' }));
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api', financialRouter);
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});
app.use(errorHandler);
