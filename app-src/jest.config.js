// The conversion engine is pure TypeScript (no React Native imports), so it runs
// in a plain node environment transformed by babel-preset-expo. Component tests,
// if we add them later, can live in a separate jest project with the jest-expo preset.
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  testMatch: ['**/src/lib/**/*.test.ts'],
  collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/*.test.ts'],
};
