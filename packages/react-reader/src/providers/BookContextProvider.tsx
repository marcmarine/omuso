import type { BookContext, Manifest, Session } from 'omuso'
import React, { useMemo } from 'react'
import {
	COVER_PATH,
	normalizeBasePath,
	prependBasePath,
	slugForPath,
	stripBasePath,
} from '../utils/routes'
import { storageKey } from '../utils/storage'

const DEFAULT_LANGUAGE = 'en'
const LOCATION_STORAGE_KEY = storageKey('location')

type RouteState = {
	pathname: string
	search: string
}

type ReaderLocation = {
	language: string
	path: string
}

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

function getWindowRoute(): RouteState {
	if (typeof window === 'undefined') {
		return { pathname: '/', search: '' }
	}

	return {
		pathname: window.location.pathname || '/',
		search: window.location.search || '',
	}
}

function parseRoute(input?: string | Partial<Location>): RouteState {
	if (typeof input === 'string') {
		if (!input) return { pathname: '/', search: '' }

		try {
			const origin =
				typeof window !== 'undefined'
					? window.location.origin
					: 'http://localhost'
			const parsed = new URL(input, origin)
			return {
				pathname: parsed.pathname || '/',
				search: parsed.search || '',
			}
		} catch {
			const [rawPathname, ...rest] = input.split('?')
			return {
				pathname: rawPathname || '/',
				search: rest.length > 0 ? `?${rest.join('?')}` : '',
			}
		}
	}

	const windowRoute = getWindowRoute()

	if (input) {
		return {
			pathname: input.pathname || windowRoute.pathname,
			search: input.search ?? windowRoute.search,
		}
	}

	return windowRoute
}

function getSearchQuery(route: RouteState): string | undefined {
	return new URLSearchParams(route.search).get('query') || undefined
}

function readStoredLocation(defaultLanguage?: string): ReaderLocation {
	const fallback = {
		language: defaultLanguage || DEFAULT_LANGUAGE,
		path: COVER_PATH,
	}

	if (typeof window === 'undefined') return fallback

	try {
		const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY)
		if (!raw) return fallback

		const parsed = JSON.parse(raw) as Partial<ReaderLocation>
		if (
			typeof parsed?.language === 'string' &&
			typeof parsed?.path === 'string'
		) {
			return { language: parsed.language, path: parsed.path }
		}
	} catch {
		// ignore malformed storage
	}

	return fallback
}

function writeStoredLocation(location: ReaderLocation) {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location))
}

function resolvePathInLanguage(
	pathname: string,
	language: string,
	manifestMap: Record<string, Manifest>,
): string | undefined {
	const manifest = manifestMap[language]
	if (!manifest?.pathBySlug) return undefined

	const directMatch = manifest.pathBySlug[pathname]
	if (directMatch !== undefined) return directMatch

	try {
		const decodedPathname = decodeURIComponent(pathname)
		if (decodedPathname === pathname) return undefined
		return manifest.pathBySlug[decodedPathname]
	} catch {
		return undefined
	}
}

function resolveReaderLocation(
	route: RouteState,
	preferredLanguage: string,
	availableLanguages: string[],
	manifestMap: Record<string, Manifest>,
): ReaderLocation | undefined {
	const pathname = route.pathname || '/'
	if (pathname === '/') {
		return { language: preferredLanguage, path: COVER_PATH }
	}

	const preferredPath = resolvePathInLanguage(
		pathname,
		preferredLanguage,
		manifestMap,
	)
	if (preferredPath !== undefined) {
		return { language: preferredLanguage, path: preferredPath }
	}

	for (const language of availableLanguages) {
		if (language === preferredLanguage) continue
		const path = resolvePathInLanguage(pathname, language, manifestMap)
		if (path !== undefined) {
			return { language, path }
		}
	}

	return undefined
}

function getInitialState(
	externalLocation: Partial<Location> | undefined,
	basePath: string,
	defaultLanguage: string | undefined,
	availableLanguages: string[],
	manifestMap: Record<string, Manifest>,
): { location: ReaderLocation; searchQuery: string | undefined } {
	const publicRoute = parseRoute(externalLocation)
	const routePathname = stripBasePath(publicRoute.pathname, basePath)
	const route =
		routePathname === undefined
			? undefined
			: { pathname: routePathname, search: publicRoute.search }
	const storedLocation = readStoredLocation(defaultLanguage)
	const location =
		(route
			? resolveReaderLocation(
					route,
					storedLocation.language,
					availableLanguages,
					manifestMap,
				)
			: undefined) ?? storedLocation

	return {
		location,
		searchQuery: route ? getSearchQuery(route) : undefined,
	}
}

export function BookContextProvider({
	children,
	defaultLanguage,
	context,
	location: externalLocation,
	basePath,
}: {
	children: React.ReactNode
	defaultLanguage?: string
	context: BookContext
	location?: Partial<Location>
	basePath?: string
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

	const validatedLanguage = useMemo(() => {
		if (availableLanguages.includes(location.language)) {
			return location.language
		}
		return defaultLanguage || DEFAULT_LANGUAGE
	}, [location.language, availableLanguages, defaultLanguage])

	const manifest = React.useMemo(
		() => context.manifest(validatedLanguage) as Manifest,
		[context, validatedLanguage],
	)
	const session = React.useMemo(
		() => context.session(location.path, searchQuery || '', validatedLanguage),
		[context, location.path, validatedLanguage, searchQuery],
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
