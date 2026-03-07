const xo = require('eslint-config-xo');
const globals = require('globals');

const xoConfig = xo.default[0];

module.exports = [
  {
    ignores: ['dist/', 'build/', 'node_modules/', 'package-lock.json'],
  },
  ...xo.default,
  {
    plugins: xoConfig.plugins,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.jest,
      },
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      eqeqeq: ['error', 'always'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/block-spacing': ['error', 'always'],
      '@stylistic/arrow-spacing': ['error', { before: true, after: true }],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/no-trailing-spaces': 'error',
      'no-console': 'off',
      'capitalized-comments': [
        'error',
        'always',
        {
          ignorePattern: 'pragma|ignored',
          ignoreInlineComments: true,
          ignoreConsecutiveComments: true,
        },
      ],
      complexity: ['warn', { max: 40 }],
      'prefer-destructuring': ['off', {
        object: false,
        array: false,
      }],
      'logical-assignment-operators': 'off',
      'no-unneeded-ternary': 'off',
      'require-unicode-regexp': 'off',
    },
  },
];
