import type * as omuso from 'omuso'
import { useEffect, useRef } from 'react'
import { Link } from '../components/Link'
import { CollapsedSectionContent } from '../content/CollapsedSectionContent'
import { ContentRenderer } from '../content/ContentRenderer'
import { HeadingElement } from '../content/HeadingElement'
import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import { classes } from '../utils'
import { highlightMatches } from '../utils/dom'

function CurrentSectionContent({
	section,
	query,
	maxDepth,
}: {
	section: omuso.Section
	query?: string
	maxDepth: number
}) {
	const hasContent = section.content.length > 0
	if (!hasContent) return null

	const isExpanded = section.depth > maxDepth

	if (isExpanded)
		return (
			<ContentRenderer
				content={section.content}
				query={query}
				baseDepth={section.depth}
			/>
		)

	return <CollapsedSectionContent section={section} query={query} />
}

export function ContentBody({
	section,
	query,
	maxDepth,
}: {
	section: omuso.Section
	query?: string
	maxDepth: number
}) {
	return (
		<div className="or-content__body">
			<HeadingElement
				id={section.path}
				value={highlightMatches(section.title, query)}
				// Normalize heading depth so each page can use a single h1.
				depth={1}
			/>

			<CurrentSectionContent
				section={section}
				query={query}
				maxDepth={maxDepth}
			/>
		</div>
	)
}

export function ContentHeader({
	query,
	breadcrumbs,
	className,
}: {
	query?: string
	breadcrumbs: Array<omuso.SectionReference>
	className?: string
}) {
	const parent = breadcrumbs.at(-2)

	return (
		<div className={classes('or-content__header', className)}>
			<nav className="or-content__crumbs">
				<ol>
					{parent && (
						<li className="or-content__crumb">
							<Link to={parent.slug} query={query}>
								{parent.title}
							</Link>
						</li>
					)}
				</ol>
			</nav>
		</div>
	)
}

export default function Content() {
	const context = useBookContext()
	const { maxDepth } = useLayout()
	const {
		session: { currentSection, breadcrumbs, search },
	} = context
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!currentSection?.path) return
		ref.current?.scrollIntoView({ block: 'start' })
	}, [currentSection?.path])

	if (!currentSection) return null

	return (
		<div ref={ref} className="or-content">
			<ContentHeader query={search.query} breadcrumbs={breadcrumbs} />
			<ContentBody
				section={currentSection}
				query={search.query}
				maxDepth={maxDepth}
			/>
		</div>
	)
}
