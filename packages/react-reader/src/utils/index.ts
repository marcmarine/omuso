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

/**
 * Mirrors the `64rem` breakpoint in `styles/layout.css`: from this width up
 * the panels sit beside the content instead of overlaying it.
 */
const WIDE_VIEWPORT_QUERY = '(min-width: 64rem)'

export function isWideViewport() {
	return window.matchMedia(WIDE_VIEWPORT_QUERY).matches
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

/**
 * Dates are read in UTC: `1919-01-01` is midnight UTC, which is still 1918
 * in timezones behind UTC. Years before 1 AD are shown with their era.
 */
export function formatYear(date: string, language: string): string | null {
	if (!date) return null

	const parsed = new Date(date)
	if (Number.isNaN(parsed.getTime())) return null

	const year = parsed.getUTCFullYear()
	if (year > 0) return String(year)

	return new Intl.DateTimeFormat(language || undefined, {
		year: 'numeric',
		era: 'short',
		timeZone: 'UTC',
	}).format(parsed)
}
