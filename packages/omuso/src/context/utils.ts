/**
 * Whether `path` is the section `ancestor` or lies under it.
 * `'3'`, `'3.1'` and `'3.10'` are within `'3'`; `'31'` is not.
 */
export function isPathWithin(path: string, ancestor: string): boolean {
	return path === ancestor || path.startsWith(`${ancestor}.`)
}

/**
 * A path is omitted if it matches an omitted path or is nested under one.
 */
export function isPathOmitted(
	path: string,
	omittedPaths: Array<string> = [],
): boolean {
	return omittedPaths.some((omitted) => isPathWithin(path, omitted))
}

export function clampPathToDepth(path: string, maxDepth: number): string {
	const parts = path.split('.')
	return parts.length > maxDepth ? parts.slice(0, maxDepth).join('.') : path
}
