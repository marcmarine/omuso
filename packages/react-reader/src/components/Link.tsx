import type React from 'react'
import { useRoutingStrategy } from '../providers/RoutingProvider'

interface Props extends React.HTMLAttributes<HTMLElement> {
	to: string
	query?: string
	children: React.ReactNode
}

export function Link({ to, children, query, ...props }: Props) {
	const { Component = 'a' } = useRoutingStrategy()

	const linkProps =
		Component === 'a'
			? { href: query ? `${to}?query=${encodeURIComponent(query)}` : to }
			: { to: query ? `${to}?query=${encodeURIComponent(query)}` : to }

	return (
		<Component {...linkProps} {...props}>
			{children}
		</Component>
	)
}
