# Repository Guidelines

## Project Structure & Module Organization

`main.js` contains the adapter runtime and is the primary entry point. Reusable typings live in `lib/`, admin configuration assets live in `admin/`, and localized UI strings are stored in `admin/i18n/*.json`. End-user documentation is split by language under `docs/de/` and `docs/en/`. Tests are kept in `test/` with separate entry points for unit, integration, and package validation.

## Build, Test, and Development Commands

Use Node.js 20 or newer as required by `package.json`.

- `npm run lint` runs ESLint across the repository.
- `npm run check` runs TypeScript in no-emit mode against `tsconfig.check.json`.
- `npm test` runs JavaScript tests plus package validation.
- `npm run test:integration` runs the ioBroker integration test suite.
- `npm run release-patch`, `npm run release-minor`, and `npm run release-major` perform scripted releases.

There is no separate build step in this repository; changes are committed directly to the shipped JavaScript and admin assets.

## Coding Style & Naming Conventions

Follow the repository ESLint and Prettier configuration in `eslint.config.mjs` and `prettier.config.mjs`. Use 4-space indentation, semicolons, and single quotes to match the existing codebase. Keep classes in PascalCase, methods and variables in camelCase, and preserve established ioBroker config/state naming when extending the adapter.

## Testing Guidelines

Tests use `@iobroker/testing` with Mocha entry points in `test/unit.js`, `test/integration.js`, and `test/package.js`. Add or update tests whenever runtime behavior, package metadata, or admin configuration changes. Before opening a PR, run `npm run lint`, `npm run check`, and `npm test`; run `npm run test:integration` for adapter behavior changes.

## Commit & Pull Request Guidelines

Recent history shows short, imperative commit subjects and many automated merge commits from bots or translators. For manual commits, keep subjects concise and descriptive, for example: `Fix glances payload validation`. Pull requests should explain the user-visible change, link any related issue, and note which checks were run. Include screenshots only when `admin/` UI text or layout changes.

## Security & Configuration Tips

Do not commit real Pushover tokens, user keys, or local instance data. Treat `io-package.json`, `admin/jsonConfig.json`, and translations as part of the public adapter contract and update them carefully.
