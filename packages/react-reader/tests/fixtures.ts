import { createContext } from 'omuso'

/**
 * A book in English and Spanish, with kebab slugs:
 * - `1` → `/book` · `/libro`
 * - `1.1` → `/book/chapter-one` · `/libro/capitulo-uno`
 * - `1.1.1` → `/book/chapter-one/part-a` · `/libro/capitulo-uno/parte-a`
 * - `1.2` → `/book/chapter-two` · `/libro/capitulo-dos`
 */
export const book = createContext({
	markdowns: {
		en: '# Book\n\nIntro.\n\n## Chapter One\n\nOne.\n\n### Part A\n\nA.\n\n## Chapter Two\n\nTwo.',
		es: '# Libro\n\nIntro.\n\n## Capítulo uno\n\nUno.\n\n### Parte A\n\nA.\n\n## Capítulo dos\n\nDos.',
	},
})

/**
 * A Spanish book with wiki slugs, which keep diacritics:
 * `1.1` → `/Libro/Capítulo_uno`.
 */
export const wikiBook = createContext({
	markdowns: { es: '# Libro\n\n## Capítulo uno\n\nUno.' },
	slugStyle: 'wiki',
})

/**
 * A book parsed without slugs, so it has no URLs.
 */
export const sluglessBook = createContext({
	markdowns: { en: '# Book\n\n## Chapter One\n\nOne.' },
	slugStyle: 'none',
})
