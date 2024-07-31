module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'next',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'jsx-a11y',
    '@typescript-eslint',
    'eslint-plugin-import-helpers',
    'unused-imports',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        'semi': true,
        'trailingComma': 'all',
        'tabWidth': 2,
        'singleQuote': true,
        'useTabs': false,
        'jsxSingleQuote': false,
        'bracketSpacing': true,
        'bracketSameLine': false,
        'printWidth': 80,
        'arrowParens': 'avoid'
      }
    ],
    'jsx-a11y/alt-text': [
      'warn',
      {
        elements: ['img'],
        img: ['Image'],
      },
    ],
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'react/no-unknown-property': 'error',
    'global-require': 0,
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    'react/display-name': 'off',
    'no-func-assign': 'off',
    'import/prefer-default-export': 'off',
    'react/prop-types': 'off',
    'camelcase': 'off',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'import-helpers/order-imports': [
      'warn',
      {
        'newlinesBetween': 'always',
        'groups': [
          'module',
          ['/@beyounglabs/', '/cybertron/', '/packages/'],
          '/components/',
          '/helpers/',
          '/hooks/',
          ['parent', 'sibling', 'index'],
          '/texts/'
        ],
        'alphabetize': {
          'order': 'asc',
          'ignoreCase': true
        }
      }
    ],
    'no-plusplus': 'off',
    'import/no-anonymous-default-export': 'off',
    'react/no-array-index-key': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/tabindex-no-positive': 'warn',
    'react/require-default-props': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/no-onchange': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'consistent-return': 'off',
    'no-continue': 'off',
    'no-new': 'off',
    'guard-for-in': 'off',
    'no-nested-ternary': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      [require.resolve('@typescript-eslint/parser')]: ['.ts', '.tsx', '.d.ts'],
    },
  }
}