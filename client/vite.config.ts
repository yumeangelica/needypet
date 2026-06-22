import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import type { RolldownLogWithString } from 'rolldown';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const isVueUsePureAnnotationWarning = (log: RolldownLogWithString): boolean => {
  if (typeof log === 'string') {
    return false;
  }

  const warningFile = log.id || log.loc?.file || '';
  return (
    log.code === 'INVALID_ANNOTATION' &&
    warningFile.includes('@vueuse/core/dist/index.js') &&
    log.message.includes('/* #__PURE__ */')
  );
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  server: {
    // Pin the dev port so the origin matches the server's ALLOWED_ORIGINS.
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      onLog(level, log, handler) {
        if (level === 'warn' && isVueUsePureAnnotationWarning(log)) {
          return;
        }

        handler(level, log);
      },
      output: {
        manualChunks(id) {
          if (id.includes('src')) {
            return 'src';
          }
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    }
  }
});
