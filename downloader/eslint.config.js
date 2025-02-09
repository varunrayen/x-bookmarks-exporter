const js = require('@eslint/js');
const perfectionist = require('eslint-plugin-perfectionist');
const prettier = require('eslint-plugin-prettier/recommended');

module.exports = [
  js.configs.recommended,
  prettier,
  perfectionist.configs['recommended-natural'],
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
        // Add Node.js globals
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
      },
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'perfectionist/sort-imports': 'error',
      'perfectionist/sort-objects': 'error',
    },
  },
];
