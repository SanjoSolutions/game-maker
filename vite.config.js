import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/generative-game' : '/',
  build: {
    target: ['chrome116'],
  },
}))
