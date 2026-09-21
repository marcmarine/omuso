import React from 'react'
import { classes } from '../utils'

export function HeadingElement({
	value,
	depth = 2,
	className,
	...rest
}: {
	value: string | React.ReactNode
	depth?: number
	className?: string
} & React.HTMLAttributes<HTMLHeadingElement>) {
	const sizeByDepth: Record<number, string> = {
		1: 'or-heading--1',
		2: 'or-heading--2',
		3: 'or-heading--3',
		4: 'or-heading--4',
	}

	return React.createElement(
		`h${depth}`,
		{
			...rest,
			className: classes('or-heading', sizeByDepth[depth], className),
		},
		value,
	)
}
