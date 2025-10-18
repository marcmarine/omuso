# OMUSO Markdown Parser

A small TypeScript library that turns Markdown into structured JSON, keeping the document’s hierarchy and some text styles.

[![NPM Version](https://img.shields.io/npm/v/omuso)](https://www.npmjs.com/package/omuso)
[![GitHub License](https://img.shields.io/github/license/marcmarine/omuso)](LICENSE)
[![View Changelog](https://img.shields.io/badge/view-CHANGELOG.md-red.svg)](https://github.com/marcmarine/omuso/releases)
![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/omuso)

## Key Features

- **Hierarchical Structure**: Headings (#, ##, etc.) create nested sections, building a clear document tree
- **Text Formatting Preservation**: Italic text are kept with their position in the tex
- **Frontmatter Support**: YAML metadata is extracted and linked to document propertie
- **TypeScript First**: Full type definitions for smooth development experience
- **Lightweight**: Zero dependencies, designed for efficient parsing

## Why another parser?

Unlike typical Markdown parsers that build detailed syntax trees, the **OMUSO Markdown Parser** focuses on the logical hierarchy of documents. It uses headings not just to identify formatting but to define nested sections, making each heading start a new node with its related content.

This method is helpful when Markdown encodes semantic structure as well as visual formatting. The parser outputs a well-organized JSON object that reflects the author’s intended document layout, making it easier for developers to understand and work with the content.

## Installation

```bash
npm install omuso
```

## Quick Start

```typescript
import { parse } from 'omuso'

const markdown = `# Hello World

This is a simple paragraph.

## Section 1

Another paragraph with *italic text*.
`

const result = parse(markdown)-
// Result structure:
// {
//   "type": "root",
//   "title": "Hello World",
//   "content": [
//     {
//       "path": "1",
//       "type": "section",
//       "title": "Hello World",
//       "depth": 1,
//       "content": [
//         {
//           "path": "1#1",
//           "type": "paragraph",
//           "value": "This is a simple paragraph.",
//           "marks": []
//         },
//         {
//           "path": "1.1",
//           "type": "section",
//           "title": "Section 1",
//           "depth": 2,
//           "content": [
//             {
//               "path": "1.1#1",
//               "type": "paragraph",
//               "value": "Another paragraph with italic text.",
//               "marks": [
//                 {
//                   "type": "emphasis",
//                   "start": 23,
//                   "end": 34
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }
```

## API Reference

### `parse(text: string): Root`

Converts a Markdown string to a structured JSON representation.

**Parameters:**
- `text`: The Markdown content as a string

**Returns:**
- `Root`: The root node containing the parsed document structure

### Type Definitions

#### `Root`

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

#### `Section`

Represents a heading and its content.

```typescript
interface Section {
  type: 'section'
  path: string
  title: string
  depth: number
  content: (Section | Paragraph)[]
}
```

#### `Paragraph`

Represents a paragraph with text formatting marks.

```typescript
interface Paragraph {
  type: 'paragraph'
  path: string
  content: string
  marks: InlineMark[]
}
```

#### `InlineMark`

Defines formatting applied to text ranges.

```typescript
interface InlineMark {
  type: 'emphasis'
  start: number
  end: number
}
```

## Usage Examples

### Basic Document

```typescript
import { parse } from 'omuso'

const markdown = `# Hello World

This is a simple paragraph.

## Section 1

Another paragraph with *italic text*.
`

const result = parse(markdown)
// Result structure:
// {
//   "type": "root",
//   "title": "Hello World",
//   "content": [
//     {
//       "path": "1",
//       "type": "section",
//       "title": "Hello World",
//       "depth": 1,
//       "content": [
//         {
//           "path": "1#1",
//           "type": "paragraph",
//           "value": "This is a simple paragraph.",
//           "marks": []
//         },
//         {
//           "path": "1.1",
//           "type": "section",
//           "title": "Section 1",
//           "depth": 2,
//           "content": [
//             {
//               "path": "1.1#1",
//               "type": "paragraph",
//               "value": "Another paragraph with italic text.",
//               "marks": [
//                 {
//                   "type": "emphasis",
//                   "start": 23,
//                   "end": 34
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }
```

### Document with Frontmatter

```typescript
const markdownWithFrontmatter = `---
title: La Iliada
author: Homer
language: ca
translator: Conrad Roure i Bofill
date: 1879-01-01
---

## Cant I

Canta, deesa, la cólera d'Aquiles, fill de Peleo, cólera fatal que abocá un sens fí de mals...
`

const result = parse(markdownWithFrontmatter)
// The frontmatter data will be available in the root node properties
console.log(result.title)      // "La Iliada"
console.log(result.author)     // "Homer"
console.log(result.language)   // "ca"
```

### Text Formatting

The library supports emphasis formatting using both `*` and `_` delimiters:

```typescript
const markdown = `Paragraph with *asterisk emphasis* and _underscore emphasis_.`

const result = parse(markdown)
const paragraph = result.content[0] as ParagraphNode

console.log(paragraph.content) // "Paragraph with asterisk emphasis and underscore emphasis."
console.log(paragraph.marks)   // [
                               //   { type: 'emphasis', start: 15, end: 33 },
                               //   { type: 'emphasis', start: 38, end: 57 }
                               // ]
```

### Nested Sections

```typescript
const markdown = `# Main Title

## Chapter 1

Introduction paragraph.

### Section 1.1

Subsection content.

### Section 1.2

Another subsection.

## Chapter 2

Second chapter content.
`

const result = parse(markdown)
// Creates a hierarchical structure with nested sections
```

## Supported Markdown Features

- ✅ **Headers** (H1-H6) - Converted to sections with depth
- ✅ **Paragraphs** - Text content with formatting marks
- ✅ **Emphasis** - `*italic*` and `_italic_` text
- ✅ **Frontmatter** - YAML-style metadata parsing
- ❌ **Strong text** - Coming soon...
- ❌ **Lists** - Not currently supported
- ❌ **Links** - Not currently supported
- ❌ **Images** - Not currently supported
- ❌ **Code blocks** - Not currently supported

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build the package
bun run build
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.
