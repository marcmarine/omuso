import type * as omuso from 'omuso'
import { ContentNode } from './ContentNode'

export function ContentRenderer({
	content,
	query,
}: {
	content: omuso.Content
	query?: string
}) {
	return (
		<>
			{content.map((node) => (
				<ContentNode
					key={node.path}
					node={node}
					query={query}
					renderSectionContent={(section) => (
						<ContentRenderer content={section.content} query={query} />
					)}
				/>
			))}
		</>
	)
}
