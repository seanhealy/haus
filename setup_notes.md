# Setup notes for `create-next-strict`

Things to fold into the scaffold script.

## Vercel CLI

- Install `vercel` as a dev dependency so the version is pinned per-project
  rather than relying on a global install.
- Add a `vercel` script entrypoint to `package.json` so it can be invoked via
  `npm run vercel -- <args>`.
- After the scaffold finishes, consider running `npm run vercel link` to
  associate the new repo with a Vercel project up-front. This makes
  `vercel env pull`, `vercel pull`, and deploys work without an extra manual
  step.

## Pre-installed runtime dependencies

- [`zod`](https://zod.dev/) — schema validation. Used everywhere boundaries
  exist (env parsing, API payloads, form input).
- [`es-toolkit`](https://es-toolkit.dev/) — modern, lightweight utility library.
  Drop-in replacement for the parts of lodash we'd reach for, with better
  tree-shaking and types.
