import type * as omuso from 'omuso'
import { Link } from '../components/Link'
import { highlightMatches } from '../utils/dom'
import { HeadingElement } from './HeadingElement'

export function SectionLink({
	section,
	query,
}: {
	section: omuso.Section
	query?: string
}) {
	return (
		<Link to={section.slug} query={query} className="or-content__section-link">
			<HeadingElement
				id={section.slug}
				value={highlightMatches(section.title, query)}
				depth={section.depth}
			/>
		</Link>
	)
}
