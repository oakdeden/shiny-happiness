'use strict'

module.exports = {
  extends: [
    // Baseline CSS rules, plus the SCSS-aware versions of them
    'stylelint-config-standard-scss',
    // Sorts properties into Recess order (position → box model → visual → type)
    'stylelint-config-recess-order'
  ],
  ignoreFiles: ['dist/**', 'node_modules/**'],
  rules: {
    // Font stacks live in SCSS variables, where stylelint can't tell a font
    // name from a keyword and would lowercase `Roboto` and `Arial`.
    'value-keyword-case': null,
    // Bootstrap's own selectors are overridden here in source order, which
    // reads better than reordering them to satisfy specificity.
    'no-descending-specificity': null
  }
}
