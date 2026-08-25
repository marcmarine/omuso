# OMUSO Markdown

A lightweight TypeScript library that converts Markdown into structured data for building reading-focused applications.

[![NPM Version](https://img.shields.io/npm/v/omuso)](https://www.npmjs.com/package/omuso)
[![GitHub License](https://img.shields.io/github/license/marcmarine/omuso)](LICENSE)
[![View Changelog](https://img.shields.io/badge/view-CHANGELOG.md-red.svg)](https://github.com/marcmarine/omuso/releases)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/omuso)

OMUSO is designed for apps where Markdown represents document structure, not just formatting, such as books, essays, documentation, or long-form reading experiences.

[Parser](#parser) · [Context](#context)

## Parser

The parser turns Markdown into a hierarchical, typed JSON structure that mirrors how people actually read documents.

[Go to definitions ↓](#parser-types-definitions)

### Key Features

- **Hierarchical structure**: Headings (#, ##, etc.) create nested sections, forming a clear document tree.
- **Text formatting preservation**: Inline emphasis is preserved as positional marks instead of raw Markdown.
- **Frontmatter support**: YAML frontmatter is extracted and exposed as document metadata.
- **TypeScript-first**: Fully typed output for a smooth developer experience.
- **Lightweight**: Zero runtime dependencies.

### Why another parser?

Most Markdown parsers focus on producing a detailed syntax tree. **OMUSO focuses on meaning and navigation**.

Headings define logical sections, each becoming a node with its own content, path, and slug. The result is a structured representation that reflects the author’s intended layout and is easy to use for:

- Table of contents
- Pagination and navigation
- Breadcrumbs
- Reading sessions
- Multi-language documents

The output is optimized for apps, not renderers.

### Installation

```bash
npm install omuso
```

### Quick Start

```typescript
import { parse } from 'omuso'

const markdown = `# Hello World

This is a simple paragraph.

## Section 1

Another paragraph with *italic text*.
`

const result = parse(markdown)
```

Example output:

```json
{
  "type": "root",
  "title": "Hello World",
  "content": [
    {
      "path": "1",
      "type": "section",
      "title": "Hello World",
      "slug": "/hello-world",
      "depth": 1,
      "content": [
        {
          "path": "1_1",
          "type": "paragraph",
          "value": "This is a simple paragraph.",
          "slug": "/hello-world#1",
          "marks": []
        },
        {
          "path": "1.1",
          "type": "section",
          "title": "Section 1",
          "slug": "/hello-world/section-1",
          "depth": 2,
          "content": [
            {
              "path": "1.1_1",
              "type": "paragraph",
              "value": "Another paragraph with italic text.",
              "slug": "/hello-world/section-1#1",
              "marks": [
                {
                  "type": "emphasis",
                  "start": 23,
                  "end": 34
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### API Reference

#### `parse(text: string): Root`

Converts a Markdown string into a structured document tree.

**Parameters:**
- `text`: Markdown source

**Returns:**
- `Root`: The parsed document

#### Parser Types Definitions

##### `Root`

The top-level document node.

```typescript
interface Root {
  type: 'root'
  title?: string
  author?: string
  language?: string
  translator?: string
  date?: string
  content: (Section | Paragraph)[]
}
```

##### `Section`

Represents a heading and its nested content.

```typescript
interface Section {
  type: 'section'
  path: string
  title: string
  slug: string
  depth: number
  content: (Section | Paragraph)[]
}
```

##### `Paragraph`

A paragraph with inline formatting marks.

```typescript
interface Paragraph {
  type: 'paragraph'
  path: string
  value: string
  slug: string
  marks: InlineMark[]
}
```

##### `InlineMark`

Inline text formatting metadata.

```typescript
interface InlineMark {
  type: 'emphasis'
  start: number
  end: number
}
```

#### Frontmatter Example

```typescript
const markdown = `---
title: La Iliada
author: Homer
language: ca
translator: Conrad Roure i Bofill
date: 1879-01-01
---

## Cant I

Canta, deesa, la cólera d'Aquiles, fill de Peleo, cólera fatal que abocá un sens fí de mals...
`

const result = parse(markdown)

console.log(result.title)      // "La Iliada"
console.log(result.author)     // "Homer"
console.log(result.language)   // "ca"
```

#### Text Formatting

The library supports emphasis formatting using both `*` and `_` delimiters:

```typescript
const markdown = `Paragraph with *asterisk emphasis* and _underscore emphasis_.`

const result = parse(markdown)
const paragraph = result.content[0] as Paragraph

console.log(paragraph.content) // "Paragraph with asterisk emphasis and underscore emphasis."
console.log(paragraph.marks)   // [
                               //   { type: 'emphasis', start: 15, end: 33 },
                               //   { type: 'emphasis', start: 38, end: 57 }
                               // ]
```

### Supported Markdown Features

- ✅ Headings (H1-H6)
- ✅ Paragraphs
- ✅ Emphasis (`*italic*`, `_italic_`)
- ✅ YAML frontmatter
- 
Planned / not yet supported:

- ❌ Strong text
- ❌ Lists
- ❌ Links
- ❌ Images
- ❌ Code blocks

## Context

The context layer builds on top of the parser to support reading workflows.

It lets you:

- Load one or more Markdown sources (typically per language).
- Generate navigation manifests.
- Create reading sessions with next/previous navigation, breadcrumbs and search.

[Go to definitions ↓](#context-types-definitions)

### `createContext()`

Creates an isolated context instance.

```typescript
import { createContext } from 'omuso'

const ctx = createContext().init({
  markdowns: {
    en: '# Title\n\n## Chapter 1\n\nHello'
  }
})
```

After initialization:

- `ctx.languages` → Available languages
- `ctx.roots[lang]` → Parsed document
- `ctx.manifests[lang]` → Navigation metadata

#### `ctx.manifest(lang: string)`

Returns the manifest for a language.

```javascript
const manifest = ctx.manifest('en')
console.log(manifest?.paths)
```

#### `ctx.session(path: string, query = '', lang: string)`

Creates a reading session for a specific section.

```javascript
const session = ctx.session('1.1', '', 'en')

console.log(session.currentSection?.title)
console.log(session.breadcrumbs.map(b => b.title))
console.log(session.nextSection?.path)
```

A session includes:

- Current section content
- Breadcrumbs
- Previous / Next section
- Search state

### Singleton `context`

If you don’t need multiple contexts, OMUSO exports a singleton:

```javascript
import { context } from 'omuso'

context.init({
  markdowns: { en: '# Title\n\n## Chapter 1\n\nHello' }
})

const session = context.session('1', '', 'en')
```

> [!TIP]
> The parsed section data is available at `session.currentSection`.

### Context Types Definitions

#### `Manifest`

Derived metadata used for navigation and lookup.

```typescript
interface Manifest {
  metadata: {
    title: string
    author: string
    language: string
    translator: string
  }
  tableOfContents: Section[]
  paths: string[]
  slugs: Record<string, string>
  pathBySlug: Record<string, string>
  breadcrumbIndex: Record<string, SectionReference[]>
}
```

#### `Session`

Represents the current “reading state” for a given section path.

```typescript
interface Session {
  currentSection: Section | null
  nextSection: SectionReference | null
  prevSection: SectionReference | null
  breadcrumbs: SectionReference[]
  search: {
    query: string
    results: SearchResult[]
    totalMatches: number
  }
  language: string
}
```

#### `SectionReference`

A lightweight reference to a section, used for breadcrumbs and navigation.

```typescript
interface SectionReference {
  path: string
  title: string
  depth: number
  slug: string
}
```

#### `SearchResult`

Under development...

## Development

```bash
bun install
bun dev
bun test
bun run build
```

## License

MIT - see [LICENSE ↗](LICENSE).
