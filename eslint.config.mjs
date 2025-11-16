import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
];
