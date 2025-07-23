import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TiptaptoeAICore',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@tauri-apps/api'],
      output: {
        globals: {
          '@tauri-apps/api': 'TauriAPI',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});