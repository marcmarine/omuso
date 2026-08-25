# OMUSO

Monorepo for the OMUSO ecosystem, managed as a [bun workspace](https://bun.sh/docs/install/workspaces).

[![NPM Version](https://img.shields.io/npm/v/omuso)](https://www.npmjs.com/package/omuso)
[![GitHub License](https://img.shields.io/github/license/marcmarine/omuso)](./LICENSE)

## Packages

| Package                                   | Description                                                                                       | npm                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`omuso`](./packages/omuso)               | Converts Markdown into structured data for building reading-focused applications.                 | [![NPM Version](https://img.shields.io/npm/v/omuso)](https://www.npmjs.com/package/omuso) |
| [`@omuso/react-reader`](./packages/react-reader) | React components and hooks for building reading experiences on top of `omuso`. Not yet published. | —                                                                                         |

See each package's README for details.

## Development

This repo uses [Bun](https://bun.sh) for package management, running scripts and building.

```
bun install
```

Run a script across all packages:

```
bun run test
bun run build
bun run lint
```

Run a script for a single package:

```
bun --filter omuso test
bun --filter react-reader build
```

## Releases

Releases are managed with [release-please](https://github.com/googleapis/release-please). Each package
is versioned independently based on [Conventional Commits](https://www.conventionalcommits.org/) merged
into `main`:

- Every push to `main` updates (or opens) a release PR per package with the version bump and changelog.
- Merging a release PR tags the release and publishes a GitHub Release with its changelog.
- `omuso` is additionally published to npm when its release PR is merged. `react-reader` is not yet published.

See [`release-please-config.json`](./release-please-config.json) and
[`.release-please-manifest.json`](./.release-please-manifest.json) for the configuration.

## License

MIT - see [LICENSE](./LICENSE).
