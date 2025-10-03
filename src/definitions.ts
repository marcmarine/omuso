interface BaseNode {
	type: string
}

interface ParentNode extends BaseNode {
	content: MarkdownNode[]
}

export interface RootNode extends ParentNode {
	type: 'root'
	title: string
	author?: string
	language?: string
	translator?: string
	date?: string | Date
}

export interface SectionNode extends ParentNode {
	type: 'section'
	title: string
	depth: number
}

export interface ParagraphMark {
	type: 'strong' | 'emphasis'
	start: number
	end: number
}

export interface ParagraphNode extends BaseNode {
	type: 'paragraph'
	content: string
	marks: ParagraphMark[]
}

type MarkdownNode = SectionNode | ParagraphNode

export interface MarkRule {
	type: string
	delimiter: string
}
