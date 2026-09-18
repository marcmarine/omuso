import type * as omuso from 'omuso'
import React from 'react'

export function highlightMatches(text: string, query?: string) {
	if (!query?.trim()) return text

	const escaped = escapeRegExp(query)
	const regex = new RegExp(`(${escaped})`, 'gi')
	const parts = text.split(regex)
	let offset = 0

	return parts.map((part) => {
		const start = offset
		offset += part.length

		const isMatch = part.toLowerCase() === query.toLowerCase()

		if (isMatch) {
			return <mark key={`${start}-${part.length}`}>{part}</mark>
		}

		return part
	})
}

const markTags: Partial<
	Record<omuso.InlineMark['type'], keyof React.JSX.IntrinsicElements>
> = {
	emphasis: 'i',
}

export function applyMarks(
	value: string,
	marks: omuso.InlineMark[] = [],
	query?: string,
): React.ReactNode {
	if (!marks.length) return highlightMatches(value, query)

	const nodes: React.ReactNode[] = []
	let cursor = 0

	for (const mark of marks) {
		const start = Math.max(mark.start, cursor)
		const end = Math.min(Math.max(mark.end, start), value.length)

		if (start > cursor) {
			nodes.push(highlightMatches(value.slice(cursor, start), query))
		}

		const tag = markTags[mark.type]
		const content = highlightMatches(value.slice(start, end), query)
		if (tag && end > start) {
			nodes.push(React.createElement(tag, { key: start }, content))
		} else if (end > start) {
			nodes.push(content)
		}

		cursor = end
	}

	if (cursor < value.length) {
		nodes.push(highlightMatches(value.slice(cursor), query))
	}

	return nodes
}

function escapeRegExp(str: string) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
