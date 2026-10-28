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

## Recipe generator

Start the recipe generator with:

```bash
npm run recipe-generator
```

Open <http://localhost:3003/> to use the app. Set `GEMINI_API_KEY` in the
repository's `.env` file to enable recipe generation.

## Student feedback server

The Express feedback app is separate from the static site. Start it with:

```bash
cd tmp/feedback
npm install
npm start
```

Submit feedback at <http://localhost:3000/feedback/>. Valid submissions are stored
in `tmp/feedback/data/feedback.sqlite`, outside the public files directory. To use a
different SQLite file, set `FEEDBACK_DB_PATH` before starting the server. The database
can be read with a SQLite client, for example:

```sql
SELECT id, name, email, student_status, comments, created_at
FROM feedback
ORDER BY id DESC;
```

The database inbox is not exposed as a public web page; deploy this server and its
database on a host with persistent disk storage to retain submissions.

### Running the Lab 9 Express apps locally

Start each app in its own terminal from its directory:

```bash
cd tmp/feedback && npm install && npm start
cd tmp/would-you-rather-express-api && npm install && PORT=3001 node ./server.js
cd tmp/body && npm install && npm start
```

The Lab 9 links use ports 3000 (feedback), 3001 (Would You Rather API), and 3002
(BMI calculator). Start the static site separately with `npm start` from the repository
root. The Express servers accept a `PORT` environment variable to override their defaults.

### Deploying the Express apps

The `Deploy Express apps to Azure App Service` workflow deploys the feedback, BMI, and
Would You Rather apps to three existing Linux App Services running Node 20. Create three
Linux Node 20 web apps in the `shiny-happiness` resource group, in North Central US,
and on one shared App Service plan (F1, as selected). Then add these GitHub repository variables under
**Settings → Secrets and variables → Actions → Variables**:

- `AZURE_RESOURCE_GROUP` — `shiny-happiness`
- `AZURE_WEBAPP_NAME_FEEDBACK` — the feedback App Service name
- `AZURE_WEBAPP_NAME_BMI` — the BMI App Service name
- `AZURE_WEBAPP_NAME_WYR` — the Would You Rather App Service name

Add an `AZURE_CREDENTIALS` GitHub Actions secret containing an Azure service-principal
credential JSON with permission to deploy to the resource group. Do not commit this
credential. Push changes to `main` affecting an Express app, or run the workflow manually
from the Actions tab, to deploy. App names are also used to rewrite the Lab 9 links to
their `https://<name>.azurewebsites.net` addresses in the Azure Static Web Apps and
GitHub Pages builds.

The workflow enables persistent App Service storage for the feedback app; its SQLite
file is stored at `/home/data/feedback.sqlite` and the app creates that directory on
startup. Keep the feedback app on one instance while it uses SQLite.

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
