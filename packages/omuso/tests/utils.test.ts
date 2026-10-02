import { describe, expect, test } from 'bun:test'
import { slugify } from '../src/common/utils'

describe('slugify', () => {
	test('turns dots between digits into hyphens', () => {
		expect(slugify('Section 1.1.1')).toBe('section-1-1-1')
	})

	test('drops trailing dots', () => {
		expect(slugify('Intro.')).toBe('intro')
		expect(slugify('The end...')).toBe('the-end')
	})

	test('treats dots followed by spaces as a single separator', () => {
		expect(slugify('Vol. 2')).toBe('vol-2')
		expect(slugify('Cap. I. Origen')).toBe('cap-i-origen')
	})

	test('strips diacritics and punctuation', () => {
		expect(slugify('¿Qué es esto?')).toBe('que-es-esto')
	})

	describe('wiki style', () => {
		test('keeps case and joins words with underscores', () => {
			expect(slugify('IX. Capítulo primero', 'wiki')).toBe('IX_Capítulo_primero')
		})

		test('keeps diacritics as single code points (NFC)', () => {
			const decomposed = 'España'
			expect(slugify(decomposed, 'wiki')).toBe('España')
			expect(slugify(decomposed, 'wiki')).toBe(
				decodeURIComponent(encodeURIComponent('España')),
			)
		})

		test('drops punctuation that would break the URL', () => {
			expect(slugify('¿Qué es esto? #1/2', 'wiki')).toBe('Qué_es_esto_12')
		})

		test('keeps hyphens and turns dots into separators', () => {
			expect(slugify('Self-help', 'wiki')).toBe('Self-help')
			expect(slugify('Section 1.1. Intro.', 'wiki')).toBe('Section_1_1_Intro')
		})
	})
})
