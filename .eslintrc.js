module.exports = {
  env: {
    es6: true,
    node: true
  },
  plugins: ["jest"],
  extends: [
    'airbnb-base',
    "plugin:jest/recommended",
    "plugin:jest/style"
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    indent: ["error", 4]
  }
};
