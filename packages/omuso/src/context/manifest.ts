import type { Root } from '../parser/types'
import {
	buildBreadcrumbIndex,
	buildPathIndex,
	buildReferences,
	buildSlugs,
	buildTableOfContents,
	getAllPaths,
	type Manifest,
} from '.'

export const buildManifest = (
	data: Root,
	omittedPaths: Array<string> = [],
): Manifest => {
	const breadcrumbIndex = buildBreadcrumbIndex(data.content)
	const paths = getAllPaths(data.content)
	const references = buildReferences(breadcrumbIndex)
	const pathIndex = buildPathIndex(paths)
	const slugs = buildSlugs(breadcrumbIndex)
	const tableOfContents = buildTableOfContents(data.content, omittedPaths)

	const pathBySlug: Record<string, string> = {}
	for (const key in slugs) {
		pathBySlug[slugs[key] as string] = key
	}

	const metadata = {
		title: data?.title ?? '',
		author: data?.author ?? '',
		language: data?.language ?? '',
		translator: data?.translator ?? '',
		date: data?.date ?? '',
	}

	return {
		slugs,
		breadcrumbIndex,
		references,
		paths,
		pathIndex,
		pathBySlug,
		tableOfContents,
		metadata,
	}
}
