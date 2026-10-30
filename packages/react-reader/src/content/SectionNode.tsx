import type * as omuso from 'omuso'
import type { ReactNode } from 'react'
import { highlightMatches } from '../utils/dom'
import { HeadingElement } from './HeadingElement'

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

	// Inline sections are part of the current page, so their titles aren't
	// links: they would lead to content the reader is already viewing.
	return (
		<section id={section.path} className="om-section">
			<HeadingElement
				id={section.slug}
				value={highlightMatches(section.title, query)}
				depth={headingDepth}
			/>
			{children}
		</section>
	)
}
