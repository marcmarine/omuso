import { Children, useCallback, useEffect } from 'react'
import { Link } from '../components/Link'
import { ResizablePanel } from '../components/ResizablePanel'
import ThemeToggle from '../components/ThemeToggle'
import TranslationSelector from '../components/TranslationSelector'
import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import { classes } from '../utils'
import Navigation from './Navigation'

import '../styles/index.css'

export default function Layout({ children }: { children: React.ReactNode }) {
	const { manifest } = useBookContext()
	const { panel } = useLayout()
	const { title, author } = manifest.metadata

	const childrenArray = Children.toArray(children)
	const [FirstChild, SecondChild, ThirdChild] = childrenArray

	return (
		<div className="omuso-reader or-layout">
			<div className="or-layout__body">
				<div className="or-layout__main">
					<Header title={title} author={author} />
					<main className="or-layout__stage">
						<ResizablePanel
							maxWidth={300}
							className="or-layout__panel or-layout__panel--left"
							initialWidth={panel.left.width}
							collapsed={!panel.left.open}
							onResizeEnd={panel.left.setPanelWidth}
						>
							{FirstChild}
						</ResizablePanel>
						<article className="or-layout__article">
							<div className="or-layout__page">{SecondChild}</div>
						</article>
					</main>
				</div>
				<ResizablePanel
					minWidth={250}
					className="or-layout__panel or-layout__panel--right"
					initialWidth={panel.right.width}
					collapsed={!panel.right.open}
					onResizeEnd={panel.right.setPanelWidth}
					position="right"
				>
					{ThirdChild}
				</ResizablePanel>
			</div>
			<Footer />
		</div>
	)
}

function Header({ title, author }: { title: string; author?: string }) {
	return (
		<header className="or-layout__header">
			<Link to="/" className="or-layout__title or-interactive">
				<h1>{title}</h1>
			</Link>
			{author && <p className="or-layout__author">{author}</p>}
		</header>
	)
}

function Footer() {
	return (
		<footer className="or-layout__footer">
			<div className="or-layout__bar">
				<div className="or-layout__group">
					<TOCToggle />
					<TranslationSelector />
				</div>
				<div className="or-layout__group">
					<ThemeToggle />
					<SearchToggle />
					<Navigation />
				</div>
			</div>
		</footer>
	)
}

function SearchToggle() {
	const { panel } = useLayout()
	const { session } = useBookContext()
	const { query } = session.search

	const toggle = useCallback(() => {
		if (panel.left.open && !panel.right.open && window.innerWidth <= 1200) {
			panel.left.toggle()
		}
		panel.right.toggle()
	}, [panel.left, panel.right])

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
			className="or-icon-button or-interactive"
			onClick={toggle}
			type="button"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
				fill="none"
				focusable="false"
				viewBox="0 0 24 24"
				strokeWidth={2}
				stroke="currentColor"
				className="or-icon"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
				/>
			</svg>
			<span
				className={classes(
					'or-icon-button__badge',
					query && !panel.right.open && 'or-icon-button__badge--visible',
				)}
			/>
			{/* <kbd>⌘K</kbd> */}
		</button>
	)
}

function TOCToggle() {
	const { panel } = useLayout()

	const toggle = useCallback(() => {
		if (panel.right.open && !panel.left.open && window.innerWidth <= 1200) {
			panel.right.toggle()
		}
		panel.left.toggle()
	}, [panel.left, panel.right])

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
			className="or-icon-button or-interactive"
		>
			<svg
				aria-hidden="true"
				className="or-icon"
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
