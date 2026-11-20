import type { BookContext, SearchFilter } from 'omuso'
import { createContext, useContext, useEffect } from 'react'
import { BookContextProvider } from '../providers/BookContextProvider'
import { I18nProvider } from '../providers/I18nProvider'
import { LayoutProvider } from '../providers/LayoutProvider'
import { RoutingProvider } from '../providers/RoutingProvider'
import { ThemeProvider } from '../providers/ThemeProvider'

export interface ReaderRootProps {
	location?: Partial<Location>
	language: string
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
	 * The `BookContext` backing this reader, created via
	 * `createContext({...})` from the `omuso` package.
	 */
	context: BookContext
	children: React.ReactNode
}

const RootContext = createContext(false)

/**
 * Holds the reader's state and renders no DOM of its own: the pieces inside
 * it, and any other component, read the state through the hooks.
 */
export default function Root({
	location,
	language,
	basePath,
	linkComponent,
	maxPageDepth,
	searchFilter,
	context,
	children,
}: ReaderRootProps) {
	const isNested = useContext(RootContext)

	useEffect(() => {
		if (!isNested) return
		console.warn(
			'A reader Root is rendered inside another one. Each Root keeps its own state and URL sync, so the inner one ignores the outer one: compose the pieces inside a single Root instead.',
		)
	}, [isNested])

	return (
		<RootContext.Provider value={true}>
			<I18nProvider locale={language}>
				<BookContextProvider
					defaultLanguage={language}
					context={context}
					location={location}
					basePath={basePath}
					searchFilter={searchFilter}
					maxPageDepth={maxPageDepth}
				>
					<RoutingProvider linkComponent={linkComponent}>
						<LayoutProvider>
							<ThemeProvider>{children}</ThemeProvider>
						</LayoutProvider>
					</RoutingProvider>
				</BookContextProvider>
			</I18nProvider>
		</RootContext.Provider>
	)
}
