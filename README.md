# OMUSO Markdown Parser

A lightweight TypeScript library that converts Markdown documents into a structured JSON representation, preserving document hierarchy and text formatting information.

## Key Features

- **Hierarchical Structure**: Headings (#, ##, etc.) create nested sections that form a logical document tree
- **Text Formatting Preservation**: Italic text formatting is captured with positioning
- **Frontmatter Support**: YAML metadata is extracted and mapped to document properties
- **TypeScript First**: Full type definitions for reliable development experience
- **Lightweight**: Minimal dependencies with a focused feature set

## Why another Markdown parser?

Unlike traditional Markdown parsers that generate a detailed, syntax-oriented tree, the **OMUSO Markdown Parser** interprets Markdown as a *hierarchical logical structure* organized by sections. In this model, headings (#, ##, etc.) are not just identified, they define nested sections where each heading introduces a new node containing its associated content.

This approach is especially valuable when Markdown is used to express not only formatting but also *semantic hierarchy*. The parser outputs structured JSON that accurately represents the author’s intended document organization.

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
//   type: 'root',
//   title: 'Hello World',
//   content: [
//     {
//       type: 'paragraph',
//       value: 'This is a simple paragraph.',
//       marks: []
//     },
//     {
//       type: 'section',
//       title: 'Section 1',
//       depth: 1,
//       content: [
//         {
//           type: 'paragraph',
//           value: 'Another paragraph with italic text.',
//           marks: [{ type: 'emphasis', start: 22, end: 33 }]
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
  title: string
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
  content: string
  marks: Mark[]
}
```

#### `Mark`

Defines formatting applied to text ranges.

```typescript
interface Mark {
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
//   type: 'root',
//   title: 'Hello World',
//   content: [
//     {
//       type: 'paragraph',
//       value: 'This is a simple paragraph.',
//       marks: []
//     },
//     {
//       type: 'section',
//       title: 'Section 1',
//       depth: 1,
//       content: [
//         {
//           type: 'paragraph',
//           value: 'Another paragraph with italic text.',
//           marks: [{ type: 'emphasis', start: 22, end: 33 }]
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
