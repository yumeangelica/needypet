module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: 'xo',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    indent: ['error', 2], // Indent with 2 spaces
    eqeqeq: ['error', 'always'], // Always use === and !==
    'object-curly-spacing': ['error', 'always'], // Space between curly braces in objects
    'block-spacing': ['error', 'always'], // Space between curly braces in functions
    'arrow-spacing': [ // Space before and after arrow functions
      'error', { before: true, after: true },
    ],
    quotes: ['error', 'single'], // Single quotes
    semi: ['error', 'always'], // Semicolons
    'no-trailing-spaces': 'error',
    'no-console': 0, // Allow console.log
  },
};
