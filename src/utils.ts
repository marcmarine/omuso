import type { Mark, MarkRule, Paragraph, Section } from './definitions'

export function splitFrontmatter(text: string): {
	frontmatter: string
	content: string
} {
	const start = text.indexOf('---\n')
	if (start !== 0) return { frontmatter: '', content: text }

	const end = text.indexOf('\n---', start + 4)
	if (end === -1) return { frontmatter: '', content: text }

	const frontmatter = text.slice(start + 4, end).trim()
	const content = text.slice(end + 4).trimStart()

	return { frontmatter, content }
}

export function parseFrontmatter(frontmatter: string): Record<string, string> {
	const metadata: Record<string, string> = {}

	for (const line of frontmatter.split(/\r?\n/)) {
		const sep = line.indexOf(':')
		if (sep > -1) {
			const key = line.slice(0, sep).trim()
			const value = line.slice(sep + 1).trim()
			if (key) metadata[key] = value
		}
	}

	return metadata
}

export function parseParagraph(text: string): Paragraph {
	let value = ''
	const marks: Mark[] = []

	let buffer = ''
	let inside: MarkRule | null = null

	for (let i = 0; i < text.length; i++) {
		const remaining = text.slice(i)

		if (inside) {
			const { delimiter } = inside
			if (remaining.startsWith(delimiter)) {
				const start = value.length
				value += buffer
				const end = value.length

				marks.push({
					type: inside.type as Mark['type'],
					start,
					end,
				})

				buffer = ''
				inside = null
				i += delimiter.length - 1
				continue
			} else {
				buffer += text[i]
				continue
			}
		}

		const foundRule = markRules.find((rule) =>
			remaining.startsWith(rule.delimiter),
		)
		if (foundRule) {
			inside = foundRule
			buffer = ''
			i += foundRule.delimiter.length - 1
		} else {
			value += text[i]
		}
	}

	if (inside) {
		value += inside.delimiter + buffer
	}

	return {
		type: 'paragraph',
		value,
		marks,
	}
}

export function parseSection(line: string): Section {
	let depth = 0
	while (line[depth] === '#') depth++
	const title = line.slice(depth).trim()

	return {
		type: 'section',
		title,
		depth: depth - 1,
		content: [],
	}
}

const markRules: MarkRule[] = [
	{
		type: 'emphasis',
		delimiter: '*',
	},
	{
		type: 'emphasis',
		delimiter: '_',
	},
]
