import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TiptaptoeAIReact',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@tiptaptoe/ai-core', '@tiptaptoe/ui-components'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@tiptaptoe/ai-core': 'TiptaptoeAICore',
          '@tiptaptoe/ui-components': 'TiptaptoeUI',
        },
        assetFileNames: 'styles.css',
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    emptyOutDir: true,
  },
});