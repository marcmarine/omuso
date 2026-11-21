import type * as omuso from 'omuso'
import { applyMarks } from '../utils/dom'
import { useContentComponents } from './ContentComponents'

export function ParagraphNode({
	paragraph,
	query,
}: {
	paragraph: omuso.Paragraph
	query?: string
}) {
	const { paragraph: Paragraph } = useContentComponents()

	return (
		<Paragraph paragraph={paragraph}>
			{applyMarks(paragraph.value, paragraph.marks, query)}
		</Paragraph>
	)
}
