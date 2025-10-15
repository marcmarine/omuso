import type { Root, Section } from '../types'
import type { SectionStack } from '../utils'

export function processHeading(
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
		depth: markdownDepth,
		content: [],
	}
}
