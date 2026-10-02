import type { SlugStyle } from '../parser/types'

export function slugify(
	text: string,
	style: Exclude<SlugStyle, 'none'> = 'kebab',
): string {
	if (style === 'wiki') {
		return text
			.normalize('NFC')
			.replace(/\./g, ' ')
			.replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, '')
			.trim()
			.replace(/\s+/g, '_')
			.replace(/_+/g, '_')
	}

	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/\./g, ' ')
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
}
