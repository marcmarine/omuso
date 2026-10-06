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

export function App() {
  return <Reader context={omuso} language="en" />
}
```

`language` is the default language: it is used when the URL or the stored location don't specify one, or specify one that isn't in `markdowns`.

If your app is mounted under a URL prefix, pass `basePath` so links and history updates stay inside that prefix:

```tsx
<Reader context={omuso} language="en" basePath="/reader" />
```

With `basePath="/reader"`, the reader keeps internal slugs unchanged (for example `/book/ch1`) but exposes them in the browser as `/reader/book/ch1`.

### 3. Customize the styles

The default styles can be customized with CSS variables and the reader's `.or-*` classes. For example, wrap the reader and set theme tokens on that wrapper:

```css
.my-reader {
  --or-background: #fff;
  --or-foreground: #222;
  --or-dividers: #ddd;
}
```

```tsx
<div className="my-reader">
  <Reader context={omuso} language="en" />
</div>
```

### 4. Recommended viewport setting (mobile)

When using the reader in mobile/full-screen layouts, include `viewport-fit=cover` in your viewport meta tag so the UI can use the full screen area (including safe-area handling on notched devices):

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

See [`apps/example`](../../apps/example) for a complete working setup.

### Preventing a theme flash

The reader applies the saved theme after React mounts. To avoid briefly showing the default theme first, set `data-omuso-theme` synchronously in the document `<head>`, before the app renders:

```html
<script>
  (() => {
    try {
      const storedTheme = localStorage.getItem('omuso:theme')
      const isDark =
        storedTheme === 'dark' ||
        (storedTheme !== 'light' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)

      document.documentElement.setAttribute(
        'data-omuso-theme',
        isDark ? 'dark' : 'light',
      )
    } catch {}
  })()
</script>
```

Place this inline script in your HTML `<head>` before the app bundle. It uses the same `omuso:theme` local-storage key as the reader, falls back to the system color-scheme preference, and sets the attribute on `<html>` before the first paint.

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
