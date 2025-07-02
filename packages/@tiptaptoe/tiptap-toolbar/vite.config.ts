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
      name: 'TiptaptoeToolbar',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        '@tiptap/react', 
        '@tiptap/core',
        '@tiptaptoe/ui-components'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@tiptap/react': 'TiptapReact',
          '@tiptap/core': 'TiptapCore',
          '@tiptaptoe/ui-components': 'TiptaptoeUI',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});