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

	describe('manifest', () => {
		test('buildManifest produces expected metadata and indices', async () => {
			const markdown = await Bun.file('./tests/fixtures/frontmatter.md').text()
			const root = parse(markdown)

			const manifest = buildManifest(root)

			expect(manifest.metadata.title).toBe('La Iliada')
			expect(manifest.metadata.author).toBe('Homer')
			expect(manifest.metadata.language).toBe('ca')
			expect(manifest.metadata.translator).toBe('Conrad Roure i Bofill')

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

		test('navigation: buildTableOfContents returns only sections (no paragraphs)', async () => {
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
	})
})
