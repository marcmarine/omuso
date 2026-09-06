import type { Content, Paragraph, Section } from '../parser/types'
import {
	buildSearchResponse,
	findSection,
	getTotalMatches,
	type Manifest,
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
	omittedPaths?: Array<string>,
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
	const totalMatches = getTotalMatches(searchResults)

	const references: Record<string, SectionReference> = {}

	for (const [key, value] of Object.entries(breadcrumbIndex)) {
		const last = value[value.length - 1]
		if (last) references[key] = last
	}

	const breadcrumbs: SectionReference[] =
		(currentPath ? breadcrumbIndex[currentPath] : undefined) ?? []

	const navigator = createSectionNavigator(paths, references, {
		maxNavigationDepth,
		omittedPaths,
	})

	return {
		currentSection,
		breadcrumbs,
		nextSection: currentPath ? navigator.getNext(currentPath) : null,
		prevSection: currentPath ? navigator.getPrev(currentPath) : null,
		search: {
			query,
			results: searchResults,
			totalMatches,
		},
		language,
	}
}

interface SectionNavigatorOptions {
	maxNavigationDepth?: number
	omittedPaths?: Array<string>
}

function createSectionNavigator(
	paths: string[],
	references: Record<string, SectionReference>,
	options: SectionNavigatorOptions = {},
) {
	const { maxNavigationDepth, omittedPaths } = options

	const isOmitted = (path: string): boolean =>
		omittedPaths?.some(
			(omitted) => path === omitted || path.startsWith(`${omitted}.`),
		) ?? false

	const withinDepth = (path: string): boolean =>
		maxNavigationDepth === undefined || maxNavigationDepth === Infinity
			? true
			: path.split('.').length <= maxNavigationDepth

	function getAdjacent(
		currentPath: string,
		direction: 'next' | 'prev',
	): SectionReference | null {
		const effectivePath =
			maxNavigationDepth === undefined || maxNavigationDepth === Infinity
				? currentPath
				: clampPathToDepth(currentPath, maxNavigationDepth)
		const index = paths.indexOf(effectivePath)
		if (direction === 'next' ? index === -1 : index <= 0) return null

		const step = direction === 'next' ? 1 : -1
		const withinBounds = (i: number) =>
			direction === 'next' ? i < paths.length : i >= 0

		for (let i = index + step; withinBounds(i); i += step) {
			const path = paths[i] as string
			if (withinDepth(path) && !isOmitted(path)) {
				return references[path] ?? null
			}
		}
		return null
	}

	return {
		getNext: (currentPath: string) => getAdjacent(currentPath, 'next'),
		getPrev: (currentPath: string) => getAdjacent(currentPath, 'prev'),
	}
}
