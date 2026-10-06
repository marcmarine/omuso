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
		1: 'om-heading--1',
		2: 'om-heading--2',
		3: 'om-heading--3',
		4: 'om-heading--4',
	}

	return React.createElement(
		`h${depth}`,
		{
			...rest,
			className: classes('om-heading', sizeByDepth[depth], className),
		},
		value,
	)
}
