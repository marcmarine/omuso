import type { Content, ContentElement, Root, Section } from '../parser/types'
import type { SectionReference } from './types'

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

/**
 * Maps each section path to its own SectionReference, the last entry of its
 * breadcrumb trail.
 */
export function buildReferences(
	breadcrumbIndex: Record<string, SectionReference[]>,
): Record<string, SectionReference> {
	const references: Record<string, SectionReference> = {}

	for (const [path, trail] of Object.entries(breadcrumbIndex)) {
		const section = trail[trail.length - 1]
		if (section) references[path] = section
	}

	return references
}

export function buildPathIndex(paths: string[]): Record<string, number> {
	const pathIndex: Record<string, number> = {}

	for (let i = 0; i < paths.length; i++) {
		pathIndex[paths[i] as string] = i
	}

	return pathIndex
}

/**
 * Maps each section path to the slug computed by the parser, taken from the
 * last entry of its breadcrumb trail (the section itself).
 */
export function buildSlugs(
	breadcrumbIndex: Record<string, SectionReference[]>,
): Record<string, string> {
	const slugs: Record<string, string> = {}

	for (const [path, trail] of Object.entries(breadcrumbIndex)) {
		const section = trail[trail.length - 1]
		if (section?.slug !== undefined) slugs[path] = section.slug
	}

	return slugs
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
