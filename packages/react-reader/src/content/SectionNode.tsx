import type * as omuso from 'omuso'
import type { ReactNode } from 'react'
import { Link } from '../components/Link'
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

	return (
		<section id={section.path}>
			<Link
				to={section.slug}
				query={query}
				className="or-content__section-link"
			>
				<HeadingElement
					id={section.slug}
					value={highlightMatches(section.title, query)}
					depth={headingDepth}
				/>
			</Link>
			{children}
		</section>
	)
}
