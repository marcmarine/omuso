import type * as omuso from 'omuso'
import { useMemo } from 'react'
import { Link } from '../components/Link'
import { CollapsedSectionContent } from '../content/CollapsedSectionContent'
import {
	type ContentComponents,
	ContentComponentsContext,
	defaultContentComponents,
	useContentComponents,
} from '../content/ContentComponents'
import { ContentRenderer } from '../content/ContentRenderer'
import { useReader } from '../providers/BookContextProvider'
import { useReaderI18n } from '../providers/I18nProvider'
import { classes, sectionLevel } from '../utils'
import { highlightMatches } from '../utils/dom'

function CurrentSectionContent({
	section,
	query,
	maxPageDepth,
}: {
	section: omuso.Section
	query?: string
	maxPageDepth: number
}) {
	const hasContent = section.content.length > 0
	if (!hasContent) return null

	// At `maxPageDepth` a section is the last page level: its subsections
	// belong to it and are rendered inline instead of linked from an index.
	const rendersInline = sectionLevel(section.path) >= maxPageDepth

	if (rendersInline)
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
	maxPageDepth,
}: {
	section: omuso.Section
	query?: string
	maxPageDepth: number
}) {
	const { heading: Heading } = useContentComponents()

	return (
		<div className="om-content__body">
			{/* Normalize heading depth so each page can use a single h1. */}
			<Heading section={section} id={section.path} depth={1}>
				{highlightMatches(section.title, query)}
			</Heading>

			<CurrentSectionContent
				section={section}
				query={query}
				maxPageDepth={maxPageDepth}
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
	const { t } = useReaderI18n()

	return (
		<div className={classes('om-content__header', className)}>
			{parent && (
				<nav className="om-breadcrumb" aria-label={t('breadcrumb')}>
					<ol>
						<li className="om-breadcrumb__item">
							<Link path={parent.path} query={query}>
								{parent.title}
							</Link>
						</li>
					</ol>
				</nav>
			)}
		</div>
	)
}

export default function Content({
	components,
}: {
	/**
	 * Replaces how paragraphs, headings and subsection indexes are rendered.
	 */
	components?: ContentComponents
}) {
	const {
		state: {
			session: { currentSection, breadcrumbs, search },
		},
		meta: { maxPageDepth },
	} = useReader()
	const value = useMemo(
		() => ({ ...defaultContentComponents, ...components }),
		[components],
	)
	if (!currentSection) return null

	return (
		<ContentComponentsContext.Provider value={value}>
			<article className="om-content">
				<ContentHeader query={search.query} breadcrumbs={breadcrumbs} />
				<ContentBody
					section={currentSection}
					query={search.query}
					maxPageDepth={maxPageDepth}
				/>
			</article>
		</ContentComponentsContext.Provider>
	)
}
