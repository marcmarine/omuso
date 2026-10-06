import { Link } from '../components/Link'
import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import { COVER_PATH } from '../utils/routes'

export default function Navigation() {
	const context = useBookContext()
	const {
		session: { search, nextSection, prevSection, currentSection },
		manifest: { paths },
	} = context
	const { i18n } = useLayout()

	const firstSectionPath = paths[0] ?? COVER_PATH
	const isPrevDisabled = !currentSection
	const isNextDisabled = Boolean(currentSection && !nextSection)

	return (
		<nav className="om-pager" aria-label={i18n.t('chapterNavigation')}>
			<Link
				path={prevSection?.path ?? COVER_PATH}
				query={search.query}
				rel="prev"
				aria-label={i18n.t('previousChapter')}
				aria-disabled={isPrevDisabled || undefined}
				tabIndex={isPrevDisabled ? -1 : undefined}
				className="om-icon-button om-interactive om-pager__prev"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					fill="none"
					focusable="false"
					viewBox="0 0 24 24"
					strokeWidth={1.9}
					stroke="currentColor"
					className="om-icon"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
					/>
				</svg>
			</Link>
			<Link
				path={nextSection?.path ?? firstSectionPath}
				query={search.query}
				rel="next"
				aria-label={i18n.t('nextChapter')}
				aria-disabled={isNextDisabled || undefined}
				tabIndex={isNextDisabled ? -1 : undefined}
				className="om-icon-button om-interactive om-pager__next"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					fill="none"
					focusable="false"
					viewBox="0 0 24 24"
					strokeWidth={1.9}
					stroke="currentColor"
					className="om-icon"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
					/>
				</svg>
			</Link>
		</nav>
	)
}
