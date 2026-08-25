import { slugify } from '../common/utils'

export function convertToSlugFromArray(arr: string[]): string {
	return `/${arr.map(slugify).join('/')}`
}

export function clampPathToDepth(path: string, maxDepth: number): string {
	const parts = path.split('.')
	return parts.length > maxDepth ? parts.slice(0, maxDepth).join('.') : path
}
