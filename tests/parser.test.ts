import { beforeAll, describe, expect, test } from 'bun:test'
import {
	type InlineMark,
	type Paragraph,
	parse,
	type Root,
	type Section,
} from '../src/index'
import sampleMarkdown from './fixtures/sample.md' with { type: 'file' }

let root: Root

beforeAll(async () => {
	const content = await Bun.file(sampleMarkdown).text()
	root = parse(content)
})

describe('parser', () => {
	test('splits frontmatter and parse metadata', () => {
		expect(root.type).toBe('root')
		expect(root.title).toBe('La Iliada')
		expect(root.author).toBe('Homer')
		expect(root.language).toBe('ca')
	})

	test('parses sections hierarchy', () => {
		expect(root.content.length).toBe(1)
		const section = root.content[0] as Section
		expect(section.type).toBe('section')

		expect(section.title).toBe('Section A')
		expect(section.content.length).toBe(3)

		const subsection = section.content.find((n) => n.type === 'section')
		expect(subsection).toBeDefined()
		if (subsection && subsection.type === 'section') {
			expect(subsection.title).toBe('Subsection A1')
			expect(subsection.depth).toBe(3)
			expect(subsection.content.length).toBe(2)
		}
	})

	test('parses paragraphs with emphasis markup (*)', () => {
		const section = root.content[0] as Section
		if (section.type === 'section') {
			const paragraph = section.content[0] as Paragraph
			expect(paragraph.type).toBe('paragraph')
			if (paragraph.type === 'paragraph') {
				expect(paragraph.value).toContain('Text in italics and more text.')
				expect(paragraph.marks.length).toBe(1)
				const mark = paragraph.marks[0] as InlineMark
				expect(mark.type).toBe('emphasis')
				expect(paragraph.value.slice(mark.start, mark.end)).toBe('italics')
			}
		}
	})

	test('parses paragraphs with emphasis markup (_)', () => {
		const section = root.content[0] as Section
		if (section.type === 'section') {
			const paragraph = section.content[1] as Paragraph
			expect(paragraph.type).toBe('paragraph')
			if (paragraph.type === 'paragraph') {
				expect(paragraph.value).toContain('Text in italics with underscore.')
				expect(paragraph.marks.length).toBe(1)
				const mark = paragraph.marks[0] as InlineMark
				expect(mark.type).toBe('emphasis')
				expect(paragraph.value.slice(mark.start, mark.end)).toBe('italics')
			}
		}
	})

	test('handles unclosed marks gracefully', () => {
		const section = root.content[0] as Section
		if (section.type === 'section') {
			const subsection = section.content.find((n) => n.type === 'section')
			if (subsection && subsection.type === 'section') {
				const paragraph = subsection.content[1] as Paragraph
				expect(paragraph.type).toBe('paragraph')
				if (paragraph.type === 'paragraph') {
					expect(paragraph.marks.length).toBe(0)
					expect(paragraph.value).toContain('Text with *unclosed mark')
				}
			}
		}
	})
})
