export interface BaseElement {
	type: string
}

interface Location {
	path: string
	slug: string
}

export type Element = Section | Paragraph
export type Content = Array<Element>

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

export interface InlineMark {
	type: 'emphasis'
	start: number
	end: number
}

export interface Paragraph extends Location, BaseElement {
	type: 'paragraph'
	value: string
	marks: InlineMark[]
}

export interface InlineMarkRule {
	type: 'emphasis'
	delimiter: string
}
