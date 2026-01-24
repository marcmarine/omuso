import type { Section } from '../parser/types'

interface BaseResult {
	path: string
	type: 'section' | 'paragraph'
	parentSection: SectionReference | null
}

export interface SectionReference {
	path: string
	title: string
	depth: number
	slug: string
}

export interface SectionResult extends SectionReference, BaseResult {
	type: 'section'
	titleMatchCount: number
	totalMatchCount: number
	paragraphs: ParagraphResult[]
}

export interface ParagraphResult {
	path: string
	value: string
	matchCount: number
	hasMatch: boolean
}

export interface OrphanParagraphResult extends BaseResult {
	type: 'paragraph'
	value: string
	matchCount: number
	parentSection: null
}

export type SearchResult = SectionResult | OrphanParagraphResult

export interface Manifest {
	/**
	 * Metadata about the document.
	 */
	metadata: {
		title: string
		author: string
		language: string
		translator: string
	}

	/**
	 * The table of contents as an array of omuso.Section objects.
	 */
	tableOfContents: Array<Section>

	/**
	 * An array of all paths in the document.
	 */
	paths: Array<string>

	/**
	 * A record mapping slugs to their corresponding values.
	 */
	slugs: Record<string, string>

	/**
	 * A record mapping slugs to their corresponding paths.
	 */
	pathBySlug: Record<string, string>

	/**
	 * A record mapping paths to their breadcrumb trail as an array of SectionReference objects.
	 */
	breadcrumbIndex: Record<string, Array<SectionReference>>
}

/**
 * Represents the current reading session state.
 */
export interface Session {
	/**
	 * The currently viewed section, including its slug.
	 * @type {omuso.Section | null}
	 */
	currentSection: Section | null

	/**
	 * Information about the next section to navigate to.
	 * @type {SectionReference | null}
	 */
	nextSection: SectionReference | null

	/**
	 * Information about the previous section to navigate to.
	 * @type {SectionReference | null}
	 */
	prevSection: SectionReference | null

	/**
	 * Breadcrumb trail for the current location.
	 * @type {Array<SectionReference>}
	 */
	breadcrumbs: Array<SectionReference>

	/**
	 * Search-related state.
	 * @type {{
	 *   query: string;
	 *   results: Array<SearchResult>;
	 *   totalMatches: number;
	 * }}
	 */
	search: {
		query: string
		results: Array<SearchResult>
		totalMatches: number
	}

	/**
	 * The current language setting for the session.
	 * @type {string}
	 */
	language: string
}
