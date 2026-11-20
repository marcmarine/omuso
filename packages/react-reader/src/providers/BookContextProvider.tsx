import type { BookContext, Manifest, SearchFilter, Session } from 'omuso'
import React, { useMemo } from 'react'
import useReaderSession from '../hooks/useReaderSession'
import { resolveLanguage } from '../utils'
import {
	getInitialLocation,
	getInitialSearchQuery,
	type ReaderLocation,
	resolveReaderLocation,
	writeStoredLocation,
} from '../utils/location'
import {
	getSearchQuery,
	getWindowRoute,
	normalizeBasePath,
	parseRoute,
	prependBasePath,
	type RouteState,
	slugForPath,
	stripBasePath,
} from '../utils/routes'

/**
 * The reader's live state, the actions that change it and the reference
 * data that doesn't change while reading.
 */
export type ReaderValue = {
	state: {
		/**
		 * The active language of the book.
		 */
		language: string
		session: Session
	}
	actions: {
		/**
		 * Navigates to a URL (slug) or to a section `path`. Paths go through
		 * their slug when the book has one, so the URL stays in sync.
		 */
		navigate: (target: string | { path: string }) => void
		setQuery: (query: string) => void
		clearQuery: () => void
		setLanguage: (language: string) => void
	}
	meta: {
		book: BookContext
		/**
		 * The manifest of the active language.
		 */
		manifest: Manifest
		languages: Array<string>
		basePath: string
		/**
		 * The deepest section level shown as a page. Deeper sections are
		 * rendered inline within their page.
		 */
		maxPageDepth: number
	}
}

export const ReaderValueContext = React.createContext<ReaderValue | undefined>(
	undefined,
)

