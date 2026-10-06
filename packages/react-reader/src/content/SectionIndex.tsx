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
			<ul className="om-section-index">
				{sections.map((section) => (
					<li key={section.path} className="om-section-index__item">
						<Link
							path={section.path}
							query={query}
							className="om-section-index__link"
						>
							{highlightMatches(section.title, query)}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}
