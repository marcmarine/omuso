interface BaseElement {
	type: string
}

interface ParentNode extends BaseElement {
	content: (Section | Paragraph)[]
}

export interface Root extends ParentNode {
	type: 'root'
	title: string
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

export interface Mark {
	type: 'emphasis'
	start: number
	end: number
}

export interface Paragraph extends BaseElement {
	type: 'paragraph'
	value: string
	marks: Mark[]
}

export interface MarkRule {
	type: 'emphasis'
	delimiter: string
}
