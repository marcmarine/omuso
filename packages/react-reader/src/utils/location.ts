import type { Manifest } from 'omuso'
import { resolveLanguage } from '.'
import {
	COVER_PATH,
	getSearchQuery,
	parseRoute,
	type RouteState,
	stripBasePath,
} from './routes'
import { storageKey } from './storage'

const LOCATION_STORAGE_KEY = storageKey('location')

export type ReaderLocation = {
	language: string
	path: string
}

function readStoredLocation(
	defaultLanguage: string | undefined,
	availableLanguages: string[],
): ReaderLocation {
	const fallback = {
		language: resolveLanguage([defaultLanguage], availableLanguages),
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
			return {
				language: resolveLanguage(
					[parsed.language, defaultLanguage],
					availableLanguages,
				),
				path: parsed.path,
			}
		}
	} catch {
		// ignore malformed storage
	}

	return fallback
}

export function writeStoredLocation(location: ReaderLocation) {
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

export function resolveReaderLocation(
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

/**
 * The reader route for the initial location, or `undefined` when it lies
 * outside `basePath`.
 */
function getInitialRoute(
	externalLocation: Partial<Location> | undefined,
	basePath: string,
): RouteState | undefined {
	const publicRoute = parseRoute(externalLocation)
	const routePathname = stripBasePath(publicRoute.pathname, basePath)

	return routePathname === undefined
		? undefined
		: { pathname: routePathname, search: publicRoute.search }
}

export function getInitialLocation(
	externalLocation: Partial<Location> | undefined,
	basePath: string,
	defaultLanguage: string | undefined,
	availableLanguages: string[],
	manifestMap: Record<string, Manifest>,
): ReaderLocation {
	const route = getInitialRoute(externalLocation, basePath)
	const storedLocation = readStoredLocation(defaultLanguage, availableLanguages)

	return (
		(route
			? resolveReaderLocation(
					route,
					storedLocation.language,
					availableLanguages,
					manifestMap,
				)
			: undefined) ?? storedLocation
	)
}

export function getInitialSearchQuery(
	externalLocation: Partial<Location> | undefined,
	basePath: string,
): string | undefined {
	const route = getInitialRoute(externalLocation, basePath)
	return route ? getSearchQuery(route) : undefined
}
