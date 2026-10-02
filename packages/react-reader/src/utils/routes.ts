import type { Manifest } from 'omuso'

/**
 * The path of the cover, which is not a section of the document.
 */
export const COVER_PATH = '0'

/**
 * Returns the slug for a section path, or `undefined` when the book was
 * parsed with `slugStyle: 'none'` and has no URLs.
 */
export function slugForPath(
	path: string,
	manifest: Manifest,
): string | undefined {
	if (manifest.slugStyle === 'none') return undefined
	if (path === COVER_PATH) return '/'
	return manifest.slugs[path]
}

export function normalizeBasePath(basePath?: string): string {
	if (!basePath) return ''

	const trimmed = basePath.trim()
	if (!trimmed || trimmed === '/') return ''

	const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
	const normalized = withLeadingSlash.replace(/\/+$/, '')

	return normalized === '/' ? '' : normalized
}

function normalizePathname(pathname: string): string {
	if (!pathname) return '/'

	const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`

	if (withLeadingSlash.length > 1) {
		return withLeadingSlash.replace(/\/+$/, '')
	}

	return withLeadingSlash
}

export function prependBasePath(pathname: string, basePath: string): string {
	const normalizedPathname = normalizePathname(pathname)
	if (!basePath) return normalizedPathname

	if (normalizedPathname === '/') return basePath
	return `${basePath}${normalizedPathname}`
}

export function stripBasePath(
	pathname: string,
	basePath: string,
): string | undefined {
	const normalizedPathname = normalizePathname(pathname)
	if (!basePath) return normalizedPathname

	if (normalizedPathname === basePath) return '/'
	if (normalizedPathname.startsWith(`${basePath}/`)) {
		return normalizedPathname.slice(basePath.length) || '/'
	}

	return undefined
}
