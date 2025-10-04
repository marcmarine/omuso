import type { Root, Section } from './definitions'
import { parseFrontmatter, parseParagraph, splitFrontmatter } from './utils'

/**
 * Converts a Markdown string to a structured document tree.
 *
 * @param {string} text The Markdown text to parse
 * @returns {Root} A Root object representing the parsed document structure
 *
 * @example
 * ```typescript
 * import { fromMarkdown } from 'mark-json'
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
 *
 * ### Subsection
 *
 * Another paragraph here.
 * `
 *
 * const result = fromMarkdown(markdown)
 * console.log(JSON.stringify(result, null, 2))
 * ```
 */
export function fromMarkdown(text: string): Root {
	const { frontmatter, content } = splitFrontmatter(text)

	let metadata: Partial<Root> = {}
	if (frontmatter.trim()) {
		metadata = parseFrontmatter(frontmatter) as Partial<Root>
	}

	const root: Root = {
		type: 'root',
		title: metadata.title ?? '',
		author: metadata.author ?? '',
		language: metadata.language ?? '',
		translator: metadata.translator ?? '',
		date: metadata.date ?? '',
		content: [],
	}

	const lines = content.split('\n').filter((line) => line.trim() !== '')
	const sectionStack: Section[] = []

	for (const line of lines) {
		if (line[0] === '#') {
			let depth = 0
			while (line[depth] === '#') depth++
			const title = line.slice(depth).trim()

			if (depth === 1) {
				root.title = title
				sectionStack.length = 0
			} else {
				const newSection: Section = {
					type: 'section',
					title,
					depth: depth - 1,
					content: [],
				}

				while (
					sectionStack.length &&
					sectionStack[sectionStack.length - 1]!.depth >= newSection.depth
				) {
					sectionStack.pop()
				}

				const parent =
					sectionStack.length > 0
						? sectionStack[sectionStack.length - 1]!
						: root
				parent.content.push(newSection)

				sectionStack.push(newSection)
			}
		} else {
			const paragraph = parseParagraph(line)

			const parent =
				sectionStack.length > 0 ? sectionStack[sectionStack.length - 1]! : root
			parent.content.push(paragraph)
		}
	}

	return root
}
