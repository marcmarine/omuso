import type { Content, ContentElement, Root, Section } from '../parser/types'
import type { SectionReference } from './types'
import { convertToSlugFromArray } from './utils'

export function findSection(content: Content, path: string): Section | null {
	for (const node of content) {
		if (node.type === 'section') {
			if (node.path === path) return node
			const found = findSection(node.content, path)
			if (found) return found
		}
	}
	return null
}

export function getAllPaths(content: Root['content']): string[] {
	const paths: string[] = []
	function collect(nodes: Array<ContentElement>) {
		for (const node of nodes) {
			if (node.type === 'section') {
				paths.push(node.path)
				collect(node.content)
			}
		}
	}
	collect(content)
	return paths
}

export type SearchMatchType = 'title' | 'content'
export type SearchMatch = ContentElement & { matchType: SearchMatchType }

export function searchContent(content: Content, query: string): Content {
	if (!query.trim()) return []
	const results: SearchMatch[] = []
	const q = query.toLowerCase()

	function searchNodes(nodes: Array<ContentElement>) {
		for (const node of nodes) {
			if (node.type === 'section') {
				if (node.title.toLowerCase().includes(q)) {
					results.push({ ...node, matchType: 'title' })
				}
				searchNodes(node.content)
			} else if (
				node.type === 'paragraph' &&
				node.value.toLowerCase().includes(q)
			) {
				results.push({ ...node, matchType: 'content' })
			}
		}
	}
	searchNodes(content)
	return results
}

function collectSectionBreadcrumbs(
	node: Section,
	ancestorTitles: Array<SectionReference>,
	breadcrumbIndex: Record<string, Array<SectionReference>>,
): void {
	if (node.type !== 'section') return

	const breadcrumbTrail: Array<SectionReference> = [
		...ancestorTitles,
		{ title: node.title, path: node.path, depth: node.depth, slug: node.slug },
	]

	breadcrumbIndex[node.path] = breadcrumbTrail

	for (const child of node.content ?? []) {
		collectSectionBreadcrumbs(
			child as Section,
			breadcrumbTrail,
			breadcrumbIndex,
		)
	}
}

export function buildBreadcrumbIndex(
	rootContent: Content,
): Record<string, SectionReference[]> {
	const index: Record<string, SectionReference[]> = {}

	for (const node of rootContent) {
		collectSectionBreadcrumbs(node as Section, [], index)
	}

	return index
}

export function buildSlugs(
	breadcrumbIndex: Record<string, { title: string; path: string }[]>,
) {
	return Object.fromEntries(
		Object.entries(breadcrumbIndex).map(([key, value]) => [
			key,
			convertToSlugFromArray(value.map((b) => b.title)),
		]),
	)
}

export function buildTableOfContents(
	content: Content,
	omittedPaths: Array<string> = [],
): Section[] {
	const collect = (elements: Array<ContentElement>): Section[] => {
		const tableOfContents: Section[] = []

		const hasOmit = omittedPaths.length > 0
		const omitSet = hasOmit ? new Set(omittedPaths) : null

		for (const element of elements) {
			if (element.type !== 'section' || omitSet?.has(element.path)) continue

			tableOfContents.push({
				...element,
				content: collect(element.content),
			})
		}

		return tableOfContents
	}

	return collect(content)
}
