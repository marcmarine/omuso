import type * as omuso from 'omuso'
import type { ReactNode } from 'react'
import { ParagraphNode } from './ParagraphNode'
import { SectionNode } from './SectionNode'

export function ContentNode({
	node,
	query,
	renderSectionContent,
}: {
	node: omuso.ContentElement
	query?: string
	renderSectionContent: (section: omuso.Section) => ReactNode
}) {
	if (node.type === 'section') {
		return (
			<SectionNode section={node} query={query}>
				{renderSectionContent(node)}
			</SectionNode>
		)
	}

	if (node.type === 'paragraph') {
		return <ParagraphNode paragraph={node} query={query} />
	}

	return null
}
