import type * as omuso from 'omuso'

type ClassValue = string | number | false | null | undefined | ClassValue[]

export function classes(...values: ClassValue[]) {
	const result: string[] = []

	const collect = (value: ClassValue) => {
		if (Array.isArray(value)) {
			for (const item of value) collect(item)
			return
		}

		if (value) result.push(String(value))
	}

	for (const value of values) collect(value)

	return result.join(' ')
}

export const splitContent = (items: omuso.Root['content']) => {
	const paragraphs: omuso.Paragraph[] = []
	const sections: omuso.Section[] = []

	for (const item of items) {
		if (item.type === 'paragraph') paragraphs.push(item)
		else if (item.type === 'section') sections.push(item)
	}

	return { paragraphs, sections }
}

export function getLanguageNames(languageCode: string) {
	switch (languageCode) {
		case 'en':
			return 'English'
		case 'es':
			return 'Español'
		case 'ca':
			return 'Català'
		case 'ru':
			return 'русский'
		case 'grc':
			return 'ελληνικά'
		default:
			return languageCode
	}
}
