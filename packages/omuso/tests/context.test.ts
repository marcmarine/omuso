import { describe, expect, test } from 'bun:test'
import {
	buildBreadcrumbIndex,
	buildManifest,
	buildSearchResponse,
	buildSlugs,
	buildTableOfContents,
	context,
	createContext,
	findSection,
	generateReadingSession,
	getAllPaths,
	getTotalMatches,
} from '../src/context'
import { parse } from '../src/index'

describe('context', () => {
	describe('creator', () => {
		test('createContext().init builds roots/manifests and session works', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()

			const ctx = createContext().init({
				markdowns: { en: markdown },
				maxNavigationDepth: Infinity,
			})

			expect(ctx.languages).toEqual(['en'])
			expect(ctx.roots.en).toBeDefined()
			expect(ctx.manifests.en).toBeDefined()

			const manifest = ctx.manifest('en')
			expect(manifest).toBeDefined()
			expect(manifest?.paths).toEqual(['1', '1.1', '1.1.1', '1.2', '2'])

			const session = ctx.session('1.1', 'content', 'en')
			expect(session.currentSection?.type).toBe('section')
			expect(session.currentSection?.title).toBe('Section 1.1')
			expect(session.breadcrumbs.map((b) => b.title)).toEqual([
				'Chapter 1',
				'Section 1.1',
			])
		})

		test('singleton context can be initialized and used', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()

			const ctx = context.init({
				markdowns: { en: markdown },
			})

			expect(ctx.languages).toEqual(['en'])
			expect(ctx.session('1', '', 'en').currentSection?.title).toBe('Chapter 1')
		})
	})
	describe('omitPaths', () => {
		const collectTocPaths = (
			sections: Array<{ path: string; content?: any[] }>,
		): string[] =>
			sections.flatMap((s) => [
				s.path,
				...(s.content ? collectTocPaths(s.content) : []),
			])

		test('removes specified sections from the manifest', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()

			const ctx = context.init({
				markdowns: { en: markdown },
				omitPaths: ['1.1'],
			})

			const manifest = ctx.manifest('en')
			const tocPaths = collectTocPaths(manifest.tableOfContents)

			expect(tocPaths).not.toContain('1.1')
			expect(tocPaths).not.toContain('1.1.1')

			const session = ctx.session('1', '', 'en')
			expect(session.currentSection?.title).toBe('Chapter 1')
			expect(session.nextSection?.path).toBe('1.2')
		})

		test('works with singleton context', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()

			const ctx = context.init({
				markdowns: { en: markdown },
				omitPaths: ['1.2'],
			})

			const manifest = ctx.manifest('en')
			const tocPaths = collectTocPaths(manifest.tableOfContents)
			expect(tocPaths).not.toContain('1.2')

			const session = ctx.session('1.1', '', 'en')
			expect(session.nextSection?.path).toBe('1.1.1')
		})
	})
	describe('manifest', () => {
		test('buildManifest produces expected metadata and indices', async () => {
			const markdown = await Bun.file('./tests/fixtures/frontmatter.md').text()
			const root = parse(markdown)

			const manifest = buildManifest(root)

			expect(manifest.metadata.title).toBe('La Iliada')
			expect(manifest.metadata.author).toBe('Homer')
			expect(manifest.metadata.language).toBe('ca')
			expect(manifest.metadata.translator).toBe('Conrad Roure i Bofill')
			expect(manifest.metadata.date).toBe('1879-01-01')

			expect(manifest.paths.length).toBeGreaterThan(0)
			expect(Object.keys(manifest.breadcrumbIndex).length).toBeGreaterThan(0)
			expect(Object.keys(manifest.slugs).length).toBeGreaterThan(0)
			expect(Object.keys(manifest.pathBySlug).length).toBeGreaterThan(0)

			for (const path of manifest.paths) {
				const slug = manifest.slugs[path]
				expect(slug).toBeDefined()
				expect(manifest.pathBySlug[slug as string]).toBe(path)
			}
		})
	})

	describe('navigation', () => {
		test('findSection finds nested section by path', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)

			const section = findSection(root.content, '1.1.1')
			expect(section).toBeDefined()
			expect(section?.type).toBe('section')
			expect(section?.title).toBe('Section 1.1.1')
		})

		test('getAllPaths returns section paths in traversal order', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)

			const paths = getAllPaths(root.content)
			expect(paths).toEqual(['1', '1.1', '1.1.1', '1.2', '2'])
		})

		test('buildBreadcrumbIndex builds breadcrumb trails', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)

			const index = buildBreadcrumbIndex(root.content)

			expect(index['1']).toBeDefined()
			expect(index['1']?.map((b) => b.title)).toEqual(['Chapter 1'])

			expect(index['1.1']).toBeDefined()
			expect(index['1.1']?.map((b) => b.title)).toEqual([
				'Chapter 1',
				'Section 1.1',
			])

			expect(index['1.1.1']).toBeDefined()
			expect(index['1.1.1']?.map((b) => b.title)).toEqual([
				'Chapter 1',
				'Section 1.1',
				'Section 1.1.1',
			])
		})

		test('buildSlugs returns slug per path based on breadcrumb titles', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)

			const breadcrumbIndex = buildBreadcrumbIndex(root.content)
			const slugs = buildSlugs(breadcrumbIndex)

			expect(slugs['1']).toBe('/chapter-1')
			expect(slugs['1.1']).toBe('/chapter-1/section-1-1')
			expect(slugs['1.1.1']).toBe('/chapter-1/section-1-1/section-1-1-1')
		})

		test('buildTableOfContents returns only sections (no paragraphs)', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)

			const toc = buildTableOfContents(root.content)
			expect(Array.isArray(toc)).toBe(true)
			expect(toc.length).toBeGreaterThan(0)

			// top-level TOC entries are sections (no intro paragraph)
			expect(toc[0]?.type).toBe('section')
			expect(toc[0]?.title).toBe('Chapter 1')
		})
	})

	describe('search', () => {
		test('buildSearchResponse finds title matches and sorts by relevance', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)

			const results = buildSearchResponse(root.content, 'Chapter')
			expect(results.length).toBeGreaterThan(0)

			const top = results[0]
			expect(top?.type).toBe('section')
			if (top?.type === 'section') {
				expect(top?.title.toLowerCase()).toContain('chapter')
				expect(top?.titleMatchCount).toBeGreaterThan(0)
			}
		})

		test('getTotalMatches sums counts across results', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)

			const results = buildSearchResponse(root.content, 'content')
			const total = getTotalMatches(results)

			expect(total).toBeGreaterThan(0)
		})
	})

	describe('session', () => {
		test('generateReadingSession returns breadcrumbs and next/prev', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)
			const manifest = buildManifest(root)

			const session = generateReadingSession(
				root.content,
				manifest,
				'1.1',
				'content',
				'en',
				Infinity,
			)

			expect(session.language).toBe('en')
			expect(session.currentSection?.type).toBe('section')
			expect(session.currentSection?.title).toBe('Section 1.1')

			expect(session.breadcrumbs.map((b) => b.title)).toEqual([
				'Chapter 1',
				'Section 1.1',
			])

			expect(session.prevSection?.path).toBe('1') // previous path in order
			expect(session.nextSection?.path).toBe('1.1.1') // next path in order

			expect(session.search.query).toBe('content')
			expect(session.search.totalMatches).toBeGreaterThan(0)
		})

		test('maxNavigationDepth clamps next/prev navigation', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)
			const manifest = buildManifest(root)

			// From 1.1, with max depth 2, "next" should skip deeper (1.1.1) and go to 1.2
			const session = generateReadingSession(
				root.content,
				manifest,
				'1.1',
				'',
				'en',
				2,
			)

			expect(session.nextSection?.path).toBe('1.2')
		})

		test('search results keep parentSection references and consistent totalMatches', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)
			const manifest = buildManifest(root)

			// Query matching nested paragraphs in Sections 1.1, 1.1.1 and 1.2
			const session = generateReadingSession(
				root.content,
				manifest,
				'1.1',
				'Subsection',
				'en',
				Infinity,
			)

			const sectionResults = session.search.results.filter(
				(r) => r.type === 'section',
			)
			expect(sectionResults.map((r) => r.path).sort()).toEqual([
				'1.1',
				'1.1.1',
				'1.2',
			])

			// Each nested section result keeps its parent reference
			expect(
				sectionResults.find((r) => r.path === '1.1')?.parentSection,
			).toEqual({
				path: '1',
				title: 'Chapter 1',
				depth: 2,
				slug: '/chapter-1',
			})
			expect(
				sectionResults.find((r) => r.path === '1.1.1')?.parentSection,
			).toEqual({
				path: '1.1',
				title: 'Section 1.1',
				depth: 3,
				slug: '/chapter-1/section-1-1',
			})
			expect(
				sectionResults.find((r) => r.path === '1.2')?.parentSection,
			).toEqual({
				path: '1',
				title: 'Chapter 1',
				depth: 2,
				slug: '/chapter-1',
			})

			// Matching paragraphs are reported with their counts
			expect(sectionResults.find((r) => r.path === '1.1')?.paragraphs).toEqual([
				{
					path: '1.1_1',
					value: 'Subsection content.',
					matchCount: 1,
					hasMatch: true,
				},
			])

			// Nested matching paragraphs also surface as standalone results
			// (current behavior: duplicated with parentSection null)
			const paragraphResults = session.search.results.filter(
				(r) => r.type === 'paragraph',
			)
			expect(paragraphResults.map((p) => p.path).sort()).toEqual([
				'1.1.1_1',
				'1.1_1',
				'1.2_1',
			])
			for (const paragraph of paragraphResults) {
				expect(paragraph.parentSection).toBeNull()
			}

			// totalMatches is the sum across all results
			expect(session.search.totalMatches).toBe(6)
			expect(session.search.totalMatches).toBe(
				getTotalMatches(session.search.results),
			)
		})

		test('search results keep orphan root paragraphs with null parentSection', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)
			const manifest = buildManifest(root)

			// Query matching the root-level paragraph (path '_1')
			const session = generateReadingSession(
				root.content,
				manifest,
				'1',
				'Introduction',
				'en',
				Infinity,
			)

			const orphan = session.search.results.find((r) => r.type === 'paragraph')
			expect(orphan).toBeDefined()
			expect(orphan?.path).toBe('_1')
			expect(orphan?.parentSection).toBeNull()

			expect(session.search.totalMatches).toBe(
				getTotalMatches(session.search.results),
			)
		})
	})
})
