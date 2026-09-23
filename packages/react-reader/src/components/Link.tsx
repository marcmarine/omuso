import type React from 'react'
import { useBookContext } from '../providers/BookContextProvider'
import { useRoutingStrategy } from '../providers/RoutingProvider'

interface Props extends React.HTMLAttributes<HTMLElement> {
	to: string
	query?: string
	children: React.ReactNode
}

function isModifiedClick(event: React.MouseEvent<HTMLElement>) {
	return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

function isExternalHref(href: string) {
	return /^[a-z][a-z\d+\-.]*:/i.test(href) || href.startsWith('//')
}

function hasExternalTarget(target?: string) {
	return Boolean(target && target !== '_self')
}

export function Link({ to, children, query, onClick, ...props }: Props) {
	const { Component = 'a' } = useRoutingStrategy()
	const { navigate } = useBookContext()

	const destination = query ? `${to}?query=${encodeURIComponent(query)}` : to
	const linkProps =
		Component === 'a' ? { href: destination } : { to: destination }

	const anchorProps = props as React.AnchorHTMLAttributes<HTMLElement>

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		onClick?.(event)
		if (event.defaultPrevented) return
		if (event.button !== 0) return
		if (isModifiedClick(event)) return
		if (hasExternalTarget(anchorProps.target)) return
		if (anchorProps.download) return
		if (isExternalHref(destination)) return

		if (Component === 'a') {
			event.preventDefault()
			navigate(destination)
		}
	}

	return (
		<Component {...linkProps} {...props} onClick={handleClick}>
			{children}
		</Component>
	)
}