export function BookContextProvider({
	children,
	defaultLanguage,
	book,
	location: externalLocation,
	basePath,
	searchFilter,
	maxPageDepth = Infinity,
}: {
	children: React.ReactNode
	defaultLanguage?: string
	book: BookContext
	location?: Partial<Location>
	basePath?: string
	searchFilter?: SearchFilter
	maxPageDepth?: number
}) {
	useDepthWarning(book, maxPageDepth)

	const manifests = React.useMemo(() => book.manifests, [book])
	const manifestMap = manifests as Record<string, Manifest>
	const availableLanguages = useMemo(() => Object.keys(manifests), [manifests])
	const normalizedBasePath = useMemo(
		() => normalizeBasePath(basePath),
		[basePath],
	)

	const [location, setLocationState] = React.useState<ReaderLocation>(() =>
		getInitialLocation(
			externalLocation,
			normalizedBasePath,
			defaultLanguage,
			availableLanguages,
			manifestMap,
		),
	)
	const [searchQuery, setSearchQuery] = React.useState<string | undefined>(() =>
		getInitialSearchQuery(externalLocation, normalizedBasePath),
	)

	const setLocation = React.useCallback((nextLocation: ReaderLocation) => {
		setLocationState((previousLocation) => {
			if (
				previousLocation.language === nextLocation.language &&
				previousLocation.path === nextLocation.path
			) {
				return previousLocation
			}
			return nextLocation
		})
	}, [])

	const validatedLanguage = useMemo(
		() =>
			resolveLanguage([location.language, defaultLanguage], availableLanguages),
		[location.language, availableLanguages, defaultLanguage],
	)

	const { manifest, session } = useReaderSession(
		book,
		location.path,
		searchQuery,
		validatedLanguage,
		searchFilter,
	)

	const syncFromRoute = React.useCallback(
		(route: RouteState, preferredLanguage: string) => {
			// The URL is the source of truth: a route without `?query` clears
			// the search.
			const nextQuery = getSearchQuery(route)
			setSearchQuery((previousQuery) =>
				previousQuery === nextQuery ? previousQuery : nextQuery,
			)

			const nextLocation = resolveReaderLocation(
				route,
				preferredLanguage,
				availableLanguages,
				manifestMap,
			)
			if (!nextLocation) {
				if (route.pathname && route.pathname !== '/') {
					console.warn(`Slug not found: ${route.pathname}`)
				}
				return
			}

			if (
				nextLocation.language === location.language &&
				nextLocation.path === location.path
			) {
				return
			}

			setLocation(nextLocation)
		},
		[
			availableLanguages,
			location.language,
			location.path,
			manifestMap,
			setLocation,
		],
	)

	React.useEffect(() => {
		writeStoredLocation(location)
	}, [location])

	const externalPathname = externalLocation?.pathname
	const externalSearch = externalLocation?.search
	const hasExternalLocation =
		externalPathname !== undefined || externalSearch !== undefined
	const routeSyncInitializedRef = React.useRef(false)

	React.useEffect(() => {
		if (!hasExternalLocation) return
		if (!routeSyncInitializedRef.current) {
			routeSyncInitializedRef.current = true
			return
		}

		const publicRoute = parseRoute({
			pathname: externalPathname,
			search: externalSearch,
		})
		const readerPathname = stripBasePath(
			publicRoute.pathname,
			normalizedBasePath,
		)
		if (readerPathname === undefined) return

		syncFromRoute(
			{ pathname: readerPathname, search: publicRoute.search },
			validatedLanguage,
		)
	}, [
		hasExternalLocation,
		externalPathname,
		externalSearch,
		normalizedBasePath,
		syncFromRoute,
		validatedLanguage,
	])

	React.useEffect(() => {
		if (typeof window === 'undefined') return

		const handlePopState = () => {
			const publicRoute = getWindowRoute()
			const readerPathname = stripBasePath(
				publicRoute.pathname,
				normalizedBasePath,
			)
			if (readerPathname === undefined) return

			syncFromRoute(
				{ pathname: readerPathname, search: publicRoute.search },
				validatedLanguage,
			)
		}

		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [normalizedBasePath, syncFromRoute, validatedLanguage])

	const navigate = React.useCallback(
		(target: string | { path: string }) => {
			const currentSlug =
				typeof target === 'string' ? target : slugForPath(target.path, manifest)

			if (currentSlug === undefined && typeof target !== 'string') {
				setLocation({ language: validatedLanguage, path: target.path })
				return
			}

			if (!currentSlug) return

			const parsedRoute = parseRoute(currentSlug)
			const strippedPathname = stripBasePath(
				parsedRoute.pathname,
				normalizedBasePath,
			)
			const route: RouteState = {
				...parsedRoute,
				pathname: strippedPathname ?? parsedRoute.pathname,
			}

			if (!route.search && typeof window !== 'undefined') {
				const currentQuery = getSearchQuery(getWindowRoute())
				if (currentQuery) {
					route.search = `?query=${encodeURIComponent(currentQuery)}`
				}
			}

			syncFromRoute(route, validatedLanguage)

			if (hasExternalLocation || typeof window === 'undefined') {
				return
			}

			const nextPathname = prependBasePath(route.pathname, normalizedBasePath)
			const nextUrl = `${nextPathname}${route.search}`
			const currentUrl = `${window.location.pathname}${window.location.search}`
			if (nextUrl !== currentUrl) {
				window.history.pushState({}, '', nextUrl)
			}
		},
		[
			hasExternalLocation,
			manifest,
			normalizedBasePath,
			setLocation,
			syncFromRoute,
			validatedLanguage,
		],
	)

	const setQuery = React.useCallback((value: string) => {
		setSearchQuery((previousValue) =>
			previousValue === value ? previousValue : value,
		)
	}, [])

	const clearQuery = React.useCallback(() => {
		setSearchQuery((previousValue) =>
			previousValue === undefined ? previousValue : undefined,
		)
	}, [])

	const setLanguage = React.useCallback(
		(newLanguage: string) => {
			setLocation({
				language: newLanguage,
				path: location.path,
			})

			if (hasExternalLocation || typeof window === 'undefined') return

			// Keep the URL on the same section, using its slug in the new
			// language, so a reload does not resolve back to the old one.
			const newManifest = manifestMap[newLanguage]
			const slug = newManifest && slugForPath(location.path, newManifest)
			if (slug === undefined) return

			const nextPathname = prependBasePath(slug, normalizedBasePath)
			const nextUrl = `${nextPathname}${window.location.search}`
			const currentUrl = `${window.location.pathname}${window.location.search}`
			if (nextUrl !== currentUrl) {
				window.history.replaceState({}, '', nextUrl)
			}
		},
		[
			hasExternalLocation,
			location.path,
			manifestMap,
			normalizedBasePath,
			setLocation,
		],
	)

	const state = React.useMemo<ReaderValue['state']>(
		() => ({ language: validatedLanguage, session }),
		[validatedLanguage, session],
	)
	const actions = React.useMemo<ReaderValue['actions']>(
		() => ({ navigate, setQuery, clearQuery, setLanguage }),
		[navigate, setQuery, clearQuery, setLanguage],
	)
	const meta = React.useMemo<ReaderValue['meta']>(
		() => ({
			book,
			manifest,
			languages: availableLanguages,
			basePath: normalizedBasePath,
			maxPageDepth,
		}),
		[book, manifest, availableLanguages, normalizedBasePath, maxPageDepth],
	)
	const value = React.useMemo<ReaderValue>(
		() => ({ state, actions, meta }),
		[state, actions, meta],
	)

	return (
		<ReaderValueContext.Provider value={value}>
			{children}
		</ReaderValueContext.Provider>
	)
}

/**
 * Warns when prev/next can lead to sections that are rendered inline.
 */
function useDepthWarning(book: BookContext, maxPageDepth: number) {
	const navigationDepth = book.maxNavigationDepth ?? Infinity

	React.useEffect(() => {
		if (navigationDepth <= maxPageDepth) return
		console.warn(
			`maxNavigationDepth (${navigationDepth}) is deeper than the reader's maxPageDepth (${maxPageDepth}): prev/next will lead to sections already rendered inline.`,
		)
	}, [navigationDepth, maxPageDepth])
}

/**
 * The reader's state, actions and reference data.
 */
export function useReader(): ReaderValue {
	const value = React.useContext(ReaderValueContext)
	if (!value) {
		throw new Error('useReader must be used within a reader Root')
	}
	return value
}

/**
 * The metadata of the book in the active language, with the rest of its
 * frontmatter in `extra`.
 */
export function useReaderMetadata(): Manifest['metadata'] {
	return useReader().meta.manifest.metadata
}
