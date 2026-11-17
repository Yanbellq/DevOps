import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  root: path.resolve(import.meta.dirname, 'apps/frontend'),
  plugins: [react()],
  build: {
    outDir: path.resolve(import.meta.dirname, 'apps/frontend/dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  fmt: {
    ignorePatterns: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      'helm/**/templates/**',
    ],
    ignorePatterns: ['**/dist/**', '**/node_modules/**', '**/.turbo/**', 'helm/**/templates/**'],
    singleQuote: true,
    semi: true,
    printWidth: 90,
    useTabs: false,
    tabWidth: 2,
    trailingComma: 'all',
    arrowParens: 'avoid',
    proseWrap: 'always',
    bracketSpacing: true,
    bracketSameLine: false,
    endOfLine: 'lf',

    sortPackageJson: true,
    sortImports: {
      newlinesBetween: true,
      groups: [
        ['value-builtin', 'value-external'],
        'value-parent',
        ['value-sibling', 'value-index'],
        'unknown',
      ],
    },

    overrides: [
      {
        files: ['apps/frontend/**'],
        options: {
          jsxSingleQuote: true,
          htmlWhitespaceSensitivity: 'ignore',
          sortTailwindcss: true,
        },
      },
      {
        files: ['**/*.md'],
        options: { proseWrap: 'always' },
      },
    ],
  },
  lint: {
    plugins: ['typescript', 'unicorn', 'oxc'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'typescript/no-floating-promises': 'warn',
      'typescript/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'typescript/no-unsafe-type-assertion': 'off',
      'vite-plus/prefer-vite-plus-imports': 'error',
    },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: [
      '.turbo/',
      '.next/',
      'dist/',
      'build/',
      'temp/',
      '**/.client/**',
      '**/client/**',
      '**/node_modules/**',
      '**/migrations/**',
      '**/certs/**',
    ],
    categories: {
      correctness: 'error',
      suspicious: 'warn',
      perf: 'warn',
    },
    env: { builtin: true },
    overrides: [
      {
        files: ['apps/frontend/**/*.{ts,tsx}'],
        plugins: ['react', 'nextjs'],
        rules: {
          'typescript/no-explicit-any': 'error',
          'react/jsx-key': 'error',
          'react/no-unknown-property': 'error',
          'react/react-in-jsx-scope': 'off',
          'react/self-closing-comp': 'error',
        },
      },
      {
        files: ['apps/backend/**/*.ts'],
        env: { node: true },
        rules: {
          'typescript/no-explicit-any': 'warn',
          'typescript/no-unsafe-assignment': 'warn',
          'typescript/no-unsafe-member-access': 'warn',
          'typescript/no-unsafe-call': 'warn',
          'typescript/no-unsafe-return': 'warn',
          'typescript/no-unsafe-argument': 'warn',
          'typescript/no-extraneous-class': ['warn', { allowWithDecorator: true }],
        },
      },
      {
        files: ['**/*.test.ts', '**/*.spec.ts'],
        plugins: ['vitest'],
        rules: {
          'vitest/no-disabled-tests': 'error',
        },
      },
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'frontend',
          root: path.resolve(import.meta.dirname, 'apps/frontend'),
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: [
            path.resolve(import.meta.dirname, 'apps/frontend/src/test-setup.ts'),
          ],
        },
      },
      {
        test: {
          name: 'backend',
          root: path.resolve(import.meta.dirname, 'apps/backend'),
          environment: 'node',
          include: ['src/**/*.spec.ts'],
        },
      },
    ],
  },
  staged: { '*': 'vp check --fix' },
});
