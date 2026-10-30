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

/**
 * Counts the levels of a section path (`'1.2.3'` → 3), the same measure
 * `omuso` uses for `maxNavigationDepth`. Unlike `section.depth` (the
 * markdown heading level), it doesn't change when headings skip levels.
 */
export function sectionLevel(path: string): number {
	return path.split('.').length
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

/**
 * Languages the runtime has no locale data for: `Intl.DisplayNames` would
 * name them in the default locale (`grc` → `Ancient Greek`) instead of in
 * themselves.
 */
const LANGUAGE_NAME_OVERRIDES: Record<string, string> = {
	grc: 'ελληνικά',
}

/**
 * Names a language in itself (`fr` → `Français`) via `Intl.DisplayNames`.
 * Falls back to the raw code when it isn't a valid BCP 47 tag or the runtime
 * has no name for it.
 */
export function getLanguageNames(languageCode: string) {
	const override = LANGUAGE_NAME_OVERRIDES[languageCode]
	if (override) return override

	try {
		const name = new Intl.DisplayNames([languageCode], {
			type: 'language',
			fallback: 'code',
		}).of(languageCode)
		if (!name || name === languageCode) return languageCode

		return name.charAt(0).toLocaleUpperCase(languageCode) + name.slice(1)
	} catch {
		return languageCode
	}
}

const FALLBACK_LANGUAGE = 'en'

/**
 * Picks the first candidate in `available`, trying each one as given and
 * then by its base language (`pt-BR` → `pt`). Falls back to `en` and then to
 * the first available language, so the result always exists.
 */
export function resolveLanguage(
	candidates: Array<string | undefined>,
	available: ReadonlyArray<string>,
): string {
	for (const candidate of candidates) {
		if (!candidate) continue
		if (available.includes(candidate)) return candidate

		const [base] = candidate.split('-')
		if (base && available.includes(base)) return base
	}

	if (available.includes(FALLBACK_LANGUAGE)) return FALLBACK_LANGUAGE
	return available[0] ?? FALLBACK_LANGUAGE
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
