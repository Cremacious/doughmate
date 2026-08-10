// The conversion engine is pure TypeScript (no React Native imports), so it runs
// in a plain node environment transformed by babel-preset-expo. Component tests,
// if we add them later, can live in a separate jest project with the jest-expo preset.
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  testMatch: ['**/src/lib/**/*.test.ts'],
  // Coverage is enforced on the pure logic. haptics.ts is a thin native
  // (expo-haptics) side-effect wrapper, not math, so it is excluded here.
  collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/*.test.ts', '!src/lib/haptics.ts'],
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
};
