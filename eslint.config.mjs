import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import visualComplexity from 'eslint-plugin-visual-complexity';

export default [
  {
    ignores: ['dist', 'examples'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  // all files
  {
    files: ['**/*.ts'],
    rules: {
      'no-console': 'error',
    },
  },
  // src files
  {
    files: ['src/**/*.ts'],
    plugins: {
      visual: visualComplexity,
    },
    rules: {
      'visual/complexity': ['error', { max: 5 }],
      complexity: 0,
      'max-depth': ['error', { max: 2 }],
      'max-nested-callbacks': ['error', { max: 2 }],
      'max-params': ['error', { max: 4 }],
      'max-statements': ['error', { max: 12 }, { ignoreTopLevelFunctions: false }],
      'max-len': ['error', { code: 120, ignoreUrls: true }],
      'max-lines': ['error', { max: 200, skipComments: true, skipBlankLines: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['test/**/*.{ts,js}'],
    plugins: {
      playwright,
    },
    rules: {
      'max-params': 0,
      'max-statements': 0,
      'no-empty-pattern': 0,
      complexity: 0,
      '@typescript-eslint/no-empty-function': 0,
      'playwright/no-focused-test': 'error',
    },
  },
];
