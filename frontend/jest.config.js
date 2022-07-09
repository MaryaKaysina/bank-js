// eslint-disable-next-line no-undef
module.exports = {
  transform: {
    '\\.js$': '<rootDir>/node_modules/babel-jest',
  },
  testEnvironment: 'jsdom',
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
