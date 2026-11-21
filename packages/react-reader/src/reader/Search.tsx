import { memo, useEffect, useRef, useState } from 'react'
import { Link } from '../components/Link'
import { useShortcut } from '../hooks/useShortcut'
import { useReader } from '../providers/BookContextProvider'
import { useReaderI18n } from '../providers/I18nProvider'
import { useReaderPanels } from '../providers/LayoutProvider'
import { highlightMatches } from '../utils/dom'

export function Search() {
	const {
		state: { session },
	} = useReader()
	const { query, results, totalMatches } = session.search
	const { t } = useReaderI18n()

	return (
		<search className="om-search">
			<div className="om-search__header">
				<SearchInput />
				<output className="om-search__meta">
					{totalMatches > 0 && (
						<span className="om-search__meta-text">{`${totalMatches} ${t('resultsIn')} ${results.length} ${t(results.length === 1 ? 'chapter' : 'chapters')} ${t('forWord')} "${query}"`}</span>
					)}
				</output>
			</div>
			<ul className="om-search__results">
				{query.length > 0 && results.length === 0 && (
					<li className="om-search__empty">
						<p className="om-search__empty-text">
							{`${t('noResults')} "${query}"`}
						</p>
					</li>
				)}
				{results.map((item) => {
					if (item.type === 'section') {
						if (item.titleMatchCount > 0)
							return (
								<li
									key={item.path}
									className="om-search__result om-interactive"
								>
									<Link
										path={item.path}
										query={query}
										className="om-search__result-link"
									>
										<p className="om-search__result-context">
											{item.parentSection?.title || ''}
										</p>
										<p className="om-search__result-title">
											{highlightMatches(item.title, query)}
										</p>
									</Link>
								</li>
							)
						return (
							<li key={item.path} className="om-search__result">
								<div className="om-search__excerpts">
									{item.paragraphs.map((paragraph) => (
										<p key={paragraph.path} className="om-search__excerpt">
											{highlightMatches(paragraph.value, query)}
										</p>
									))}

									<div className="om-search__result-footer">
										<Link
											path={item.path}
											query={query}
											className="om-search__result-action om-interactive"
										>
											View
										</Link>
										<Link
											path={item.path}
											query={query}
											className="om-search__result-source"
										>
											<p className="om-search__result-source-title">
												{item.title}
											</p>
										</Link>
									</div>
								</div>
							</li>
						)
					}
					return null
				})}
			</ul>
		</search>
	)
}

function SearchInput() {
	const ref = useRef<HTMLInputElement>(null)
	const {
		state: { session },
		actions: { setQuery, clearQuery },
	} = useReader()
	const { query } = session.search
	const [value, setValue] = useState(query)
	const submittedQueryRef = useRef(query)
	const { t } = useReaderI18n()

	// Follow query changes that did not come from this input (e.g. history
	// navigation). Updating `value` also cancels any pending debounce.
	useEffect(() => {
		if (query === submittedQueryRef.current) return
		submittedQueryRef.current = query
		setValue(query)
	}, [query])

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
		const handler = setTimeout(() => {
			submittedQueryRef.current = value
			setQuery(value)
		}, 280)
		return () => clearTimeout(handler)
	}, [value, setQuery])

	// ⌘K toggles the panel (see `SearchToggle`). The input can't take focus
	// while the panel is hidden, so it's focused once the panel has opened,
	// and left alone when ⌘K closes it.
	const { right } = useReaderPanels()
	const focusOnOpen = useRef(false)
	useShortcut('mod+k', () => {
		focusOnOpen.current = !right.isOpen
	})
	useEffect(() => {
		if (!right.isOpen || !focusOnOpen.current) return
		focusOnOpen.current = false
		ref.current?.focus()
	}, [right.isOpen])

	useShortcut('escape', () => ref.current?.blur())

	const handleReset = () => {
		clearQuery()
		setValue('')
	}

	return (
		<div className="om-search__field">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				focusable="false"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={2.2}
				stroke="currentColor"
				className="om-search__icon"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
				/>
			</svg>
			<input
				ref={ref}
				type="search"
				aria-label={t('searchContent')}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				className="om-search__input"
				placeholder={t('searchContent')}
			/>
			{value && (
				<button
					onClick={handleReset}
					type="button"
					aria-label={t('clearSearch')}
					className="om-search__reset om-interactive"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						focusable="false"
						viewBox="0 0 20 20"
						fill="currentColor"
						className="om-icon"
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
