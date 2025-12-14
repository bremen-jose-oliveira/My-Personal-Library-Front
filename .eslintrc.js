// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: ['/dist/*'],
  rules: {
    // Disable import resolution errors for native modules that work at runtime
    'import/no-unresolved': 'off',
  },
};
