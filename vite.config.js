import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/programming' : '/',
  build: {
    target: ['chrome116'],
  },
}))
