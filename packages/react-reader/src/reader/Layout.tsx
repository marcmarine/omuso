import { Children, useCallback, useEffect, useRef } from 'react'
import { Link } from '../components/Link'
import { ResizablePanel } from '../components/ResizablePanel'
import ThemeToggle from '../components/ThemeToggle'
import TranslationSelector from '../components/TranslationSelector'
import { useReader } from '../providers/BookContextProvider'
import { useReaderI18n } from '../providers/I18nProvider'
import { useLayout, useReaderPanels } from '../providers/LayoutProvider'
import { useTheme } from '../providers/ThemeProvider'
import { COVER_PATH } from '../utils/routes'
import Navigation from './Navigation'

import '../styles/index.css'

export default function Layout({ children }: { children: React.ReactNode }) {
	const {
		state: { session },
		meta: { manifest },
	} = useReader()
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
					collapsed={!panel.left.isOpen}
					onResizeEnd={panel.left.setWidth}
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
					collapsed={!panel.right.isOpen}
					onResizeEnd={panel.right.setWidth}
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
	const panel = useReaderPanels()
	const { t } = useReaderI18n()
	const { query } = useReader().state.session.search
	const toggle = panel.right.toggle

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
			aria-label={t('search')}
			aria-expanded={panel.right.isOpen}
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
				data-visible={(query && !panel.right.isOpen) || undefined}
			/>
			{/* <kbd>⌘K</kbd> */}
		</button>
	)
}

function TOCToggle() {
	const panel = useReaderPanels()
	const { t } = useReaderI18n()
	const toggle = panel.left.toggle

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
			aria-label={t('tableOfContents')}
			aria-expanded={panel.left.isOpen}
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
