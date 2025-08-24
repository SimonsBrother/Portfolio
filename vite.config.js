import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    target: 'esnext',
    supported: {
      'top-level-await': true // TODO remove use of top level awaits
    },
  }
})
