import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'QuillClausula',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'quill-clausula.mjs' : 'quill-clausula.js',
    },
    rollupOptions: {
      external: ['quill', 'parchment', 'quill-delta'],
      output: {
        globals: {
          quill: 'Quill',
        },
        assetFileNames: 'quill-clausula.[ext]',
      },
    },
  },
});
