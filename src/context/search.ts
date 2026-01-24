import type { Content, Section } from '../parser/types'
import type {
	ParagraphResult,
	SearchResult,
	SectionReference,
	SectionResult,
} from './types'

function countOccurrences(text: string, query: string): number {
	const lowerText = text.toLowerCase()
	const lowerQuery = query.toLowerCase()
	let count = 0
	let index = lowerText.indexOf(lowerQuery)
	while (index !== -1) {
		count++
		index = lowerText.indexOf(lowerQuery, index + 1)
	}
	return count
}

function findMatchesInSection(
	section: Section,
	query: string,
	parent: SectionReference | null,
): SectionResult | null {
	const titleMatchCount = countOccurrences(section.title, query)
	const paragraphs: ParagraphResult[] = []
	let totalMatchCount = titleMatchCount

	for (const item of section.content) {
		if (item.type === 'paragraph') {
			const matchCount = countOccurrences(item.value, query)
			paragraphs.push({
				path: item.path,
				value: item.value,
				matchCount,
				hasMatch: matchCount > 0,
			})
			totalMatchCount += matchCount
		}
	}

	if (totalMatchCount === 0) return null

	return {
		path: section.path,
		type: 'section',
		slug: section.slug,
		title: section.title,
		depth: section.depth,
		titleMatchCount,
		totalMatchCount,
		paragraphs,
		parentSection: parent,
	}
}

function findMatchesInContent(
	content: Content,
	query: string,
	parent: SectionReference | null = null,
): SearchResult[] {
	const results: SearchResult[] = []

	for (const node of content) {
		if (node.type === 'paragraph') {
			const matchCount = countOccurrences(node.value, query)
			if (matchCount > 0) {
				results.push({
					path: node.path,
					type: 'paragraph',
					value: node.value,
					matchCount,
					parentSection: null,
				})
			}
			continue
		}

		if (node.type === 'section') {
			const sectionResult = findMatchesInSection(node, query, parent)
			if (sectionResult) results.push(sectionResult)

			const childResults = findMatchesInContent(node.content, query, {
				path: node.path,
				title: node.title,
				depth: node.depth,
				slug: node.slug,
			})

			results.push(...childResults)
		}
	}

	return results
}

function sortSearchResults(results: SearchResult[]): SearchResult[] {
	return [...results].sort((a, b) => {
		const aTitle = a.type === 'section' ? a.titleMatchCount : 0
		const bTitle = b.type === 'section' ? b.titleMatchCount : 0
		if (aTitle !== bTitle) return bTitle - aTitle

		const aTotal = a.type === 'section' ? a.totalMatchCount : a.matchCount
		const bTotal = b.type === 'section' ? b.totalMatchCount : b.matchCount
		return bTotal - aTotal
	})
}

export function buildSearchResponse(
	content: Content,
	query: string,
): SearchResult[] {
	if (!query.trim()) return []

	const rawResults = findMatchesInContent(content, query)
	const sortedResults = sortSearchResults(rawResults)

	return sortedResults
}

export function getTotalMatches(results: SearchResult[]) {
	let total = 0
	for (const result of results) {
		total +=
			result.type === 'section' ? result.totalMatchCount : result.matchCount
	}

	return total
}
