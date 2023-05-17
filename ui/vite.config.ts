import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/plugin/bcms-plugin---name',
  plugins: [tsconfigPaths(), vue(), vueJsx()],
  build: {
    outDir: '../dist/ui',
  },
  optimizeDeps: {
    include: ['@becomes/cms-sdk'],
  },
});
