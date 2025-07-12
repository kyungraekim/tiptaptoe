import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TiptaptoeExtensionComments',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'es' : ''}js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@tiptap/core',
        '@tiptap/react',
        'uuid'
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          '@tiptap/core': 'TiptapCore',
          '@tiptap/react': 'TiptapReact',
          'uuid': 'uuid'
        }
      }
    }
  }
})