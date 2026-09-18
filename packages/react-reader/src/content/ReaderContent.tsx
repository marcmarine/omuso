import type * as omuso from 'omuso'
import React from 'react'
import { Link } from '../components/Link'
import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import { classes, splitContent } from '../utils'
import { applyMarks, highlightMatches } from '../utils/dom'

export default function SectionContent() {
	const context = useBookContext()
	const { maxDepth } = useLayout()
	const {
		session: { currentSection, breadcrumbs, search },
	} = context
	const { title, path, content = [], depth = 0 } = currentSection || {}
	const subchapter = breadcrumbs[1]

	const isExpanded = depth >= maxDepth
	const hasContent = content.length > 0

	const renderParagraph = (paragraph: omuso.Paragraph) => (
		<ParagraphElement
			key={paragraph.path}
			id={paragraph.path}
			value={applyMarks(paragraph.value, paragraph.marks, search.query)}
		/>
	)

	const renderHeadingButton = (section: omuso.Section) => (
		<Link
			key={section.path}
			to={(section as omuso.Section & { slug: string }).slug}
			query={search.query}
			className="or-content__section-link"
		>
			<Heading
				id={section.path}
				value={highlightMatches(section.title, search.query)}
				depth={section.depth}
			/>
		</Link>
	)

	const renderSection = (
		item: omuso.Section | omuso.Paragraph,
	): React.ReactNode | null => {
		if (item.type === 'paragraph') return renderParagraph(item)
		if (item.type === 'section')
			return (
				<section key={item.path}>
					{renderHeadingButton(item)}
					{renderContent(item.content)}
				</section>
			)
		return null
	}

	const renderContent = (items: (omuso.Section | omuso.Paragraph)[]) =>
		items?.map(renderSection)

	const renderCollapsed = () => {
		const { paragraphs, sections } = splitContent(content)

		return (
			<>
				{paragraphs.map(renderParagraph)}
				{sections.length > 0 && (
					<nav>
						<ul className="or-content__index">
							{sections.map((section) => (
								<li key={section.path} className="or-content__index-item">
									{renderHeadingButton(section)}
								</li>
							))}
						</ul>
					</nav>
				)}
			</>
		)
	}

	return (
		<div className="or-content">
			<Header query={search.query} breadcrumbs={breadcrumbs} />
			<div className="or-content__body">
				{depth > 3 && subchapter && (
					<Link
						className="or-content__subchapter"
						to={subchapter.slug}
						query={search.query}
					>
						<Heading
							value={highlightMatches(subchapter.title, search.query)}
							depth={depth - 1}
						/>
					</Link>
				)}

				<Heading
					value={highlightMatches(title as string, search.query)}
					depth={depth}
					id={path}
				/>

				{hasContent &&
					(isExpanded ? renderContent(content) : renderCollapsed())}
			</div>
		</div>
	)
}

export function ParagraphElement({
	value,
	...rest
}: {
	value: string | React.ReactNode
} & React.HTMLAttributes<HTMLParagraphElement>) {
	return (
		<p {...rest} className="or-paragraph">
			{value}
		</p>
	)
}

export function Heading({
	value,
	depth = 2,
	className,
	...rest
}: {
	value: string | React.ReactNode
	depth?: number
	className?: string
} & React.HTMLAttributes<HTMLHeadingElement>) {
	const sizeByDepth: Record<number, string> = {
		1: 'or-heading--1',
		2: 'or-heading--2',
		3: 'or-heading--3',
		4: 'or-heading--4',
	}

	return React.createElement(
		`h${depth}`,
		{
			className: classes('or-heading', sizeByDepth[depth], className),
			...rest,
		},
		value,
	)
}

export function Header({
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
