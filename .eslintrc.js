module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    '@vue/prettier',
    '@vue/prettier/@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': [
      2,
      { args: 'all', argsIgnorePattern: '^_' },
    ],
    "no-shadow": "error",
    "no-unused-labels": "error",
    "no-unused-expressions": "error",
    "no-duplicate-imports": "error",
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true,
      },
    ],
  },
};
