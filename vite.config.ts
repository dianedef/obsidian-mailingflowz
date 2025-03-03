import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'

export default defineConfig({
  plugins: [
    vue(),
    commonjs({
      include: /node_modules/,
      transformMixedEsModules: true,
      ignore: ['electron', 'child_process', 'os', 'path', '@electron/remote']
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    })
  ],
  build: {
    outDir: '.',
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      formats: ['cjs'],
      fileName: () => 'main.js'
    },
    rollupOptions: {
      external: [
        'obsidian', 
        'electron',
        'child_process',
        'os',
        'path',
        '@electron/remote'
      ],
      output: {
        format: 'cjs',
        exports: 'default',
        globals: {
          obsidian: 'obsidian',
          electron: 'electron',
          child_process: 'child_process',
          os: 'os',
          path: 'path',
          '@electron/remote': '@electron/remote'
        }
      }
    },
    emptyOutDir: false,
    sourcemap: 'inline'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}) 