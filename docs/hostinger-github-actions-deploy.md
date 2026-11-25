# Deploying to Hostinger from GitHub Actions

This project deploys the full ITEC Node.js site to **https://itec.oakarboleda.codes** using the Hostinger CLI from GitHub Actions.

The workflow file is [`.github/workflows/deploy-hostinger.yml`](../.github/workflows/deploy-hostinger.yml).

## What gets deployed

One Express app from the **repository root**, entry file `server.js`. That process serves:

| Path | What it is |
| --- | --- |
| `/` and static HTML | Webpack-built site from `dist/` |
| `/feedback/` | Student feedback form + admin |
| `/would-you-rather/` | Would You Rather client |
| `/api/wyr` | Would You Rather JSON API |
| `/body-index/` | BMI calculator |

There is no separate feedback subdomain deploy from this workflow. Everything lives on **itec.oakarboleda.codes**.

## Prerequisites

### 1. Hostinger website

A Node.js website must already exist for `itec.oakarboleda.codes` on the Hostinger account.

### 2. GitHub Actions secret

In the GitHub repo:

**Settings → Secrets and variables → Actions → Secrets**

Create:

| Name | Value |
| --- | --- |
| `HOSTINGER_API_TOKEN` | API token from Hostinger (hPanel / API tokens) |

The workflow reads only this secret. It does **not** use a `HOSTINGER_DOMAIN` variable; the domain is fixed to `itec.oakarboleda.codes` in the workflow file.

### 3. Hostinger environment variables

Set these in Hostinger for the itec Node app (hPanel → website → Node.js environment, or Hostinger API). Values are not stored in git.

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Usually `production` |
| `DB_HOST` | MySQL host from the app server (`127.0.0.1` on Hostinger) |
| `DB_PORT` | Usually `3306` |
| `DB_NAME` | MySQL database name |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `GEMINI_API_KEY` | Gemini key for feedback department sorting |

`.env` files are **not** uploaded by `hostinger up` (they are skipped as secrets). Configure env vars in Hostinger itself.

## When the workflow runs

Triggers:

1. **Push to `main`** — automatic deploy after each push  
2. **workflow_dispatch** — manual run from the Actions tab (“Deploy to Hostinger” → Run workflow)

Concurrency group `hostinger-deploy` allows only one deploy job at a time (`cancel-in-progress: false`).

## What the workflow does

```mermaid
flowchart LR
  push[Push to main or manual run] --> checkout[Checkout repo]
  checkout --> installCli[Install Hostinger CLI]
  installCli --> up["hostinger up ."]
  up --> build[Server-side npm install + npm run build]
  build --> restart[Publish and restart Node app]
```

Steps in order:

1. **Checkout** the repository (`actions/checkout@v5`).
2. **Install the Hostinger CLI** into the runner and add it to `PATH`.
3. **Deploy** with:

```bash
hostinger up . \
  --domain "itec.oakarboleda.codes" \
  --type nodejs \
  --app-type express \
  --entry-file server.js \
  --node-version 20 \
  --build-script build \
  --yes \
  --format json \
  -m "$MESSAGE"
```

Meaning of the important flags:

| Flag | Role |
| --- | --- |
| `.` | Deploy the whole repo (not a subfolder) |
| `--domain` | Target website: itec only |
| `--type nodejs` / `--app-type express` | Treat as Express Node app |
| `--entry-file server.js` | Process entry point |
| `--node-version 20` | Node 20 on Hostinger |
| `--build-script build` | Runs `npm run build` (webpack) on the server |
| `--yes` | Overwrite existing site contents |
| `-m` | Short message shown in Hostinger deployment history (from the commit message, truncated to 72 characters) |

On the server, Hostinger:

1. Uploads an archive of the project (skipping `node_modules`, `.git`, `.env`, etc.)
2. Runs `npm install`
3. Runs `npm run build` (webpack production build into `dist/`)
4. Publishes the new version and restarts the Node process

## Why build dependencies are in `dependencies`

Hostinger runs `npm install` with a production-style environment, which can skip `devDependencies`. Webpack and related packages therefore live under `dependencies` in root [`package.json`](../package.json) so `npm run build` succeeds on Hostinger.

`overrides` in `package.json` also pin patched transitive packages (for example `proxy-addr`, `body-parser`) for security audits.

## Manual deploy without waiting for a push

1. Open the repo on GitHub.  
2. Go to **Actions → Deploy to Hostinger**.  
3. Click **Run workflow** (branch `main`).  
4. Wait for the job to finish; check Hostinger’s deployment / build logs if it fails.

## Verifying a successful deploy

After the workflow is green:

- Site home: https://itec.oakarboleda.codes/  
- Feedback: https://itec.oakarboleda.codes/feedback/  
- Feedback admin: https://itec.oakarboleda.codes/feedback/admin  
- Would You Rather: https://itec.oakarboleda.codes/would-you-rather/  
- WYR API: https://itec.oakarboleda.codes/api/wyr  

In GitHub Actions, open the failed/successful run logs for the **Deploy to Hostinger** step. On Hostinger, inspect the Node build log if `npm run build` or install fails.

## Common failures

| Symptom | Likely cause |
| --- | --- |
| `webpack: command not found` | Build tools not installed (keep webpack packages in `dependencies`) |
| App starts but DB errors | Missing or wrong `DB_*` env vars on Hostinger |
| Feedback departments stay empty | Missing `GEMINI_API_KEY`, or Gemini model/API errors (check runtime logs) |
| Deploy goes to the wrong site | Domain must stay hardcoded as `itec.oakarboleda.codes` in the workflow |

## Related files

- Workflow: [`.github/workflows/deploy-hostinger.yml`](../.github/workflows/deploy-hostinger.yml)  
- App entry: [`server.js`](../server.js)  
- Build script: `npm run build` in root [`package.json`](../package.json)  
