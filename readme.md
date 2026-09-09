# ITEC Homework Site

A small multi-page static site built with HTML, Sass and Bootstrap 5, bundled by webpack and
deployed to [Azure Static Web Apps](https://docs.microsoft.com/azure/static-web-apps/overview).

## Getting started

```bash
npm install
npm start     # dev server with hot reload at http://localhost:8080
npm run build # production build into dist/
```

## Linting and formatting

```bash
npm run lint:css      # stylelint the Sass
npm run lint:css:fix  # ...and autofix what it can
npm run format        # prettier --write over src/ and the config files
npm test              # lint + format check + production build
```

[stylelint.config.js](stylelint.config.js) extends `stylelint-config-standard-scss` and sorts
properties into Recess order. Prettier's settings are in [.prettierrc.json](.prettierrc.json).

Open <http://localhost:8080/> for the assignments index and
<http://localhost:8080/lab2.html> for Lab 2.

## Project layout

```
src/
  index.html        # assignments index
  lab2.html         # Lab 2 - HTML and CSS
  js/main.js        # entry point: imports the Sass and Bootstrap's JS
  scss/styles.scss  # Bootstrap customization + imports
  scss/_site.scss   # this site's own styles
  assets/img/       # images, emitted to dist/assets/
dist/               # build output (generated, not committed)
```

## Adding a page

1. Create `src/<name>.html`.
2. Add `'<name>'` to the `pages` array in [webpack.config.js](webpack.config.js).

Every page automatically gets `main.js`, which injects the compiled CSS and initializes
Bootstrap components.

## Dev container

This repo has a dev container, so opening it in a [GitHub Codespace](https://github.com/features/codespaces)
or [VS Code with the remote containers extension](https://code.visualstudio.com/docs/remote/containers)
gives you all dependencies preinstalled.
