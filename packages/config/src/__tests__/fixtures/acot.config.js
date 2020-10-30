module.exports = {
  extends: ['./chain.js'],
  rules: {
    '@acot/test/rule1': 'error',
    '@acot/test/rule2': 'warn',
    '@acot/test/rule3': 'off',
  },
};
