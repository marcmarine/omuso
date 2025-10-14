export interface BaseElement {
	type: string
}

export interface ParentNode extends BaseElement {
	content: (Section | Paragraph)[]
}

export interface Root extends ParentNode {
	type: 'root'
	title?: string
	author?: string
	language?: string
	translator?: string
	date?: string
}

export interface Section extends ParentNode {
	type: 'section'
	title: string
	depth: number
}

export interface InlineMark {
	type: 'emphasis'
	start: number
	end: number
}

export interface Paragraph extends BaseElement {
	type: 'paragraph'
	value: string
	marks: InlineMark[]
}

export interface InlineMarkRule {
	type: 'emphasis'
	delimiter: string
}
