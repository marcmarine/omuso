import { slugify } from '../common/utils'
import type { Paragraph, Root, Section, SlugStyle } from './types'

export type SectionBuilder = ReturnType<typeof createSectionBuilder>

export function createSectionBuilder(
	root: Root,
	slugStyle: SlugStyle = 'kebab',
) {
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
		const { type, title, ...rest } = section
		const locatedSection: Section = {
			type,
			title,
			...(slugStyle !== 'none' && {
				slug: buildSlug(parent, title, index, slugStyle),
			}),
			...rest,
			path: buildPath(parent, index, '.'),
		}

		parent.content.push(locatedSection)
		sections.push(locatedSection)
	}

	function addContent(paragraph: Paragraph): void {
		const parent = getCurrentParent()
		const index = parent.content.length
		const { type, ...rest } = paragraph
		const locatedParagraph: Paragraph = {
			type,
			...(slugStyle !== 'none' && { slug: buildSlug(parent, null, index) }),
			...rest,
			path: buildPath(parent, index, '_'),
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
	slugStyle?: Exclude<SlugStyle, 'none'>,
): string {
	const suffix = title ? `/${slugify(title, slugStyle)}` : `#${index + 1}`
	return parent.type === 'root' ? suffix : `${parent.slug}${suffix}`
}
