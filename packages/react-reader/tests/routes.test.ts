import { describe, expect, test } from 'bun:test'
import {
	COVER_PATH,
	getSearchQuery,
	getWindowRoute,
	normalizeBasePath,
	parseRoute,
	prependBasePath,
	slugForPath,
	stripBasePath,
} from '../src/utils/routes'
import { book, sluglessBook } from './fixtures'

describe('slugForPath', () => {
	const manifest = book.manifest('en')

	test('maps the cover to the root', () => {
		expect(slugForPath(COVER_PATH, manifest)).toBe('/')
	})

	test('maps a section to its slug', () => {
		expect(slugForPath('1.1.1', manifest)).toBe('/book/chapter-one/part-a')
	})

	test('is undefined for an unknown path', () => {
		expect(slugForPath('9', manifest)).toBeUndefined()
	})

	test('is undefined for every path of a book without slugs', () => {
		const slugless = sluglessBook.manifest('en')

		expect(slugForPath(COVER_PATH, slugless)).toBeUndefined()
		expect(slugForPath('1.1', slugless)).toBeUndefined()
	})
})

describe('normalizeBasePath', () => {
	test('is empty for a missing, blank or root base path', () => {
		for (const basePath of [undefined, '', '   ', '/', '//']) {
			expect(normalizeBasePath(basePath)).toBe('')
		}
	})

	test('adds a leading slash and drops trailing ones', () => {
		expect(normalizeBasePath('read')).toBe('/read')
		expect(normalizeBasePath('/read/')).toBe('/read')
		expect(normalizeBasePath('/read//')).toBe('/read')
		expect(normalizeBasePath(' /books/read ')).toBe('/books/read')
	})
})

describe('prependBasePath', () => {
	test('without a base path, only normalizes the pathname', () => {
		expect(prependBasePath('/', '')).toBe('/')
		expect(prependBasePath('', '')).toBe('/')
		expect(prependBasePath('book/', '')).toBe('/book')
	})

	test('puts the base path in front of the pathname', () => {
		expect(prependBasePath('/book/chapter-one', '/read')).toBe(
			'/read/book/chapter-one',
		)
		expect(prependBasePath('book', '/read')).toBe('/read/book')
	})

	test('maps the root to the base path itself', () => {
		expect(prependBasePath('/', '/read')).toBe('/read')
		expect(prependBasePath('', '/read')).toBe('/read')
	})
})

describe('stripBasePath', () => {
	test('without a base path, only normalizes the pathname', () => {
		expect(stripBasePath('/book/', '')).toBe('/book')
		expect(stripBasePath('', '')).toBe('/')
	})

	test('removes the base path', () => {
		expect(stripBasePath('/read/book/chapter-one', '/read')).toBe(
			'/book/chapter-one',
		)
	})

	test('maps the base path itself to the root', () => {
		expect(stripBasePath('/read', '/read')).toBe('/')
		expect(stripBasePath('/read/', '/read')).toBe('/')
	})

	test('is undefined outside the base path', () => {
		expect(stripBasePath('/', '/read')).toBeUndefined()
		expect(stripBasePath('/other/book', '/read')).toBeUndefined()
		expect(stripBasePath('/reader/book', '/read')).toBeUndefined()
	})

	test('undoes prependBasePath', () => {
		for (const pathname of ['/', '/book', '/book/chapter-one']) {
			expect(stripBasePath(prependBasePath(pathname, '/read'), '/read')).toBe(
				pathname,
			)
		}
	})
})

describe('getWindowRoute', () => {
	test('reads the pathname and search of the window', () => {
		window.history.pushState(null, '', '/book?query=one')

		expect(getWindowRoute()).toEqual({
			pathname: '/book',
			search: '?query=one',
		})
	})
})

describe('parseRoute', () => {
	test('parses a URL string, ignoring its origin and hash', () => {
		expect(parseRoute('/book?query=one')).toEqual({
			pathname: '/book',
			search: '?query=one',
		})
		expect(parseRoute('https://example.com/book#part')).toEqual({
			pathname: '/book',
			search: '',
		})
	})

	test('maps an empty string to the root', () => {
		expect(parseRoute('')).toEqual({ pathname: '/', search: '' })
	})

	test('without input, reads the window', () => {
		window.history.pushState(null, '', '/book?query=one')

		expect(parseRoute()).toEqual({ pathname: '/book', search: '?query=one' })
	})

	test('fills what a location object leaves out from the window', () => {
		window.history.pushState(null, '', '/book?query=one')

		expect(parseRoute({ search: '?query=two' })).toEqual({
			pathname: '/book',
			search: '?query=two',
		})
		// A location without `search` keeps the window's query, even for
		// another pathname.
		expect(parseRoute({ pathname: '/libro' })).toEqual({
			pathname: '/libro',
			search: '?query=one',
		})
		// An empty `search` is kept as given.
		expect(parseRoute({ pathname: '/libro', search: '' })).toEqual({
			pathname: '/libro',
			search: '',
		})
	})
})

describe('getSearchQuery', () => {
	test('reads and decodes the query parameter', () => {
		expect(
			getSearchQuery({ pathname: '/', search: '?query=two%20words' }),
		).toBe('two words')
		expect(getSearchQuery({ pathname: '/', search: '?query=a+b&x=1' })).toBe(
			'a b',
		)
	})

	test('is undefined without a query or with an empty one', () => {
		expect(getSearchQuery({ pathname: '/', search: '' })).toBeUndefined()
		expect(getSearchQuery({ pathname: '/', search: '?query=' })).toBeUndefined()
		expect(getSearchQuery({ pathname: '/', search: '?q=one' })).toBeUndefined()
	})
})
