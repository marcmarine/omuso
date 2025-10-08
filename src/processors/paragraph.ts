import { parseInlineMarks } from '../parser/inline-marks'
import type { InlineMark, Paragraph } from '../types'
import type { SectionStack } from '../utils'

export function processParagraph(line: string, sections: SectionStack): void {
	const { value, marks } = parseInlineMarks(line)
	const newParagraph = createParagraph(value, marks)
	sections.addContentToCurrentParent(newParagraph)
}

function createParagraph(value: string, marks: InlineMark[]): Paragraph {
	return {
		type: 'paragraph',
		value,
		marks,
	}
}
