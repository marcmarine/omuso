import type * as omuso from 'omuso'
import type { ReactNode } from 'react'
import { highlightMatches } from '../utils/dom'
import { useContentComponents } from './ContentComponents'

function normalizeHeadingDepth(sectionDepth: number, baseDepth: number) {
	const relativeDepth = sectionDepth - baseDepth + 1
	return Math.max(1, Math.min(relativeDepth, 6))
}

export function SectionNode({
	section,
	query,
	baseDepth,
	children,
}: {
	section: omuso.Section
	query?: string
	baseDepth: number
	children?: ReactNode
}) {
	const headingDepth = normalizeHeadingDepth(section.depth, baseDepth)
	const { heading: Heading } = useContentComponents()

	// Inline sections are part of the current page, so their titles aren't
	// links: they would lead to content the reader is already viewing.
	return (
		<section id={section.path} className="om-section">
			<Heading section={section} id={section.slug} depth={headingDepth}>
				{highlightMatches(section.title, query)}
			</Heading>
			{children}
		</section>
	)
}
