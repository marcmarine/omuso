# app-example

Example app for `@omuso/react-reader`.

## Install

From the monorepo root:

```bash
bun install
```

## Development

Run only the example app:

```bash
bun --filter app-example dev
```

Or run full workspace watch mode (`omuso`, `react-reader`, and `example`):

```bash
bun run dev
```

### Mobile / LAN access

The dev server binds to `0.0.0.0` and prints a LAN URL in the terminal:

- `Local: http://localhost:<port>`
- `Mobile/LAN: http://<your-lan-ip>:<port>`

By default it tries `3000` and, if occupied, keeps trying up to `3019`.

You can force a port:

```bash
PORT=5173 bun --filter app-example dev
```

## Production

```bash
bun --filter app-example build
bun --filter app-example start
```
