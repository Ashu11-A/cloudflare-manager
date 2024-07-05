import { defineConfig } from 'tsup'
import { glob } from 'glob'

export default defineConfig({
  format: 'esm',
  entry: ['src/**/*.ts'],
  bundle: false,
  platform: 'node',
  skipNodeModulesBundle: true,
  splitting: false,
  clean: true,
  // dts: true
})