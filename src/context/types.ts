import type { Root, Section } from '../parser/types'

/**
 * Represents the context for a book, containing roots, manifests, and session management.
 */
export type BookContext = {
	/**
	 * A record of root objects keyed by language.
	 */
	roots: Record<string, Root>

	/**
	 * A record of manifest objects keyed by language.
	 */
	manifests: Record<string, Manifest>

	/**
	 * The maximum depth for navigation in the book.
	 */
	maxNavigationDepth: number | undefined

	/**
	 * An array of supported languages for the book.
	 */
	languages: Array<string>

	/**
	 * An array of section paths to omit from the book context.
	 */
	omittedPaths: Array<string>

	/**
	 * Initializes the BookContext with the provided configuration.
	 * @param config - Configuration object for initialization.
	 * @returns The initialized BookContext.
	 */
	init(config: BookContextConfig): BookContext

	/**
	 * Retrieves the manifest for a specific language.
	 * @param lang - The language code for the manifest.
	 * @returns The manifest for the specified language.
	 */
	manifest(lang: string): Manifest

	/**
	 * Creates a new session for the given path, query, and language.
	 * @param path - The path to the current section.
	 * @param query - The search query (if any).
	 * @param lang - The language code for the session.
	 * @returns A new Session object.
	 */
  session(path: string, query: string, lang: string): Session
}

/**
 * Configuration options for initializing a BookContext.
 */
export type BookContextConfig = {
	/**
	 * A record of markdown content keyed by language.
	 */
	markdowns: Record<string, string>

	/**
	 * The default language for the book (optional).
	 */
	defaultLanguage?: string

	/**
	 * The maximum navigation depth (optional).
	 */
	maxNavigationDepth?: number

	/**
	 * An array of section paths to omit from the book context (optional).
	 */
	omitPaths?: Array<string>
}

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
