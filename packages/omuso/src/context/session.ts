import type { Content, Section } from '../parser/types'
import {
	buildSearchState,
	findSection,
	type Manifest,
	type SectionFilter,
	type SectionReference,
	type Session,
} from '.'
import { clampPathToDepth, isPathOmitted } from './utils'

export const generateReadingSession = (
	content: Content,
	manifest: Manifest,
	initialPath: string | null,
	query: string,
	language: string,
	maxNavigationDepth?: number,
	omittedPaths?: Array<string>,
	filter?: SectionFilter,
): Session => {
	const { breadcrumbIndex, paths, pathIndex, references } = manifest
	const currentPath = initialPath

	const currentSection = (
		currentPath ? findSection(content, currentPath) : null
	) as Section

	const breadcrumbs: SectionReference[] =
		(currentPath ? breadcrumbIndex[currentPath] : undefined) ?? []

	const navigator = createSectionNavigator(paths, pathIndex, references, {
		maxNavigationDepth,
		omittedPaths,
		filter,
	})

	return {
		currentSection,
		breadcrumbs,
		nextSection: currentPath ? navigator.getNext(currentPath) : null,
		prevSection: currentPath ? navigator.getPrev(currentPath) : null,
		search: buildSearchState(content, query, omittedPaths, filter),
		language,
	}
}

interface SectionNavigatorOptions {
	maxNavigationDepth?: number
	omittedPaths?: Array<string>
	filter?: SectionFilter
}

function createSectionNavigator(
	paths: string[],
	pathIndex: Record<string, number>,
	references: Record<string, SectionReference>,
	options: SectionNavigatorOptions = {},
) {
	const { maxNavigationDepth, omittedPaths, filter } = options
	const limitsDepth =
		maxNavigationDepth !== undefined && maxNavigationDepth !== Infinity

	// The first listed section from `from` in the `step` direction. The
	// condition is written inline: a helper called on every iteration made
	// the pager measurably slower. The filter is checked last, so it is
	// never called for sections the pager would skip anyway.
	function scan(from: number, step: 1 | -1): SectionReference | null {
		for (let i = from; i >= 0 && i < paths.length; i += step) {
			const path = paths[i] as string
			if (
				(!limitsDepth ||
					path.split('.').length <= (maxNavigationDepth as number)) &&
				!isPathOmitted(path, omittedPaths) &&
				(filter === undefined || filter(path, false))
			) {
				return references[path] ?? null
			}
		}
		return null
	}

	function indexOf(currentPath: string): number {
		const effectivePath = limitsDepth
			? clampPathToDepth(currentPath, maxNavigationDepth as number)
			: currentPath
		return Object.hasOwn(pathIndex, effectivePath)
			? (pathIndex[effectivePath] as number)
			: -1
	}

	return {
		getNext(currentPath: string): SectionReference | null {
			const index = indexOf(currentPath)
			return index === -1 ? null : scan(index + 1, 1)
		},
		getPrev(currentPath: string): SectionReference | null {
			const index = indexOf(currentPath)
			return index <= 0 ? null : scan(index - 1, -1)
		},
	}
}
