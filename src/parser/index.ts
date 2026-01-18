import type {
	InlineMark,
	InlineMarkRule,
	Paragraph,
	Root,
	Section,
} from './types'
import { SectionStack } from './utils'

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
	const sections = new SectionStack(root)

	const contentLines = content.split('\n').filter((line) => line.trim() !== '')

	for (const line of contentLines) {
		if (line.startsWith('#')) {
			processHeading(line, sections, root)
		} else {
			processParagraph(line, sections)
		}
	}

	return root
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
	sections: SectionStack,
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

	const newSection = createSection(title, depth)
	sections.pushSection(newSection)
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

function processParagraph(line: string, sections: SectionStack): void {
	const { value, marks } = parseInlineMarks(line)
	const newParagraph = createParagraph(value, marks)
	sections.addContentToCurrentParent(newParagraph)
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
