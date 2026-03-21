import type { Content, Paragraph, Section } from '../parser/types'
import {
	buildSearchResponse,
	findSection,
	getTotalMatches,
	type Manifest,
	type SearchResult,
	type SectionReference,
	type Session,
} from '.'
import { clampPathToDepth } from './utils'

export const generateReadingSession = (
	content: Content,
	manifest: Manifest,
	initialPath: string | null,
	query: string,
	language: string,
  maxNavigationDepth?: number,
	omittedPaths?: Array<string>
): Session => {
	const { breadcrumbIndex, paths } = manifest
	const currentPath = initialPath

	let currentSection = (
		currentPath ? findSection(content, currentPath) : null
	) as Section
	if (currentSection?.content) {
		const collectedChildren = [] as (Section | Paragraph)[]

		for (const child of currentSection.content) {
			collectedChildren.push(child)
		}

		currentSection = {
			...currentSection,
			content: collectedChildren,
		}
	}

	const searchResults = query ? buildSearchResponse(content, query) : []

	const results: SearchResult[] = []
	for (const item of searchResults) {
		let parentSection: SectionReference | null = null
		if (item.parentSection) {
			parentSection = item.parentSection
		}

		results.push({
			...item,
			parentSection,
		} as SearchResult)
	}

	const totalMatches = getTotalMatches(buildSearchResponse(content, query))

	const references: Record<string, SectionReference> = {}

	for (const [key, value] of Object.entries(breadcrumbIndex)) {
		const last = value[value.length - 1]
		if (last) references[key] = last
	}

	const breadcrumbs: SectionReference[] =
		(currentPath ? breadcrumbIndex[currentPath] : undefined) ?? []

	return {
		currentSection,
		breadcrumbs,
		nextSection: currentPath
			? getNextSection(paths, currentPath, references, maxNavigationDepth, omittedPaths)
			: null,
		prevSection: currentPath
			? getPrevSection(paths, currentPath, references, maxNavigationDepth, omittedPaths)
			: null,
		search: {
			query,
			results,
			totalMatches,
		},
		language,
	}
}

function getNextSection(
	paths: string[],
	currentPath: string,
	references: Record<string, SectionReference>,
	maxNavigationDepth?: number,
	omittedPaths?: Array<string>
): SectionReference | null {
	const effectivePath =
		maxNavigationDepth === undefined || maxNavigationDepth === Infinity
			? currentPath
			: clampPathToDepth(currentPath, maxNavigationDepth)
	const index = paths.indexOf(effectivePath)
	if (index === -1) return null

	const isOmitted = (path: string): boolean =>
		omittedPaths?.some((omitted) => path === omitted || path.startsWith(`${omitted}.`)) ?? false

	if (maxNavigationDepth === undefined || maxNavigationDepth === Infinity) {
		for (let i = index + 1; i < paths.length; i++) {
			if (!isOmitted(paths[i] as string)) {
				return references[paths[i] as string] ?? null
			}
		}
		return null
	}

	for (let i = index + 1; i < paths.length; i++) {
		const path = paths[i] as string
		if (path.split('.').length <= maxNavigationDepth && !isOmitted(path)) {
			return references[path] ?? null
		}
	}
	return null
}

function getPrevSection(
	paths: string[],
	currentPath: string,
	references: Record<string, SectionReference>,
	maxNavigationDepth?: number,
	omittedPaths?: Array<string>
): SectionReference | null {
	const effectivePath =
		maxNavigationDepth === undefined || maxNavigationDepth === Infinity
			? currentPath
			: clampPathToDepth(currentPath, maxNavigationDepth)
	const index = paths.indexOf(effectivePath)
	if (index <= 0) return null

	const isOmitted = (path: string): boolean =>
		omittedPaths?.some((omitted) => path === omitted || path.startsWith(`${omitted}.`)) ?? false

	if (maxNavigationDepth === undefined || maxNavigationDepth === Infinity) {
		for (let i = index - 1; i >= 0; i--) {
			if (!isOmitted(paths[i] as string)) {
				return references[paths[i] as string] ?? null
			}
		}
		return null
	}

	for (let i = index - 1; i >= 0; i--) {
		const path = paths[i] as string
		if (path.split('.').length <= maxNavigationDepth && !isOmitted(path)) {
			return references[path] ?? null
		}
	}
	return null
}
