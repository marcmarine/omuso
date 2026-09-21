import type * as omuso from 'omuso'
import { Link } from '../components/Link'
import { highlightMatches } from '../utils/dom'

export function SectionIndex({
	sections,
	query,
}: {
	sections: omuso.Section[]
	query?: string
}) {
	return (
		<nav>
			<ul className="or-content__index">
				{sections.map((section) => (
					<li key={section.path} className="or-content__index-item">
						<Link
							to={section.slug}
							query={query}
							className="or-content__section-link"
						>
							{highlightMatches(section.title, query)}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}
