import { processHeading } from '../processors/heading'
import { processParagraph } from '../processors/paragraph'
import type { Root } from '../types'
import { SectionStack } from '../utils'
import { parseFrontmatterMetadata, splitFrontmatter } from './frontmatter'

/**
 * Parses a Markdown string into a structured document tree.
 *
 * @param {string} text The Markdown text to parse
 * @returns {Root} A Root object representing the parsed document structure
 *
 * @example
 * ```typescript
 * import { parse } from 'frommark'
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
		title: metadata.title || '',
		author: metadata.author || '',
		language: metadata.language || '',
		translator: metadata.translator || '',
		date: metadata.date || '',
		content: [],
	}
}
