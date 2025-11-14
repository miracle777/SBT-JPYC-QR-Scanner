import type { ESLint } from 'eslint';

const config: ESLint.ConfigData = {
  extends: ['next'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@next/next/no-img-element': 'off',
  },
};

export default config;
