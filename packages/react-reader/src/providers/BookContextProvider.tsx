import type { BookContext, Manifest, Session } from 'omuso'
import React, { useMemo } from 'react'

const DEFAULT_LANGUAGE = 'en'
const LOCATION_STORAGE_KEY = 'location'

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
	navigate: (currentSlug: string) => void
	search: (value: string) => void
	resetSearch: () => void
	availableLanguages: Array<string>
	setLanguage: (newLanguage: string) => void
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
		path: '0',
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
	return manifest?.pathBySlug?.[pathname]
}

function resolveReaderLocation(
	route: RouteState,
	preferredLanguage: string,
	availableLanguages: string[],
	manifestMap: Record<string, Manifest>,
): ReaderLocation | undefined {
	const pathname = route.pathname || '/'
	if (pathname === '/') {
		return { language: preferredLanguage, path: '0' }
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

export function BookContextProvider({
	children,
	defaultLanguage,
	context,
	location: externalLocation,
}: {
	children: React.ReactNode
	defaultLanguage?: string
	context: BookContext
	location?: Partial<Location>
}) {
	const manifests = React.useMemo(() => context.manifests, [context])
	const manifestMap = manifests as Record<string, Manifest>
	const availableLanguages = useMemo(() => Object.keys(manifests), [manifests])

	const initialRoute = parseRoute(externalLocation)
	const storedLocation = readStoredLocation(defaultLanguage)
	const initialLocation =
		resolveReaderLocation(
			initialRoute,
			storedLocation.language,
			availableLanguages,
			manifestMap,
		) ?? storedLocation

	const [location, setLocationState] = React.useState<ReaderLocation>(
		initialLocation,
	)
	const [searchQuery, setSearchQuery] = React.useState<string | undefined>(
		getSearchQuery(initialRoute),
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
			const nextQuery = getSearchQuery(route)
			if (nextQuery !== undefined) {
				setSearchQuery((previousQuery) =>
					previousQuery === nextQuery ? previousQuery : nextQuery,
				)
			}

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

		syncFromRoute(
			parseRoute({ pathname: externalPathname, search: externalSearch }),
			validatedLanguage,
		)
	}, [
		hasExternalLocation,
		externalPathname,
		externalSearch,
		syncFromRoute,
		validatedLanguage,
	])

	React.useEffect(() => {
		if (typeof window === 'undefined') return

		const handlePopState = () => {
			syncFromRoute(getWindowRoute(), validatedLanguage)
		}

		window.addEventListener('popstate', handlePopState)
		return () => window.removeEventListener('popstate', handlePopState)
	}, [syncFromRoute, validatedLanguage])

	const navigate = React.useCallback(
		(currentSlug: string) => {
			if (!currentSlug) return

			const parsedRoute = parseRoute(currentSlug)
			const route: RouteState = { ...parsedRoute }

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

			const nextUrl = `${route.pathname}${route.search}`
			const currentUrl = `${window.location.pathname}${window.location.search}`
			if (nextUrl !== currentUrl) {
				window.history.pushState({}, '', nextUrl)
			}
		},
		[hasExternalLocation, syncFromRoute, validatedLanguage],
	)

	const search = (value: string) => {
		setSearchQuery((previousValue) =>
			previousValue === value ? previousValue : value,
		)
	}

	const resetSearch = () => {
		setSearchQuery((previousValue) =>
			previousValue === undefined ? previousValue : undefined,
		)
	}

	const setLanguage = (newLanguage: string) => {
		setLocation({
			language: newLanguage,
			path: location.path,
		})
	}

	return (
		<BookContextContext.Provider
			value={{
				manifest,
				session,
				navigate,
				search,
				resetSearch,
				availableLanguages,
				setLanguage,
			}}
		>
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
