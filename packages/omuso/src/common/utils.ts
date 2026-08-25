export function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\p{L}\p{N}\s.-]/gu, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/(?<=\d)\.(?=\d)/g, '-')
}
