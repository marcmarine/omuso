import type * as omuso from 'omuso'
import { SectionLink } from './SectionLink'

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
						<SectionLink section={section} query={query} />
					</li>
				))}
			</ul>
		</nav>
	)
}
