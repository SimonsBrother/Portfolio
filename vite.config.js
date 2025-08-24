import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Portfolio/',
  build: {
    outDir: 'dist',
    supported: {
      'top-level-await': true // TODO remove use of top level awaits
    },
  }
})
