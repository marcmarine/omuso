import type { Root } from '../parser/types'
import {
	buildBreadcrumbIndex,
	buildSlugs,
	buildTableOfContents,
	getAllPaths,
	type Manifest,
} from '.'

export const buildManifest = (data: Root): Manifest => {
	const breadcrumbIndex = buildBreadcrumbIndex(data.content)
	const paths = getAllPaths(data.content)
	const slugs = buildSlugs(breadcrumbIndex)
	const tableOfContents = buildTableOfContents(data.content)

	const pathBySlug: Record<string, string> = {}
	for (const key in slugs) {
		pathBySlug[slugs[key] as string] = key
	}

	const metadata = {
		title: data?.title ?? '',
		author: data?.author ?? '',
		language: data?.language ?? '',
		translator: data?.translator ?? '',
	}

	return {
		slugs,
		breadcrumbIndex,
		paths,
		pathBySlug,
		tableOfContents,
		metadata,
	}
}
