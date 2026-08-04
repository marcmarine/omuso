import type {
	InlineMark,
	InlineMarkRule,
	Paragraph,
	Root,
	Section,
} from './types'
import { createSectionBuilder, type SectionBuilder } from './utils'

/**
 * Parses a Markdown string into a structured document tree.
 *
 * @param {string} text The Markdown text to parse
 * @returns {Root} A Root object representing the parsed document structure
 *
 * @example
 * ```typescript
 * import { parse } from 'omuso'
 *
 * const markdown = `---
 * title: My Document
 * author: John Doe
 * ---
 *
 * # My Document
 *
 * ## Introduction
 *
 * This is a paragraph with *emphasis* text.
 * `
 *
 * const result = parse(markdown)
 * console.log(JSON.stringify(result, null, 2))
 * ```
 */
export function parse(text: string): Root {
	const { frontmatter, content } = splitFrontmatter(text)
	const metadata = frontmatter ? parseFrontmatterMetadata(frontmatter) : {}

	const root = createInitialRoot(metadata)
	const builder = createSectionBuilder(root)

	for (const block of splitBlocks(content)) {
		if (block.startsWith('#')) {
			processHeading(block, builder, root)
		} else {
			processParagraph(block, builder)
		}
	}

	return root
}

/**
 * Splits Markdown content into blocks (paragraphs and headings) following
 * standard Markdown paragraph semantics:
 * - A single newline keeps consecutive lines in the same paragraph.
 * - Two or more consecutive newlines separate paragraphs (extra blank lines never produce empty paragraphs).
 * - Heading lines always start a new block, since an ATX heading interrupts a paragraph even without a preceding blank line.
 */
function splitBlocks(content: string): string[] {
	const blocks: string[] = []
	let paragraphLines: string[] = []

	const flushParagraph = (): void => {
		if (paragraphLines.length > 0) {
			blocks.push(paragraphLines.join('\n'))
			paragraphLines = []
		}
	}

	for (const line of content.split('\n')) {
		if (line.trim() === '' || line.startsWith('#')) {
			flushParagraph()
			if (line.trim() !== '') {
				blocks.push(line)
			}
		} else {
			paragraphLines.push(line)
		}
	}

	flushParagraph()

	return blocks
}

function createInitialRoot(metadata: Record<string, string>): Root {
	return {
		type: 'root',
		title: metadata.title || undefined,
		author: metadata.author || undefined,
		language: metadata.language || undefined,
		translator: metadata.translator || undefined,
		date: metadata.date || undefined,
		content: [],
	}
}

const FRONTMATTER_DELIMITER = '---\n'
const FRONTMATTER_END_DELIMITER = '\n---'

function splitFrontmatter(text: string): {
	frontmatter: string
	content: string
} {
	const startIndex = text.indexOf(FRONTMATTER_DELIMITER)
	if (startIndex !== 0) {
		return { frontmatter: '', content: text }
	}

	const endIndex = text.indexOf(
		FRONTMATTER_END_DELIMITER,
		startIndex + FRONTMATTER_DELIMITER.length,
	)
	if (endIndex === -1) {
		return { frontmatter: '', content: text }
	}

	const frontmatter = text
		.slice(startIndex + FRONTMATTER_DELIMITER.length, endIndex)
		.trim()

	const content = text
		.slice(endIndex + FRONTMATTER_END_DELIMITER.length)
		.trimStart()

	return { frontmatter, content }
}

function parseFrontmatterMetadata(frontmatter: string): Record<string, string> {
	const metadata: Record<string, string> = {}
	const lines = frontmatter.split(/\r?\n/)

	for (const line of lines) {
		const separatorIndex = line.indexOf(':')
		if (separatorIndex === -1) continue

		const key = line.slice(0, separatorIndex).trim()
		const value = line.slice(separatorIndex + 1).trim()

		if (key) {
			metadata[key] = value
		}
	}

	return metadata
}

function processHeading(
	line: string,
	builder: SectionBuilder,
	root: Root,
): void {
	let depth = 0
	while (line[depth] === '#') {
		depth++
	}
	const title = line.slice(depth).trim()

	if (depth === 1) {
		root.title = title
	}

	builder.pushSection(createSection(title, depth))
}

function createSection(title: string, markdownDepth: number): Section {
	return {
		path: '',
		type: 'section',
		title,
		slug: '',
		depth: markdownDepth,
		content: [],
	}
}

function processParagraph(line: string, builder: SectionBuilder): void {
	const { value, marks } = parseInlineMarks(line)
	builder.addContent(createParagraph(value, marks))
}

function createParagraph(value: string, marks: InlineMark[]): Paragraph {
	return {
		path: '',
		type: 'paragraph',
		value,
		slug: '',
		marks,
	}
}

const INLINE_MARK_RULES: InlineMarkRule[] = [
	{ type: 'emphasis', delimiter: '*' },
	{ type: 'emphasis', delimiter: '_' },
]

function parseInlineMarks(text: string): {
	value: string
	marks: InlineMark[]
} {
	let processedValue = ''
	const marks: InlineMark[] = []
	let buffer = ''
	let activeRule: InlineMarkRule | null = null

	for (let i = 0; i < text.length; i++) {
		const remainingText = text.slice(i)

		if (activeRule) {
			if (remainingText.startsWith(activeRule.delimiter)) {
				const startPosition = processedValue.length
				processedValue += buffer
				const endPosition = processedValue.length

				marks.push({
					type: activeRule.type,
					start: startPosition,
					end: endPosition,
				})

				const delimiterLength = activeRule.delimiter.length
				buffer = ''
				activeRule = null
				i += delimiterLength - 1
				continue
			}

			buffer += text[i]
			continue
		}

		const matchingRule = INLINE_MARK_RULES.find((rule) =>
			remainingText.startsWith(rule.delimiter),
		)

		if (matchingRule) {
			activeRule = matchingRule
			buffer = ''
			i += matchingRule.delimiter.length - 1
		} else {
			processedValue += text[i]
		}
	}

	if (activeRule) {
		processedValue += activeRule.delimiter + buffer
	}

	return {
		value: processedValue,
		marks,
	}
}
