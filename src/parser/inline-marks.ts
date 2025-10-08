import type { InlineMark, InlineMarkRule } from '../types'

const INLINE_MARK_RULES: InlineMarkRule[] = [
	{ type: 'emphasis', delimiter: '*' },
	{ type: 'emphasis', delimiter: '_' },
]

export function parseInlineMarks(text: string): {
	value: string
	marks: InlineMark[]
} {
	let processedValue = ''
	const marks: InlineMark[] = []
	let buffer = ''
	let activeRule: InlineMarkRule | null = null

	for (let i = 0; i < text.length; i++) {
		const remainingText = text.slice(i)

		if (activeRule) {
			if (remainingText.startsWith(activeRule.delimiter)) {
				const startPosition = processedValue.length
				processedValue += buffer
				const endPosition = processedValue.length

				marks.push({
					type: activeRule.type,
					start: startPosition,
					end: endPosition,
				})

				const delimiterLength = activeRule.delimiter.length
				buffer = ''
				activeRule = null
				i += delimiterLength - 1
				continue
			}

			buffer += text[i]
			continue
		}

		const matchingRule = INLINE_MARK_RULES.find((rule) =>
			remainingText.startsWith(rule.delimiter),
		)

		if (matchingRule) {
			activeRule = matchingRule
			buffer = ''
			i += matchingRule.delimiter.length - 1
		} else {
			processedValue += text[i]
		}
	}

	if (activeRule) {
		processedValue += activeRule.delimiter + buffer
	}

	return {
		value: processedValue,
		marks,
	}
}
