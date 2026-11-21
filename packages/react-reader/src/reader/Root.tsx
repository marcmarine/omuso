import type { BookContext, SearchFilter } from 'omuso'
import { createContext, useContext, useEffect } from 'react'
import { BookContextProvider } from '../providers/BookContextProvider'
import { I18nProvider } from '../providers/I18nProvider'
import { LayoutProvider } from '../providers/LayoutProvider'
import { RoutingProvider } from '../providers/RoutingProvider'
import { ThemeProvider } from '../providers/ThemeProvider'
import Layout from './Layout'

export interface ReaderRootProps {
	/**
	 * The `BookContext` backing this reader, created via
	 * `createContext({...})` from the `omuso` package.
	 */
	book: BookContext
	/**
	 * The book's language when the URL or the stored location don't give one.
	 * Defaults to the first language of `book`.
	 */
	defaultLanguage?: string
	/**
	 * The language of the interface labels, independent of the book's: it
	 * doesn't follow the language menu. Defaults to `defaultLanguage`.
	 */
	locale?: string
	location?: Partial<Location>
	basePath?: string
	linkComponent?: React.ElementType
	/**
	 * The deepest section level shown as a page, counted in path levels
	 * (`'1'` → 1, `'1.2'` → 2) like `maxNavigationDepth` in `omuso`. Deeper
	 * sections are rendered inline within their page. Keep the context's
	 * `maxNavigationDepth` at or below it, or prev/next lead to sections
	 * already shown inline.
	 */
	maxPageDepth?: number
	/**
	 * Decides which sections are searched (see `SearchFilter` in `omuso`).
	 * It replaces the exclusion of the context's `omitPaths` in search only.
	 * Memoize it (e.g. with `useCallback`), or the search reruns on every
	 * render.
	 */
	searchFilter?: SearchFilter
	/**
	 * The pieces to render. Without them, the complete reader.
	 */
	children?: React.ReactNode
}

const RootContext = createContext(false)

/**
 * Holds the reader's state and renders no DOM of its own: the pieces inside
 * it, and any other component, read the state through the hooks.
 */
export default function Root({
	book,
	defaultLanguage,
	locale,
	location,
	basePath,
	linkComponent,
	maxPageDepth,
	searchFilter,
	children,
}: ReaderRootProps) {
	const isNested = useContext(RootContext)
	const language = defaultLanguage ?? book.languages[0]

	useEffect(() => {
		if (!isNested) return
		console.warn(
			'A reader Root is rendered inside another one. Each Root keeps its own state and URL sync, so the inner one ignores the outer one: compose the pieces inside a single Root instead.',
		)
	}, [isNested])

	return (
		<RootContext.Provider value={true}>
			<I18nProvider locale={locale ?? language}>
				<BookContextProvider
					defaultLanguage={language}
					book={book}
					location={location}
					basePath={basePath}
					searchFilter={searchFilter}
					maxPageDepth={maxPageDepth}
				>
					<RoutingProvider linkComponent={linkComponent}>
						<LayoutProvider>
							<ThemeProvider>{children ?? <Layout />}</ThemeProvider>
						</LayoutProvider>
					</RoutingProvider>
				</BookContextProvider>
			</I18nProvider>
		</RootContext.Provider>
	)
}
