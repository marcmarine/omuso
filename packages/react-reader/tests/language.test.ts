import { describe, expect, test } from 'bun:test'
import { resolveLanguage } from '../src/utils'

describe('resolveLanguage', () => {
	const available = ['en', 'es', 'pt-BR']

	test('picks the first available candidate', () => {
		expect(resolveLanguage(['fr', 'es', 'en'], available)).toBe('es')
	})

	test('skips missing candidates', () => {
		expect(resolveLanguage([undefined, '', 'es'], available)).toBe('es')
	})

	test('matches a regional candidate by its base language', () => {
		expect(resolveLanguage(['es-MX'], available)).toBe('es')
	})

	test('prefers an exact match over the base language', () => {
		expect(resolveLanguage(['pt-BR'], [...available, 'pt'])).toBe('pt-BR')
	})

	test('does not match a base candidate to a regional language', () => {
		expect(resolveLanguage(['pt'], available)).toBe('en')
	})

	test('falls back to English and then to the first available language', () => {
		expect(resolveLanguage(['fr'], available)).toBe('en')
		expect(resolveLanguage(['fr'], ['es', 'ca'])).toBe('es')
		expect(resolveLanguage([], [])).toBe('en')
	})
})
