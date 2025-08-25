import { defineConfig } from 'vite'

export default defineConfig((command) => {
  console.log('Command:', command)

  // const base = command.mode === 'production' ? '/Portfolio/' : '/'
  const base = '/';

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
