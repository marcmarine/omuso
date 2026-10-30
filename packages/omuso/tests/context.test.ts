import { describe, expect, mock, test } from 'bun:test'
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
import { isPathOmitted } from '../src/context/utils'
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
	describe('isolation', () => {
		test('methods work when destructured', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()

			const { init } = createContext()
			const { manifest, session, languages } = init({
				markdowns: { en: markdown },
			})

			expect(languages).toEqual(['en'])
			expect(manifest('en').paths).toEqual(['1', '1.1', '1.1.1', '1.2', '2'])
			expect(session('1.1', '', 'en').currentSection?.title).toBe('Section 1.1')
		})

		test('separate contexts do not share state', () => {
			const a = createContext().init({
				markdowns: { en: '## Book A' },
				omitPaths: ['1'],
			})
			const b = createContext().init({
				markdowns: { ca: '## Book B' },
			})

			expect(a.languages).toEqual(['en'])
			expect(b.languages).toEqual(['ca'])
			expect(a.omittedPaths).toEqual(['1'])
			expect(b.omittedPaths).toEqual([])
			expect(a.roots.ca).toBeUndefined()
			expect(a.session('1', '', 'en').currentSection?.title).toBe('Book A')
			expect(b.session('1', '', 'ca').currentSection?.title).toBe('Book B')
		})

		test('re-initializing drops languages from the previous init', () => {
			const ctx = createContext()
			ctx.init({ markdowns: { en: '## One' } })
			ctx.init({ markdowns: { ca: '## Dos' } })

			expect(ctx.languages).toEqual(['ca'])
			expect(ctx.roots.en).toBeUndefined()
			expect(ctx.manifests.en).toBeUndefined()
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

		test('excludes omitted sections and their descendants from search', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()

			const ctx = createContext().init({
				markdowns: { en: markdown },
				omitPaths: ['1.1'],
			})

			const session = ctx.session('1', 'Subsection', 'en')
			const paths = session.search.results.map((r) => r.path)

			expect(paths).not.toContain('1.1')
			expect(paths).not.toContain('1.1.1')
			expect(paths).toContain('1.2')
			expect(session.search.totalMatches).toBe(1)
		})

		test('buildSearchResponse uses prefix matching on path segments', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)

			// Omitting '1' hides all of Chapter 1 but not Chapter 2 or root paragraphs
			const results = buildSearchResponse(root.content, 'content', ['1'])
			expect(results.map((r) => r.path)).toEqual(['2'])

			const intro = buildSearchResponse(root.content, 'Introduction', ['1'])
			expect(intro.map((r) => r.path)).toEqual(['_1'])
		})
	})

	describe('search filter', () => {
		const queries = ['content', 'Section', 'Introduction', 'sub', 'Chapter']

		const initWith = async (omitPaths: Array<string>) => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			return createContext().init({ markdowns: { en: markdown }, omitPaths })
		}

		test('without filter, matches filtering omitted sections after the search', async () => {
			for (const omitPaths of [[], ['1'], ['1.1'], ['1.1.1'], ['1.2', '2']]) {
				const ctx = await initWith(omitPaths)
				const content = ctx.roots.en?.content ?? []

				for (const query of queries) {
					const expected = buildSearchResponse(content, query).filter(
						(r) => r.type !== 'section' || !isPathOmitted(r.path, omitPaths),
					)

					const state = ctx.search(query, 'en')
					expect(state.results).toEqual(expected)
					expect(state.totalMatches).toBe(getTotalMatches(expected))
					expect(ctx.session('1', query, 'en').search).toEqual(state)
				}
			}
		})

		test('a filter that keeps everything includes omitted sections', async () => {
			const ctx = await initWith(['1.1'])

			const paths = ctx
				.search('content', 'en', { filter: () => true })
				.results.map((r) => r.path)

			expect(paths).toContain('1.1')
			expect(paths).toContain('1.1.1')
		})

		test('passes whether each section is omitted, once per section in document order', async () => {
			const ctx = await initWith(['1.1'])
			const filter = mock((_path: string, _omitted: boolean) => true)

			ctx.search('content', 'en', { filter })

			expect(filter.mock.calls).toEqual([
				['1', false],
				['1.1', true],
				['1.1.1', true],
				['1.2', false],
				['2', false],
			])
		})

		test('an excluded section does not exclude its children', async () => {
			const ctx = await initWith(['1.1'])
			const filter = mock((path: string) => path !== '1.1')

			const { results } = ctx.search('content', 'en', { filter })
			const child = results.find((r) => r.path === '1.1.1')

			expect(results.map((r) => r.path)).not.toContain('1.1')
			expect(filter).toHaveBeenCalledWith('1.1.1', true)
			expect(child?.depth).toBe(ctx.manifest('en').references['1.1.1']?.depth)
			expect(child?.parentSection?.path).toBe('1.1')
		})

		test('totalMatches only counts included sections', async () => {
			const ctx = await initWith([])

			const all = ctx.search('content', 'en')
			const filtered = ctx.search('content', 'en', {
				filter: (path) => path !== '2',
			})

			expect(filtered.results.map((r) => r.path)).not.toContain('2')
			expect(filtered.totalMatches).toBe(getTotalMatches(filtered.results))
			expect(filtered.totalMatches).toBeLessThan(all.totalMatches)
		})

		test('keeps sorting by relevance after filtering', async () => {
			const ctx = await initWith([])
			const filter = (path: string) => path !== '1.2'

			const { results } = ctx.search('Section', 'en', { filter })
			const expected = buildSearchResponse(
				ctx.roots.en?.content ?? [],
				'Section',
			).filter((r) => r.path !== '1.2')

			expect(results).toEqual(expected)
		})

		test('does not call the filter for an empty query', async () => {
			const ctx = await initWith(['1.1'])
			const filter = mock(() => true)

			for (const query of ['', '   ']) {
				expect(ctx.search(query, 'en', { filter })).toEqual({
					query,
					results: [],
					totalMatches: 0,
				})
			}
			expect(filter).not.toHaveBeenCalled()
		})

		test('root paragraphs are not filtered', async () => {
			const ctx = await initWith([])

			const { results } = ctx.search('Introduction', 'en', {
				filter: () => false,
			})

			expect(results.map((r) => r.path)).toEqual(['_1'])
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

			for (let i = 0; i < manifest.paths.length; i++) {
				const path = manifest.paths[i] as string
				expect(manifest.pathIndex[path]).toBe(i)
				expect(manifest.references[path]?.path).toBe(path)
				expect(manifest.references[path]).toEqual(
					manifest.breadcrumbIndex[path]?.at(-1),
				)
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

		test('createContext().init applies slugStyle to the manifest', () => {
			const ctx = createContext().init({
				markdowns: { es: '# Libro\n\n## IX. Capítulo primero\n\nHola' },
				slugStyle: 'wiki',
			})
			const manifest = ctx.manifest('es')

			expect(manifest.slugs['1.1']).toBe('/Libro/IX_Capítulo_primero')
			expect(manifest.pathBySlug['/Libro/IX_Capítulo_primero']).toBe('1.1')
		})

		test('createContext().init with slugStyle none leaves slug maps empty', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const ctx = createContext().init({
				markdowns: { en: markdown },
				slugStyle: 'none',
			})
			const manifest = ctx.manifest('en')

			expect(manifest.slugStyle).toBe('none')
			expect(manifest.slugs).toEqual({})
			expect(manifest.pathBySlug).toEqual({})
			expect(manifest.paths.length).toBeGreaterThan(0)

			const session = ctx.session('1.1', '', 'en')
			expect(session.currentSection?.path).toBe('1.1')
			expect(session.breadcrumbs.every((b) => b.slug === undefined)).toBe(true)
		})

		test('manifest exposes kebab as the default slugStyle', () => {
			const manifest = createContext()
				.init({ markdowns: { en: '# Title\n\n## Chapter 1' } })
				.manifest('en')

			expect(manifest.slugStyle).toBe('kebab')
		})

		test('manifest slugs match the slugs computed by the parser', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)
			const manifest = buildManifest(root)

			for (const path of manifest.paths) {
				const section = findSection(root.content, path)
				expect(manifest.slugs[path]).toBe(section?.slug as string)
			}
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

		test('unknown paths have no next/prev, even if they match Object.prototype keys', async () => {
			const markdown = await Bun.file('./tests/fixtures/nested.md').text()
			const root = parse(markdown)
			const manifest = buildManifest(root)

			for (const path of ['9.9', 'constructor', 'toString']) {
				const session = generateReadingSession(
					root.content,
					manifest,
					path,
					'',
					'en',
				)
				expect(session.nextSection).toBeNull()
				expect(session.prevSection).toBeNull()
			}
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

			// Nested matching paragraphs are represented by their section result only,
			// so counts match what the reader renders.
			const paragraphResults = session.search.results.filter(
				(r) => r.type === 'paragraph',
			)
			expect(paragraphResults).toEqual([])

			// totalMatches is the sum across all results
			expect(session.search.totalMatches).toBe(3)
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
