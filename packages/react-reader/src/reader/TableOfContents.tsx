import type * as omuso from 'omuso'
import { memo } from 'react'
import { Link } from '../components/Link'
import useLocalStorage from '../hooks/useLocalStorage'
import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import { classes, isWideViewport } from '../utils'

function BookTableOfContents() {
	const { panel, maxDepth, omitSections, i18n } = useLayout()
	const { manifest, session } = useBookContext()
	const { tableOfContents } = manifest
	const { breadcrumbs, search, currentSection } = session
	const [expandedSections, setExpandedSections] = useLocalStorage<{
		[key: string]: boolean
	}>('tocExpandedSections', {})

	const toggleSection = (id: string) => {
		setExpandedSections({
			...expandedSections,
			[id]: !expandedSections[id],
		})
	}

	const closePanel = () => {
		if (isWideViewport()) return
		panel.left.toggle()
	}

	const withOmittedSections = (sections: omuso.Section[]) =>
		sections.filter((section) => !omitSections?.includes(section.path))

	// The current section is the page; its ancestors are marked as current
	// within their own list.
	const ariaCurrent = (path: string) => {
		if (currentSection?.path === path) return 'page'
		if (breadcrumbs.some((crumb) => crumb.path === path)) return true
		return undefined
	}

	return (
		<nav className="or-toc" aria-label={i18n.t('tableOfContents')}>
			<ul className="or-toc__list">
				{withOmittedSections(tableOfContents).map((section) => {
					const hasChildren =
						section.content.length > 0 &&
						withOmittedSections(
							section.content.filter((item) => item.type === 'section'),
						).some((item) => item.type === 'section')
					const isExpanded = expandedSections[section.path]

					const hasPath = breadcrumbs.length > 0
					const isAtSection = breadcrumbs[0]?.path === section.path
					const isCollapsed = breadcrumbs.length >= 2 && isExpanded
					const shouldShowChildren = hasChildren && maxDepth > 2

					return (
						<li key={section.path} className="or-toc__item">
							<div
								className={classes(
									'or-toc__row',
									'or-interactive',
									hasPath &&
										isAtSection &&
										!isCollapsed &&
										'or-toc__row--active',
								)}
							>
								{shouldShowChildren && (
									<button
										className={classes(
											'or-toc__toggle',
											'or-interactive',
											isAtSection && !isCollapsed && 'or-toc__toggle--active',
										)}
										onClick={() => toggleSection(section.path)}
										type="button"
										aria-expanded={Boolean(isExpanded)}
										aria-label={section.title}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden="true"
											fill="none"
											focusable="false"
											viewBox="0 0 24 24"
											strokeWidth={2}
											stroke="currentColor"
											className={classes(
												'or-icon or-icon--sm or-toc__chevron',
												isExpanded && 'or-toc__chevron--expanded',
											)}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="m8.25 4.5 7.5 7.5-7.5 7.5"
											/>
										</svg>
									</button>
								)}
								<Link
									path={section.path}
									query={search.query}
									aria-current={ariaCurrent(section.path)}
									className={classes(
										'or-toc__link',
										shouldShowChildren && 'or-toc__link--indented',
									)}
									onClick={closePanel}
								>
									{section.title}
								</Link>
							</div>
							{shouldShowChildren && isExpanded && (
								<ul className="or-toc__sub">
									{withOmittedSections(
										section.content.filter((item) => item.type === 'section'),
									).map((item) => {
										const isActive = breadcrumbs[1]?.path === item.path

										return (
											<li key={item.path} className="or-toc__subitem">
												<Link
													path={item.path}
													query={search.query}
													aria-current={ariaCurrent(item.path)}
													className={classes(
														'or-toc__sublink',
														'or-interactive',
														isActive && 'or-toc__sublink--active',
													)}
													onClick={closePanel}
												>
													{item.title}
												</Link>
											</li>
										)
									})}
								</ul>
							)}
						</li>
					)
				})}
			</ul>
		</nav>
	)
}

export default memo(BookTableOfContents)
