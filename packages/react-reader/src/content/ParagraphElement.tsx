import React from 'react'
import { classes } from '../utils'

export function ParagraphElement({
	value,
	className,
	...rest
}: {
	value: string | React.ReactNode
	className?: string
} & React.HTMLAttributes<HTMLParagraphElement>) {
	return React.createElement(
		'p',
		{
			...rest,
			className: classes('or-paragraph', className),
		},
		value,
	)
}
