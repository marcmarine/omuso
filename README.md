# Mark JSON

A lightweight TypeScript library that converts Markdown documents to structured JSON format, preserving document hierarchy and text formatting marks.

## Installation

```bash
npm install mark-json
```

## Quick Start

```typescript
import { fromMarkdown } from 'mark-json'

const markdown = `---
title: My Document
author: John Doe
---

# My Document

## Introduction

This is a paragraph with *emphasis* text.

### Subsection

Another paragraph here.
`

const result = fromMarkdown(markdown)
console.log(JSON.stringify(result, null, 2))
```

## API Reference

### `fromMarkdown(text: string): Root`

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
import { fromMarkdown } from 'mark-json'

const markdown = `# Hello World

This is a simple paragraph.

## Section 1

Another paragraph with *italic text*.
`

const result = fromMarkdown(markdown)
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

const result = fromMarkdown(markdownWithFrontmatter)
// The frontmatter data will be available in the root node properties
console.log(result.title)      // "La Iliada"
console.log(result.author)     // "Homer"
console.log(result.language)   // "ca"
```

### Text Formatting

The library supports emphasis formatting using both `*` and `_` delimiters:

```typescript
const markdown = `Paragraph with *asterisk emphasis* and _underscore emphasis_.`

const result = fromMarkdown(markdown)
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

const result = fromMarkdown(markdown)
// Creates a hierarchical structure with nested sections
```

## Supported Markdown Features

- ✅ **Headers** (H1-H6) - Converted to sections with depth
- ✅ **Paragraphs** - Text content with formatting marks
- ✅ **Emphasis** - `*italic*` and `_italic_` text
- ✅ **Frontmatter** - YAML-style metadata parsing
- ❌ **Strong text** - Partially supported (coming soon)
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
