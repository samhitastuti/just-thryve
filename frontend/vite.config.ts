import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // The target for the dev-server proxy. Falls back to localhost when API_URL is not set.
  const backendUrl = env.API_URL || 'http://localhost:8000';

  // All FastAPI route prefixes that must be forwarded to the backend.
  // The Vite dev-server proxies these paths so the browser always makes
  // same-origin requests, avoiding CORS and mixed-content errors when the
  // frontend is accessed via a public URL (e.g. AI Studio / Cloud Run).
  const apiPaths = [
    '/auth', '/loans', '/offers', '/consent', '/repayment',
    '/dashboard', '/audit-logs', '/esg', '/notifications',
    '/ocen', '/profile', '/health',
  ];
  const proxyEntries = Object.fromEntries(
    apiPaths.map(p => [p, { target: backendUrl, changeOrigin: true }]),
  );

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // When API_URL is not set, inject an empty string so the frontend uses
      // relative URLs (e.g. /auth/login) that the Vite proxy forwards to the
      // backend. Set API_URL in frontend/.env to use an explicit backend URL.
      'process.env.API_URL': JSON.stringify(env.API_URL ?? ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: proxyEntries,
    },
  };
});
