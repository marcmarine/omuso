import type { BookContext, Manifest, SearchFilter, Session } from 'omuso'
import React, { useMemo } from 'react'
import { resolveLanguage } from '../utils'
import {
	getInitialState,
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

export type Context = {
	manifest: Manifest
	session: Session
	/**
	 * Navigates to a URL (slug) or to a section `path`. Paths go through
	 * their slug when the book has one, so the URL stays in sync.
	 */
	navigate: (target: string | { path: string }) => void
	search: (value: string) => void
	resetSearch: () => void
	availableLanguages: Array<string>
	setLanguage: (newLanguage: string) => void
	basePath: string
}

export const BookContextContext = React.createContext<Context | undefined>(
	undefined,
)

export function BookContextProvider({
	children,
	defaultLanguage,
	context,
	location: externalLocation,
	basePath,
	searchFilter,
}: {
	children: React.ReactNode
	defaultLanguage?: string
	context: BookContext
	location?: Partial<Location>
	basePath?: string
	searchFilter?: SearchFilter
}) {
	const manifests = React.useMemo(() => context.manifests, [context])
	const manifestMap = manifests as Record<string, Manifest>
	const availableLanguages = useMemo(() => Object.keys(manifests), [manifests])
	const normalizedBasePath = useMemo(
		() => normalizeBasePath(basePath),
		[basePath],
	)

	const [initialState] = React.useState(() =>
		getInitialState(
			externalLocation,
			normalizedBasePath,
			defaultLanguage,
			availableLanguages,
			manifestMap,
		),
	)

	const [location, setLocationState] = React.useState<ReaderLocation>(
		initialState.location,
	)
	const [searchQuery, setSearchQuery] = React.useState<string | undefined>(
		initialState.searchQuery,
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

	const manifest = React.useMemo(
		() => context.manifest(validatedLanguage) as Manifest,
		[context, validatedLanguage],
	)
	// Search and navigation are memoized apart, so moving between sections
	// does not repeat the search.
	const searchState = React.useMemo(
		() =>
			context.search(searchQuery || '', validatedLanguage, {
				filter: searchFilter,
			}),
		[context, searchQuery, validatedLanguage, searchFilter],
	)
	const navigation = React.useMemo(
		() => context.session(location.path, '', validatedLanguage),
		[context, location.path, validatedLanguage],
	)
	const session = React.useMemo<Session>(
		() => ({ ...navigation, search: searchState }),
		[navigation, searchState],
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

	const search = React.useCallback((value: string) => {
		setSearchQuery((previousValue) =>
			previousValue === value ? previousValue : value,
		)
	}, [])

	const resetSearch = React.useCallback(() => {
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

	const value = React.useMemo<Context>(
		() => ({
			manifest,
			session,
			navigate,
			search,
			resetSearch,
			availableLanguages,
			setLanguage,
			basePath: normalizedBasePath,
		}),
		[
			manifest,
			session,
			navigate,
			search,
			resetSearch,
			availableLanguages,
			setLanguage,
			normalizedBasePath,
		],
	)

	return (
		<BookContextContext.Provider value={value}>
			{children}
		</BookContextContext.Provider>
	)
}

export function useBookContext() {
	const context = React.useContext(BookContextContext)
	if (!context) {
		throw new Error('useBookContext must be used within a BookProvider')
	}
	return context
}
