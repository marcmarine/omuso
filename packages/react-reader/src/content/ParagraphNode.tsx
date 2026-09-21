import type * as omuso from 'omuso'
import { applyMarks } from '../utils/dom'
import { ParagraphElement } from './ParagraphElement'

export function ParagraphNode({
	paragraph,
	query,
}: {
	paragraph: omuso.Paragraph
	query?: string
}) {
	return (
		<ParagraphElement
			value={applyMarks(paragraph.value, paragraph.marks, query)}
		/>
	)
}
