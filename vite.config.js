import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// خروجی یک فایل HTML مستقل، مثل نسخه‌ی اصلی
export default defineConfig({
  plugins: [viteSingleFile()],
  server: { host: '0.0.0.0', allowedHosts: true },
  build: { outDir: 'dist', assetsInlineLimit: 100000000, cssCodeSplit: false },
});
