import type * as omuso from 'omuso'
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

	const isExpanded = section.depth >= maxDepth

	if (isExpanded)
		return <ContentRenderer content={section.content} query={query} />

	return <CollapsedSectionContent section={section} query={query} />
}

export function ContentBody({
	section,
	breadcrumbs,
	query,
	maxDepth,
}: {
	section: omuso.Section
	breadcrumbs: Array<omuso.SectionReference>
	query?: string
	maxDepth: number
}) {
	const subchapter = breadcrumbs[1]

	return (
		<div className="or-content__body">
			{section.depth > 3 && subchapter && (
				<Link
					className="or-content__subchapter"
					to={subchapter.slug}
					query={query}
				>
					<HeadingElement
						id={section.path}
						value={highlightMatches(subchapter.title, query)}
						depth={section.depth - 1}
					/>
				</Link>
			)}

			<HeadingElement
				id={section.path}
				value={highlightMatches(section.title, query)}
				depth={section.depth}
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
	const [chapter, subchapter] = breadcrumbs

	return (
		<div className="or-content__header">
			<div className="or-content__crumbs">
				{subchapter?.title && chapter && (
					<Link className="or-content__crumb" to={chapter.slug} query={query}>
						<h2 className={classes('or-content__crumb-title', className)}>
							{chapter.title}
						</h2>
					</Link>
				)}
			</div>
		</div>
	)
}

export default function Content() {
	const context = useBookContext()
	const { maxDepth } = useLayout()
	const {
		session: { currentSection, breadcrumbs, search },
	} = context

	if (!currentSection) return null

	return (
		<div className="or-content">
			<ContentHeader query={search.query} breadcrumbs={breadcrumbs} />
			<ContentBody
				section={currentSection}
				breadcrumbs={breadcrumbs}
				query={search.query}
				maxDepth={maxDepth}
			/>
		</div>
	)
}
