import { antfu } from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'PLAN.md',
    'dist/**',
    'node_modules/**',
    'coverage/**',
    'examples/**'
  ],
  rules: {
    'style/comma-dangle': ['warn', 'never'],
    'style/max-statements-per-line': ['error', { max: 1 }],
    'test/prefer-lowercase-title': 'off',
    'unused-imports/no-unused-imports': 'warn'
  }
})
