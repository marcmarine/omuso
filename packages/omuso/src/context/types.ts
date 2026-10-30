import type { Root, Section, SlugStyle } from '../parser/types'

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

	/**
	 * Searches the book in a language without building a session.
	 * @param query - The search query.
	 * @param lang - The language code to search in.
	 * @param options - Search options (optional).
	 * @returns The search state for the query.
	 */
	search(query: string, lang: string, options?: SearchOptions): SearchState
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
	 * The maximum navigation depth (optional).
	 */
	maxNavigationDepth?: number

	/**
	 * An array of section paths to omit from the book context (optional).
	 */
	omitPaths?: Array<string>

	/**
	 * The slug style for sections (optional, defaults to `kebab`).
	 */
	slugStyle?: SlugStyle
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
	/**
	 * Absent when the document is parsed with `slugStyle: 'none'`.
	 */
	slug?: string
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

/**
 * Decides whether a section is searched (its title and direct paragraphs).
 * Child sections are still visited and filtered on their own. `omitted`
 * tells whether the path lies within `omitPaths`, so the default behaviour
 * can be reused. Called once per section, in document order.
 */
export type SearchFilter = (path: string, omitted: boolean) => boolean

export interface SearchOptions {
	/**
	 * Replaces the default exclusion of `omitPaths`, in search only.
	 */
	filter?: SearchFilter
}

export interface SearchState {
	query: string
	results: Array<SearchResult>
	totalMatches: number
}

export interface Manifest {
	/**
	 * Metadata about the document.
	 */
	metadata: {
		title: string
		author: string
		language: string
		translator: string
		date: string
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
	 * The slug style the document was parsed with. Use it to tell whether
	 * slugs are available instead of checking if `slugs` is empty.
	 */
	slugStyle: SlugStyle

	/**
	 * A record mapping paths to their slugs. Empty when `slugStyle` is `none`.
	 */
	slugs: Record<string, string>

	/**
	 * A record mapping slugs to their corresponding paths. Empty when `slugStyle` is `none`.
	 */
	pathBySlug: Record<string, string>

	/**
	 * A record mapping paths to their breadcrumb trail as an array of SectionReference objects.
	 */
	breadcrumbIndex: Record<string, Array<SectionReference>>

	/**
	 * A record mapping paths to the SectionReference of the section itself.
	 */
	references: Record<string, SectionReference>

	/**
	 * A record mapping paths to their position in `paths`.
	 */
	pathIndex: Record<string, number>
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
	 * @type {SearchState}
	 */
	search: SearchState

	/**
	 * The current language setting for the session.
	 * @type {string}
	 */
	language: string
}
