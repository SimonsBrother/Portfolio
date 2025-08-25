import { defineConfig } from 'vite'

export default defineConfig((command, mode) => {
  console.log('Command:', command) // 'serve' or 'build'
  console.log('Mode:', mode)       // 'development' or 'production'

  const base = mode === 'production' ? '/Portfolio/' : '/'

  return {
    base,
    build: {
      outDir: 'dist',
      target: 'esnext',
      supported: {
        'top-level-await': true // TODO remove use of top level awaits
      },
    }
  }

})
