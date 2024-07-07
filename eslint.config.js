import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'


export default [
  {files: ['src/**/*.{js,ts}', 'test/**/*.{js,ts}', 'eslint.config.js']},
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'indent': ['error', 2],
      'semi': ['error', 'never'],
      'quotes': ['error', 'single']
    }
  }
]