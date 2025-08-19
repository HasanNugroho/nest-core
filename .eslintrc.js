module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // spacing di dalam object/curly braces
    'object-curly-spacing': ['error', 'always'],
    // trailing comma untuk multiline
    'comma-dangle': ['error', 'always-multiline'],
    // optional: newline di parameter multiline constructor
    '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
  },
};
