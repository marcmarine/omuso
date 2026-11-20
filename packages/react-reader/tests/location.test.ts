import { describe, expect, test } from 'bun:test'
import {
	getInitialLocation,
	getInitialSearchQuery,
	type ReaderLocation,
	resolveReaderLocation,
	writeStoredLocation,
} from '../src/utils/location'
import { COVER_PATH } from '../src/utils/routes'
import { book, wikiBook } from './fixtures'

const languages = book.languages
const manifests = book.manifests

const route = (pathname: string, search = '') => ({ pathname, search })

describe('resolveReaderLocation', () => {
	test('maps the root to the cover in the preferred language', () => {
		expect(
			resolveReaderLocation(route('/'), 'es', languages, manifests),
		).toEqual({ language: 'es', path: COVER_PATH })
		expect(
			resolveReaderLocation(route(''), 'es', languages, manifests),
		).toEqual({ language: 'es', path: COVER_PATH })
	})

	test('finds a slug in the preferred language', () => {
		expect(
			resolveReaderLocation(
				route('/book/chapter-one/part-a'),
				'en',
				languages,
				manifests,
			),
		).toEqual({ language: 'en', path: '1.1.1' })
	})

	test('switches language when the slug belongs to another one', () => {
		expect(
			resolveReaderLocation(
				route('/libro/capitulo-dos'),
				'en',
				languages,
				manifests,
			),
		).toEqual({ language: 'es', path: '1.2' })
	})

	test('is undefined for an unknown slug', () => {
		expect(
			resolveReaderLocation(route('/nowhere'), 'en', languages, manifests),
		).toBeUndefined()
		// Pathnames are not normalized here: that happens in stripBasePath.
		expect(
			resolveReaderLocation(route('/book/'), 'en', languages, manifests),
		).toBeUndefined()
	})

	test('decodes percent-encoded slugs', () => {
		const resolve = (pathname: string) =>
			resolveReaderLocation(
				route(pathname),
				'es',
				wikiBook.languages,
				wikiBook.manifests,
			)

		expect(resolve('/Libro/Capítulo_uno')).toEqual({
			language: 'es',
			path: '1.1',
		})
		expect(resolve('/Libro/Cap%C3%ADtulo_uno')).toEqual({
			language: 'es',
			path: '1.1',
		})
		expect(resolve('/Libro/Cap%C3_uno')).toBeUndefined()
	})
})

describe('getInitialLocation', () => {
	const initial = (
		options: {
			location?: Partial<Location>
			basePath?: string
			defaultLanguage?: string
		} = {},
	): ReaderLocation =>
		getInitialLocation(
			options.location,
			options.basePath ?? '',
			options.defaultLanguage,
			languages,
			manifests,
		)

	const store = (value: unknown) =>
		window.localStorage.setItem(
			'omuso:location',
			typeof value === 'string' ? value : JSON.stringify(value),
		)

	test('opens the cover in the default language at the root', () => {
		expect(initial({ defaultLanguage: 'es' })).toEqual({
			language: 'es',
			path: COVER_PATH,
		})
	})

	test('resolves the default language by its base', () => {
		expect(initial({ defaultLanguage: 'es-MX' }).language).toBe('es')
		expect(initial({ defaultLanguage: 'fr' }).language).toBe('en')
	})

	test('opens the section in the window URL', () => {
		window.history.pushState(null, '', '/libro/capitulo-uno')

		expect(initial({ defaultLanguage: 'en' })).toEqual({
			language: 'es',
			path: '1.1',
		})
	})

	test('prefers a given location over the window', () => {
		window.history.pushState(null, '', '/libro/capitulo-uno')

		expect(initial({ location: { pathname: '/book/chapter-two' } })).toEqual({
			language: 'en',
			path: '1.2',
		})
	})

	test('strips the base path from the URL', () => {
		window.history.pushState(null, '', '/read/book/chapter-two')

		expect(initial({ basePath: '/read' })).toEqual({
			language: 'en',
			path: '1.2',
		})
	})

	test('falls back to the stored location for an unknown URL', () => {
		writeStoredLocation({ language: 'es', path: '1.2' })
		window.history.pushState(null, '', '/nowhere')

		expect(initial({ defaultLanguage: 'en' })).toEqual({
			language: 'es',
			path: '1.2',
		})
	})

	test('falls back to the stored location outside the base path', () => {
		writeStoredLocation({ language: 'es', path: '1.2' })
		window.history.pushState(null, '', '/book/chapter-one')

		expect(initial({ basePath: '/read' })).toEqual({
			language: 'es',
			path: '1.2',
		})
	})

	test('at the root, opens the cover in the stored language', () => {
		writeStoredLocation({ language: 'es', path: '1.2' })

		expect(initial({ defaultLanguage: 'en' })).toEqual({
			language: 'es',
			path: COVER_PATH,
		})
	})

	test('a section URL keeps its own language over the stored one', () => {
		writeStoredLocation({ language: 'es', path: '1.2' })
		window.history.pushState(null, '', '/book/chapter-one')

		expect(initial()).toEqual({ language: 'en', path: '1.1' })
	})

	test('replaces a stored language that is not available', () => {
		store({ language: 'fr', path: '1.2' })
		window.history.pushState(null, '', '/nowhere')

		expect(initial({ defaultLanguage: 'es' })).toEqual({
			language: 'es',
			path: '1.2',
		})
	})

	test('ignores malformed or incomplete storage', () => {
		window.history.pushState(null, '', '/nowhere')

		for (const value of ['not json', 'null', { language: 'es' }, { path: 1 }]) {
			store(value)
			expect(initial({ defaultLanguage: 'es' })).toEqual({
				language: 'es',
				path: COVER_PATH,
			})
		}
	})
})

describe('writeStoredLocation', () => {
	test('stores the location under a namespaced key', () => {
		writeStoredLocation({ language: 'es', path: '1.1' })

		expect(
			JSON.parse(window.localStorage.getItem('omuso:location') ?? ''),
		).toEqual({ language: 'es', path: '1.1' })
	})
})

describe('getInitialSearchQuery', () => {
	test('reads the query from the window URL', () => {
		window.history.pushState(null, '', '/book?query=one')

		expect(getInitialSearchQuery(undefined, '')).toBe('one')
	})

	test('reads the query from a given location', () => {
		expect(
			getInitialSearchQuery({ pathname: '/book', search: '?query=two' }, ''),
		).toBe('two')
	})

	test('is undefined outside the base path or without a query', () => {
		window.history.pushState(null, '', '/book?query=one')
		expect(getInitialSearchQuery(undefined, '/read')).toBeUndefined()

		window.history.pushState(null, '', '/read/book')
		expect(getInitialSearchQuery(undefined, '/read')).toBeUndefined()
	})
})
