module.exports = {
    env: {
      browser: true,
      es6: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:security/recommended',
    ],
    globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
    },
    ignorePatterns: ['*.js', 'node_modules/'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      tsconfigRootDir: __dirname,
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
      project: './tsconfig.json',
    },
    plugins: ['prettier', '@typescript-eslint', 'security'],
    settings: {},
    rules: {
      'prettier/prettier': [
        'error',
        {
          semi: true,
          trailingComma: 'all',
          singleQuote: true,
          printWidth: 120,
          tabWidth: 2,
        },
      ],
      '@typescript-eslint/no-use-before-define': 'off',
    },
    overrides: [
      {
        files: ['*.js', '*.jsx'],
        excludedFiles: ['*.ts', '*.tsx'],
        rules: {
          '@typescript-eslint/no-var-requires': 'off',
          '@typescript-eslint/explicit-module-boundary-types': 'off',
          '@typescript-eslint/ban-types': 'off',
        },
      },
      {
        files: ['src/unitTests/__tests__/**', '**/*.js', '**/*.jsx'],
        rules: {
          '@typescript-eslint/explicit-function-return-type': 'off',
        },
      },
    ],
  }