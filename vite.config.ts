import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages プロジェクトサイト: https://<user>.github.io/web-pdf-editor/
const base = process.env.GH_PAGES === 'true' ? '/web-pdf-editor/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
  assetsInclude: ['**/*.wasm'],
});
