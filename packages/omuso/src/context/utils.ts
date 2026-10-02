import { slugify } from '../common/utils'

export function convertToSlugFromArray(arr: string[]): string {
	return `/${arr.map(slugify).join('/')}`
}

/**
 * A path is omitted if it matches an omitted path or is nested under one.
 */
export function isPathOmitted(
	path: string,
	omittedPaths: Array<string> = [],
): boolean {
	return omittedPaths.some(
		(omitted) => path === omitted || path.startsWith(`${omitted}.`),
	)
}

export function clampPathToDepth(path: string, maxDepth: number): string {
	const parts = path.split('.')
	return parts.length > maxDepth ? parts.slice(0, maxDepth).join('.') : path
}
