import type * as omuso from 'omuso'
import { splitContent } from '../utils'
import { useContentComponents } from './ContentComponents'
import { ParagraphNode } from './ParagraphNode'

export function CollapsedSectionContent({
	section,
	query,
}: {
	section: omuso.Section
	query?: string
}) {
	const { paragraphs, sections } = splitContent(section.content)
	const { sectionIndex: SectionIndex } = useContentComponents()

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
