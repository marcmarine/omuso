import { describe, expect, test } from 'bun:test'
import {
	type InlineMark,
	type Paragraph,
	parse,
	type Section,
} from '../src/index'

describe('parser', () => {
	test('parses simple markdown with section and emphasis', async () => {
		const markdown = await Bun.file('./tests/fixtures/simple.md').text()
		const result = parse(markdown)
		expect(result.type).toBe('root')
		expect(result.title).toBe('Hello World')
		expect(result.content.length).toBe(1)

		const topLevelSection = result.content[0] as Section
		const firstParagraph = topLevelSection.content[0] as Paragraph
		expect(firstParagraph.type).toBe('paragraph')
		expect(firstParagraph.value).toBe('This is a simple paragraph.')
		expect(firstParagraph.marks.length).toBe(0)

		const section = topLevelSection.content[1] as Section
		expect(section.type).toBe('section')
		expect(section.title).toBe('Section 1')
		expect(section.depth).toBe(2)
		expect(section.content.length).toBe(1)

		const sectionParagraph = section.content[0] as Paragraph
		expect(sectionParagraph.type).toBe('paragraph')
		expect(sectionParagraph.value).toBe('Another paragraph with italic text.')
		expect(sectionParagraph.marks.length).toBe(1)

		const emphasisMark = sectionParagraph.marks[0] as InlineMark
		expect(emphasisMark.type).toBe('emphasis')
		expect(emphasisMark.start).toBe(23)
		expect(emphasisMark.end).toBe(34)
	})

	test('splits frontmatter and parse metadata', async () => {
		const markdown = await Bun.file('./tests/fixtures/frontmatter.md').text()
		const root = parse(markdown)

		expect(root.type).toBe('root')
		expect(root.title).toBe('La Iliada')
		expect(root.author).toBe('Homer')
		expect(root.language).toBe('ca')
	})

	test('parses sections hierarchy', async () => {
		const markdown = await Bun.file('./tests/fixtures/frontmatter.md').text()
		const root = parse(markdown)

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

	test('parses paragraphs with emphasis markup (*)', async () => {
		const markdown = await Bun.file('./tests/fixtures/frontmatter.md').text()
		const root = parse(markdown)

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

	test('parses paragraphs with emphasis markup (_)', async () => {
		const markdown = await Bun.file('./tests/fixtures/frontmatter.md').text()
		const root = parse(markdown)

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

	test('handles unclosed marks gracefully', async () => {
		const markdown = await Bun.file('./tests/fixtures/frontmatter.md').text()
		const root = parse(markdown)

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

	test('parses deeply nested sections', async () => {
		const markdown = await Bun.file('./tests/fixtures/nested.md').text()
		const root = parse(markdown)

		expect(root.type).toBe('root')
		expect(root.content.length).toBe(3)

		const introParagraph = root.content[0] as Paragraph
		expect(introParagraph.type).toBe('paragraph')
		expect(introParagraph.value).toBe('Introduction paragraph.')
		expect(introParagraph.marks.length).toBe(0)
		expect(introParagraph.path).toBe('#1')

		const chapter1 = root.content[1] as Section
		expect(chapter1.type).toBe('section')
		expect(chapter1.title).toBe('Chapter 1')
		expect(chapter1.depth).toBe(2)
		expect(chapter1.content.length).toBe(3)
		expect(chapter1.path).toBe('1')

		const chapter1Intro = chapter1.content[0] as Paragraph
		expect(chapter1Intro.type).toBe('paragraph')
		expect(chapter1Intro.value).toBe('Introduction paragraph.')
		expect(chapter1Intro.path).toBe('1#1')

		const section1_1 = chapter1.content[1] as Section
		expect(section1_1.type).toBe('section')
		expect(section1_1.title).toBe('Section 1.1')
		expect(section1_1.depth).toBe(3)
		expect(section1_1.content.length).toBe(2)
		expect(section1_1.path).toBe('1.1')

		const subsection1_1_1 = section1_1.content[1] as Section
		expect(subsection1_1_1.type).toBe('section')
		expect(subsection1_1_1.title).toBe('Section 1.1.1')
		expect(subsection1_1_1.depth).toBe(4)
		expect(subsection1_1_1.content.length).toBe(1)
		expect(subsection1_1_1.path).toBe('1.1.1')

		const paragraph1_1_1 = subsection1_1_1.content[0] as Paragraph
		expect(paragraph1_1_1.path).toBe('1.1.1#1')

		const section1_2 = chapter1.content[2] as Section
		expect(section1_2.type).toBe('section')
		expect(section1_2.title).toBe('Section 1.2')
		expect(section1_2.depth).toBe(3)
		expect(section1_2.content.length).toBe(1)
		expect(section1_2.path).toBe('1.2')

		const chapter2 = root.content[2] as Section
		expect(chapter2.type).toBe('section')
		expect(chapter2.title).toBe('Chapter 2')
		expect(chapter2.depth).toBe(2)
		expect(chapter2.content.length).toBe(1)
		expect(chapter2.path).toBe('2')
	})
})
