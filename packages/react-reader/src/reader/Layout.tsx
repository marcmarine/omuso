import { Children, useCallback, useEffect, useRef } from 'react'
import { Link } from '../components/Link'
import { ResizablePanel } from '../components/ResizablePanel'
import ThemeToggle from '../components/ThemeToggle'
import TranslationSelector from '../components/TranslationSelector'
import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import { useTheme } from '../providers/ThemeProvider'
import { isWideLayout } from '../utils'
import { COVER_PATH } from '../utils/routes'
import Navigation from './Navigation'

import '../styles/index.css'

export default function Layout({ children }: { children: React.ReactNode }) {
	const { manifest, session } = useBookContext()
	const { panel, layoutRef } = useLayout()
	const { theme } = useTheme()
	const { title, author } = manifest.metadata
	const pageRef = useRef<HTMLDivElement>(null)
	const currentPath = session.currentSection?.path

	// Back to the top on every page change. It lives here, not in the
	// content, so a custom `contentComponent` keeps it too.
	// biome-ignore lint/correctness/useExhaustiveDependencies: runs on page change
	useEffect(() => {
		pageRef.current?.scrollTo({ top: 0 })
	}, [currentPath])

	// When narrow, the panels cover the page, so a new page closes them,
	// whatever led to it: the pager, the header or the browser history. Only
	// on a change, so a panel left open isn't closed on load.
	const shownPath = useRef(currentPath)
	useEffect(() => {
		if (shownPath.current === currentPath) return
		shownPath.current = currentPath
		if (isWideLayout(layoutRef.current)) return
		if (panel.left.open) panel.left.toggle()
		if (panel.right.open) panel.right.toggle()
	}, [currentPath, panel.left, panel.right, layoutRef])

	const childrenArray = Children.toArray(children)
	const [FirstChild, SecondChild, ThirdChild] = childrenArray

	// The pieces are direct children of `.om-layout`, which places them by
	// grid area.
	return (
		<section className="om-reader" aria-label={title}>
			<div ref={layoutRef} className="om-layout">
				{/* Safari 26 tints its bars from the sticky header but doesn't
				    notice when its color changes, so it's remounted whenever the
				    color may change: on a new theme or page. */}
				<Header
					key={`${theme}:${currentPath ?? ''}`}
					title={title}
					author={author}
				/>
				<ResizablePanel
					maxWidth={250}
					className="om-sidebar"
					initialWidth={panel.left.width}
					collapsed={!panel.left.open}
					onResizeEnd={panel.left.setPanelWidth}
				>
					{FirstChild}
				</ResizablePanel>
				<div ref={pageRef} className="om-page">
					{SecondChild}
				</div>
				<ResizablePanel
					minWidth={300}
					className="om-sidebar"
					initialWidth={panel.right.width}
					collapsed={!panel.right.open}
					onResizeEnd={panel.right.setPanelWidth}
					position="right"
				>
					{ThirdChild}
				</ResizablePanel>
				<Toolbar />
			</div>
		</section>
	)
}

function Header({ title, author }: { title: string; author?: string }) {
	return (
		<header className="om-header">
			<Link path={COVER_PATH} className="om-header__title om-interactive">
				{title}
			</Link>
			{author && <p className="om-header__author">{author}</p>}
		</header>
	)
}

function Toolbar() {
	return (
		<footer className="om-toolbar">
			<div className="om-toolbar__group">
				<TOCToggle />
				<TranslationSelector />
			</div>
			<div className="om-toolbar__group">
				<ThemeToggle />
				<SearchToggle />
				<Navigation />
			</div>
		</footer>
	)
}

function SearchToggle() {
	const { panel, layoutRef, i18n } = useLayout()
	const { session } = useBookContext()
	const { query } = session.search

	const toggle = useCallback(() => {
		if (
			panel.left.open &&
			!panel.right.open &&
			!isWideLayout(layoutRef.current)
		) {
			panel.left.toggle()
		}
		panel.right.toggle()
	}, [panel.left, panel.right, layoutRef])

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
				toggle()
			}
		},
		[toggle],
	)

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleKeyDown])

	return (
		<button
			className="om-icon-button om-interactive"
			onClick={toggle}
			type="button"
			aria-label={i18n.t('search')}
			aria-expanded={panel.right.open}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				fill="none"
				focusable="false"
				viewBox="0 0 24 24"
				strokeWidth={2}
				stroke="currentColor"
				className="om-icon"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
				/>
			</svg>
			<span
				className="om-icon-button__badge"
				data-visible={(query && !panel.right.open) || undefined}
			/>
			{/* <kbd>⌘K</kbd> */}
		</button>
	)
}

function TOCToggle() {
	const { panel, layoutRef, i18n } = useLayout()

	const toggle = useCallback(() => {
		if (
			panel.right.open &&
			!panel.left.open &&
			!isWideLayout(layoutRef.current)
		) {
			panel.right.toggle()
		}
		panel.left.toggle()
	}, [panel.left, panel.right, layoutRef])

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === 'm') {
				event.preventDefault()
				toggle()
			}
		},
		[toggle],
	)

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleKeyDown])

	return (
		<button
			type="button"
			onClick={toggle}
			className="om-icon-button om-interactive"
			aria-label={i18n.t('tableOfContents')}
			aria-expanded={panel.left.open}
		>
			<svg
				aria-hidden="true"
				className="om-icon"
				focusable="false"
				strokeWidth={2}
				fill="currentColor"
				viewBox="0 0 256 256"
			>
				<path d="M76,64A12,12,0,0,1,88,52H216a12,12,0,0,1,0,24H88A12,12,0,0,1,76,64Zm140,52H88a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Zm0,64H88a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24ZM44,112a16,16,0,1,0,16,16A16,16,0,0,0,44,112Zm0-64A16,16,0,1,0,60,64,16,16,0,0,0,44,48Zm0,128a16,16,0,1,0,16,16A16,16,0,0,0,44,176Z" />
			</svg>
		</button>
	)
}
