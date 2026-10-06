import type React from 'react'
import { useBookContext } from '../providers/BookContextProvider'
import { useRoutingStrategy } from '../providers/RoutingProvider'
import { prependBasePath, slugForPath } from '../utils/routes'

interface BaseProps
	extends Omit<React.AnchorHTMLAttributes<HTMLElement>, 'href'> {
	query?: string
	children: React.ReactNode
}

/**
 * A link either points to a URL (`to`) or to a section of the book (`path`).
 * Section links get their URL from the slug, or navigate without one when
 * the book has no slugs.
 */
type Props = BaseProps &
	({ to: string; path?: never } | { path: string; to?: never })

function isModifiedClick(event: React.MouseEvent<HTMLElement>) {
	return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

function isExternalHref(href: string) {
	return /^[a-z][a-z\d+\-.]*:/i.test(href) || href.startsWith('//')
}

function hasExternalTarget(target?: string) {
	return Boolean(target && target !== '_self')
}

function toPublicDestination(destination: string, basePath: string) {
	const [rawPathname, ...rest] = destination.split('?')
	const pathname = prependBasePath(rawPathname || '/', basePath)
	const search = rest.length > 0 ? `?${rest.join('?')}` : ''
	return `${pathname}${search}`
}

export function Link({
	to,
	path,
	children,
	query,
	onClick,
	onKeyDown,
	...props
}: Props) {
	const { Component = 'a' } = useRoutingStrategy()
	const { navigate, basePath, manifest } = useBookContext()

	const slug = to ?? slugForPath(path as string, manifest)

	if (slug === undefined) {
		const goToPath = () => navigate({ path: path as string })

		const handleClick = (event: React.MouseEvent<HTMLElement>) => {
			onClick?.(event)
			if (event.defaultPrevented) return
			goToPath()
		}

		const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
			onKeyDown?.(event)
			if (event.defaultPrevented) return
			if (event.key === 'Enter') goToPath()
		}

		// Without slugs there is no URL to point to. An anchor without `href`
		// keeps the link markup (it may wrap headings, which a button can't).
		return (
			// biome-ignore lint/a11y/useSemanticElements: there is no `href` to give it
			<a
				tabIndex={0}
				{...props}
				role="link"
				// biome-ignore lint/a11y/useValidAnchor: slugless books have no URLs
				onClick={handleClick}
				onKeyDown={handleKeyDown}
			>
				{children}
			</a>
		)
	}

	const destination = query
		? `${slug}?query=${encodeURIComponent(query)}`
		: slug
	const publicDestination = isExternalHref(destination)
		? destination
		: toPublicDestination(destination, basePath)
	const linkProps =
		Component === 'a' ? { href: publicDestination } : { to: publicDestination }

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		onClick?.(event)
		if (event.defaultPrevented) return
		if (event.button !== 0) return
		if (isModifiedClick(event)) return
		if (hasExternalTarget(props.target)) return
		if (props.download) return
		if (isExternalHref(destination)) return

		if (Component === 'a') {
			event.preventDefault()
			navigate(destination)
		}
	}

	return (
		<Component
			{...linkProps}
			{...props}
			onClick={handleClick}
			onKeyDown={onKeyDown}
		>
			{children}
		</Component>
	)
}
