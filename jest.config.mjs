export default {
  testPathIgnorePatterns: ['<rootDir>/lib/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { diagnostics: false }],
  },
}
