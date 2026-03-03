import path from 'path';
import type { ServerResponse } from 'http';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const HASHED_ASSET_RE = /-[a-z0-9]{8,}\./i;
const STATIC_ASSET_RE = /\.(css|js|mjs|json|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|otf)$/i;

const normalizeContentType = (url: string, res: ServerResponse) => {
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl === '/' || cleanUrl.endsWith('.html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return;
  }
  if (cleanUrl.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    return;
  }
  if (cleanUrl.endsWith('.js') || cleanUrl.endsWith('.mjs') || cleanUrl.endsWith('.ts') || cleanUrl.endsWith('.tsx') || cleanUrl.endsWith('.jsx')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    return;
  }
  if (cleanUrl.endsWith('.json')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
};

const applyResponseHeaders = (url: string, res: ServerResponse) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.removeHeader('Expires');
  res.removeHeader('X-XSS-Protection');

  if (STATIC_ASSET_RE.test(url) && HASHED_ASSET_RE.test(url)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return;
  }

  if (STATIC_ASSET_RE.test(url)) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return;
  }

  res.setHeader('Cache-Control', 'no-store');
};

const responseHardeningPlugin = () => ({
  name: 'response-hardening-plugin',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: ServerResponse, next: () => void) => {
      const url = req.url || '';
      const rawWriteHead = res.writeHead;
      res.writeHead = function (...args: any[]) {
        normalizeContentType(url, res);
        return rawWriteHead.apply(this, args as [any]);
      } as typeof res.writeHead;
      applyResponseHeaders(url, res);
      next();
    });
  },
  configurePreviewServer(server: any) {
    server.middlewares.use((req: any, res: ServerResponse, next: () => void) => {
      const url = req.url || '';
      const rawWriteHead = res.writeHead;
      res.writeHead = function (...args: any[]) {
        normalizeContentType(url, res);
        return rawWriteHead.apply(this, args as [any]);
      } as typeof res.writeHead;
      applyResponseHeaders(url, res);
      next();
    });
  },
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3002,
        host: '0.0.0.0',
      },
      plugins: [react(), responseHardeningPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
