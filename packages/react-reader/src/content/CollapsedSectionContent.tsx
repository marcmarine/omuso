import type * as omuso from 'omuso'
import { splitContent } from '../utils'
import { ParagraphNode } from './ParagraphNode'
import { SectionIndex } from './SectionIndex'

export function CollapsedSectionContent({
	section,
	query,
}: {
	section: omuso.Section
	query?: string
}) {
	const { paragraphs, sections } = splitContent(section.content)

	return (
		<>
			{paragraphs.map((paragraph) => (
				<ParagraphNode
					key={paragraph.path}
					paragraph={paragraph}
					query={query}
				/>
			))}

			{sections.length > 0 && (
				<SectionIndex sections={sections} query={query} />
			)}
		</>
	)
}
