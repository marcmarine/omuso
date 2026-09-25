# OMUSO React Reader

React components and hooks for building reading experiences on top of [OMUSO](../omuso).

[![NPM Version](https://img.shields.io/npm/v/@omuso/react-reader)](https://www.npmjs.com/package/@omuso/react-reader)
[![GitHub License](https://img.shields.io/github/license/marcmarine/omuso)](LICENSE)
[![View Changelog](https://img.shields.io/badge/view-CHANGELOG.md-white.svg)](https://github.com/marcmarine/omuso/blob/main/packages/react-reader/CHANGELOG.md)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/@omuso/react-reader)

## Highlights

- **Reader UI ready to use**: includes cover, table of contents, content view, in-reader search, and previous/next chapter navigation out of the box.
- **Search with URL persistence**: search queries are reflected in `?query=...`, preserved across links, and highlighted in titles and paragraph excerpts.
- **Multi-language reading flow**: built-in language switcher (when multiple manifests are available) with translation-aware navigation and localized UI labels.
- **Configurable content depth**: control how deeply nested sections are rendered with `maxDepth`, while deeper nodes can be shown as a compact section index.
- **Section-level curation**: hide specific entries from the table of contents with `omitSections`.
- **Resizable side panels**: TOC and search panels can be resized and toggled, with panel width/open state persisted in local storage.
- **Theme support**: built-in light/dark mode toggle with `prefers-color-scheme` initialization and persisted theme preference.
- **Keyboard shortcuts**: quick toggles for navigation panels (`Cmd/Ctrl + M` for TOC, `Cmd/Ctrl + K` for search/focus).
- **Composable API**: besides `Reader`, the package exports lower-level building blocks (`ReaderContent`, `ReaderContentHeader`, `ReaderHeading`, `ReaderParagraph` , `ReaderLink`) for custom layouts.

## Setup

### 1. Create a `BookContext`

Create a module that builds your reading context — e.g. `src/omuso.config.ts`:

```ts
import { createContext } from 'omuso'
import en from './content/en.md' with { type: 'text' }

export default createContext().init({
  markdowns: { en },
  defaultLanguage: 'en',
})
```

The module must export a `BookContext` created via `createContext().init({...})` from the `omuso` package.

> [!NOTE]
> How markdown is imported as text depends on your bundler: Bun uses `with { type: "text" }` import attributes; Vite needs a `?raw` suffix (`import en from './content/en.md?raw'`); and so on.

### 2. Pass it to the reader

`context` is a required prop:

```tsx
import { Reader } from '@omuso/react-reader'
import omuso from './omuso.config'

import '@omuso/react-reader/styles.css'

export function App() {
  return <Reader context={omuso} language="en" />
}
```

### 3. Import the styles

The reader's styles are distributed as a standalone CSS file:

```tsx
import '@omuso/react-reader/styles.css'
```

You only need to import it once, at your app's entry point. The bundler packs it along with the rest of your CSS.

### 4. Recommended viewport setting (mobile)

When using the reader in mobile/full-screen layouts, include `viewport-fit=cover` in your viewport meta tag so the UI can use the full screen area (including safe-area handling on notched devices):

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

See [`apps/example`](../../apps/example) for a complete working setup.

## Errors

The `context` prop is required and typed as `BookContext`. If it is missing or has the wrong shape, TypeScript fails at the call site, before anything runs.

## Development

From the repo root, start the reader build (watch mode) and the example app simultaneously:

```
bun run dev
```

That runs `dev` in every workspace that has it: `@omuso/react-reader` rebuilds `dist/` on every change, and `apps/example` serves the app with hot reload — so a change in the reader source picks up automatically.

To build the package only once:

```
bun --filter @omuso/react-reader build
```
