import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from '../components/Link'
import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import { highlightMatches } from '../utils/dom'

export function Search() {
	const { session } = useBookContext()
	const { panel } = useLayout()
	const { query, results, totalMatches } = session.search
	const { i18n } = useLayout()

	const closePanel = () => {
		if (window.innerWidth >= 1024) return
		panel.right.toggle()
	}

	return (
		<aside className="or-search">
			<div className="or-search__header">
				<SearchInput />
				<div className="or-search__meta">
					{totalMatches > 0 && (
						<p className="or-search__meta-text">{`${totalMatches} ${i18n.t('resultsIn')} ${results.length} ${i18n.t(results.length === 1 ? 'chapter' : 'chapters')} ${i18n.t('forWord')} "${query}"`}</p>
					)}
				</div>
			</div>
			<ul className="or-search__results">
				{query.length > 0 && results.length === 0 && (
					<li className="or-search__empty">
						<p className="or-search__empty-text">
							{`${i18n.t('noResults')} "${query}"`}
						</p>
					</li>
				)}
				{results.map((item) => {
					if (item.type === 'section') {
						if (item.titleMatchCount > 0)
							return (
								<li
									key={item.path}
									className="or-search__result or-interactive"
								>
									<Link
										to={item.slug}
										query={query}
										className="or-search__section-link"
										onClick={closePanel}
									>
										<h4 className="or-search__section-parent">
											{item.parentSection?.title || ''}
										</h4>
										<h3 className="or-search__section-title">
											{highlightMatches(item.title, query)}
										</h3>
									</Link>
								</li>
							)
						return (
							<li
								key={item.path}
								className="or-search__result or-search__result--paragraph"
							>
								<div className="or-search__paragraph-body">
									{item.paragraphs.map((paragraph) => (
										<p key={paragraph.path} className="or-search__paragraph">
											{highlightMatches(paragraph.value, query)}
										</p>
									))}

									<div className="or-search__paragraph-footer">
										<Link
											to={item.slug}
											query={query}
											className="or-search__view or-interactive"
											onClick={closePanel}
										>
											View
										</Link>
										{item.parentSection && (
											<Link
												to={item.parentSection?.slug}
												query={query}
												className="or-search__parent"
												onClick={closePanel}
											>
												<h4 className="or-search__parent-title">
													{item.parentSection.title}
												</h4>
											</Link>
										)}
									</div>
								</div>
							</li>
						)
					}
					return null
				})}
			</ul>
		</aside>
	)
}

function SearchInput() {
	const ref = useRef<HTMLInputElement>(null)
	const { session, search, resetSearch } = useBookContext()
	const { query } = session.search
	const [value, setValue] = useState(query)
	const { i18n } = useLayout()

	useEffect(() => {
		if (value) {
			const url = new URL(window.location.href)
			url.searchParams.set('query', value)
			window.history.replaceState({}, '', url)
		} else {
			const url = new URL(window.location.href)
			url.searchParams.delete('query')
			window.history.replaceState({}, '', url)
		}
	}, [value])

	useEffect(() => {
		const handler = setTimeout(() => search(value), 280)
		return () => clearTimeout(handler)
	}, [value, search])

	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
			if (ref.current) {
				ref.current.focus()
			}
		}
		if (event.key === 'Escape') {
			if (ref.current) {
				ref.current.blur()
			}
		}
	}, [])

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleKeyDown])

	const handleReset = () => {
		resetSearch()
		setValue('')
	}

	return (
		<div className="or-search__input-wrap">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				focusable="false"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={2.2}
				stroke="currentColor"
				className="or-search__icon"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
				/>
			</svg>
			<input
				ref={ref}
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				className="or-search__input"
				placeholder={i18n.t('searchContent')}
			/>
			{value && (
				<button
					onClick={handleReset}
					type="button"
					className="or-search__reset or-interactive"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						focusable="false"
						viewBox="0 0 20 20"
						fill="currentColor"
						className="or-icon"
					>
						<path
							fillRule="evenodd"
							d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
			)}
		</div>
	)
}

export default memo(Search)
