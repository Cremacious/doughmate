// The conversion engine is pure TypeScript (no React Native imports), so it runs
// in a plain node environment transformed by babel-preset-expo. Component tests,
// if we add them later, can live in a separate jest project with the jest-expo preset.
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  testMatch: ['**/src/lib/**/*.test.ts'],
  // The 100% mandate applies to the pure engines. Infra and native side-effect
  // wrappers (storage, haptics, notifications, purchases, ads) are not unit
  // tested here, so coverage is scoped to the tested logic modules only.
  collectCoverageFrom: [
    'src/lib/convert.ts',
    'src/lib/recipe.ts',
    'src/lib/pan.ts',
    'src/lib/oven.ts',
    'src/lib/yeast.ts',
    'src/lib/egg.ts',
    'src/lib/butter.ts',
    'src/lib/substitutions.ts',
    'src/lib/sam.ts',
    'src/lib/starter.ts',
    'src/lib/starterMood.ts',
    'src/lib/bake.ts',
    'src/lib/timer.ts',
  ],
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
};
