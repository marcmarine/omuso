/**
 * How section titles are turned into slugs:
 * - `kebab`: lowercase, without diacritics, words joined by `-` (`/ix-capitulo-primero`).
 * - `wiki`: keeps case and diacritics, words joined by `_` (`/IX_Capítulo_primero`).
 * - `none`: no slugs are generated; sections and paragraphs have no `slug`.
 */
export type SlugStyle = 'kebab' | 'wiki' | 'none'

export interface ParseOptions {
	/**
	 * The slug style for sections (optional, defaults to `kebab`).
	 */
	slugStyle?: SlugStyle
}

export interface BaseElement {
	type: string
}

interface Location {
	path: string
	/**
	 * Absent when the document is parsed with `slugStyle: 'none'`.
	 */
	slug?: string
}

export type ContentElement = Section | Paragraph
export type Content = Array<ContentElement>

export interface ParentNode extends BaseElement {
	content: Content
}

export interface Root extends ParentNode {
	type: 'root'
	title?: string
	author?: string
	language?: string
	translator?: string
	date?: string
}

export interface Section extends Location, ParentNode {
	type: 'section'
	title: string
	depth: number
}

export type InlineMarkType = 'emphasis' | 'strong'

export interface InlineMark {
	type: InlineMarkType
	start: number
	end: number
}

export interface Paragraph extends Location, BaseElement {
	type: 'paragraph'
	value: string
	marks: InlineMark[]
}

export interface InlineMarkRule {
	type: InlineMarkType
	delimiter: string
}
