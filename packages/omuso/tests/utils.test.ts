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
})
