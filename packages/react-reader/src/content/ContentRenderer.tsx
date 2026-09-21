import type * as omuso from 'omuso'
import { ContentNode } from './ContentNode'

export function ContentRenderer({
	content,
	query,
	baseDepth,
}: {
	content: omuso.Content
	query?: string
	baseDepth: number
}) {
	return (
		<>
			{content.map((node) => (
				<ContentNode
					key={node.path}
					node={node}
					query={query}
					baseDepth={baseDepth}
					renderSectionContent={(section) => (
						<ContentRenderer
							content={section.content}
							query={query}
							baseDepth={baseDepth}
						/>
					)}
				/>
			))}
		</>
	)
}
