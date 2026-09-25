import { Link } from '../components/Link'
import { useBookContext } from '../providers/BookContextProvider'
import { classes } from '../utils'

export default function Navigation() {
	const context = useBookContext()
	const {
		session: { search, nextSection, prevSection, currentSection },
		manifest: { slugs },
	} = context

	const { 1: firstSectionSlug } = slugs

	return (
		<div className="or-nav">
			<Link
				to={prevSection?.slug || '/'}
				query={search.query}
				className={classes(
					'or-icon-button',
					'or-interactive',
					'or-nav__button',
					'or-nav__button--prev',
					!currentSection && 'or-nav__button--disabled',
				)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					fill="none"
					focusable="false"
					viewBox="0 0 24 24"
					strokeWidth={1.9}
					stroke="currentColor"
					className="or-icon"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
					/>
				</svg>
			</Link>
			<Link
				to={String(nextSection?.slug || firstSectionSlug)}
				query={search.query}
				className={classes(
					'or-icon-button',
					'or-interactive',
					'or-nav__button',
					'or-nav__button--next',
					currentSection && !nextSection && 'or-nav__button--disabled',
				)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					aria-hidden="true"
					fill="none"
					focusable="false"
					viewBox="0 0 24 24"
					strokeWidth={1.9}
					stroke="currentColor"
					className="or-icon"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
					/>
				</svg>
			</Link>
		</div>
	)
}
