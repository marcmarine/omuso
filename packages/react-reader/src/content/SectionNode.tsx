import type * as omuso from 'omuso'
import type { ReactNode } from 'react'
import { SectionLink } from './SectionLink'

export function SectionNode({
	section,
	query,
	children,
}: {
	section: omuso.Section
	query?: string
	children?: ReactNode
}) {
	return (
		<section id={section.path}>
			<SectionLink section={section} query={query} />
			{children}
		</section>
	)
}
