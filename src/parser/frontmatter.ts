const FRONTMATTER_DELIMITER = '---\n'
const FRONTMATTER_END_DELIMITER = '\n---'

export function splitFrontmatter(text: string): {
	frontmatter: string
	content: string
} {
	const startIndex = text.indexOf(FRONTMATTER_DELIMITER)
	if (startIndex !== 0) {
		return { frontmatter: '', content: text }
	}

	const endIndex = text.indexOf(
		FRONTMATTER_END_DELIMITER,
		startIndex + FRONTMATTER_DELIMITER.length,
	)
	if (endIndex === -1) {
		return { frontmatter: '', content: text }
	}

	const frontmatter = text
		.slice(startIndex + FRONTMATTER_DELIMITER.length, endIndex)
		.trim()

	const content = text
		.slice(endIndex + FRONTMATTER_END_DELIMITER.length)
		.trimStart()

	return { frontmatter, content }
}

export function parseFrontmatterMetadata(
	frontmatter: string,
): Record<string, string> {
	const metadata: Record<string, string> = {}
	const lines = frontmatter.split(/\r?\n/)

	for (const line of lines) {
		const separatorIndex = line.indexOf(':')
		if (separatorIndex === -1) continue

		const key = line.slice(0, separatorIndex).trim()
		const value = line.slice(separatorIndex + 1).trim()

		if (key) {
			metadata[key] = value
		}
	}

	return metadata
}
