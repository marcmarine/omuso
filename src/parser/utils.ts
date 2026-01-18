import type { Paragraph, Root, Section } from './types'

export type SectionBuilder = ReturnType<typeof createSectionBuilder>

export function createSectionBuilder(root: Root) {
	const sections: Section[] = []

	function getCurrentParent(): Section | Root {
		return sections.at(-1) ?? root
	}

	function pushSection(section: Section): void {
		while (
			sections.length > 0 &&
			(sections.at(-1) as Section).depth >= section.depth
		) {
			sections.pop()
		}

		const parent = getCurrentParent()
		const index = countSectionsIn(parent)
		const locatedSection = {
			...section,
			path: buildPath(parent, index, '.'),
			slug: buildSlug(parent, section.title, index),
		}

		parent.content.push(locatedSection)
		sections.push(locatedSection)
	}

	function addContent(paragraph: Paragraph): void {
		const parent = getCurrentParent()
		const index = parent.content.length
		const locatedParagraph = {
			...paragraph,
			path: buildPath(parent, index, '_'),
			slug: buildSlug(parent, null, index),
		}

		parent.content.push(locatedParagraph)
	}

	return { pushSection, addContent }
}

function countSectionsIn(parent: Section | Root): number {
	let count = 0
	for (const item of parent.content) {
		if (item.type === 'section') count++
	}
	return count
}

function buildPath(
	parent: Section | Root,
	index: number,
	separator: string,
): string {
	const num = index + 1
	return parent.type === 'root'
		? separator === '.'
			? `${num}`
			: `${separator}${num}`
		: `${parent.path}${separator}${num}`
}

function buildSlug(
	parent: Section | Root,
	title: string | null,
	index: number,
): string {
	const suffix = title ? `/${slugify(title)}` : `#${index + 1}`
	return parent.type === 'root' ? suffix : `${parent.slug}${suffix}`
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\p{L}\p{N}\s.-]/gu, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/\./g, '-')
}
