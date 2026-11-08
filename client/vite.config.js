import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const api = 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [vue()],
  define: {
    __VUE_I18N_FULL_INSTALL__: true,
    __VUE_I18N_LEGACY_API__: false,
    __INTLIFY_PROD_DEVTOOLS__: false,
  },
  server: {
    port: 5173,
    proxy: { '/api': api, '/audio': api, '/assets/maps': api },
  },
});
