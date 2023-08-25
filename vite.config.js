import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/generative-programming' : '/',
  build: {
    target: ['chrome116'],
  },
}))
