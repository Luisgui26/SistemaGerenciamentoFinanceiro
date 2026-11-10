import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

async function waitForApi(port: string, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  const url = `http://127.0.0.1:${port}/api/health`;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(500),
      });
      if (response.ok) return;
    } catch {
      // A API sobe em paralelo com o Vite; tente de novo até ela responder.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`A API não respondeu em ${url} após ${timeoutMs / 1000}s.`);
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(
    mode,
    fileURLToPath(new URL('../', import.meta.url)),
    'PORT',
  );
  const apiPort = env.PORT || '3001';
  await waitForApi(apiPort);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${apiPort}`,
          changeOrigin: false,
        },
      },
    },
  };
});
