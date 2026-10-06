import { Children, useCallback, useEffect } from 'react'
import { Link } from '../components/Link'
import { ResizablePanel } from '../components/ResizablePanel'
import ThemeToggle from '../components/ThemeToggle'
import TranslationSelector from '../components/TranslationSelector'
import { useBookContext } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import { isWideViewport } from '../utils'
import { COVER_PATH } from '../utils/routes'
import Navigation from './Navigation'

import '../styles/index.css'

export default function Layout({ children }: { children: React.ReactNode }) {
	const { manifest } = useBookContext()
	const { panel } = useLayout()
	const { title, author } = manifest.metadata

	const childrenArray = Children.toArray(children)
	const [FirstChild, SecondChild, ThirdChild] = childrenArray

	return (
		<section className="om-reader" aria-label={title}>
			<div className="om-reader__body">
				<div className="om-reader__main">
					<Header title={title} author={author} />
					<div className="om-reader__stage">
						<ResizablePanel
							maxWidth={250}
							className="om-sidebar"
							initialWidth={panel.left.width}
							collapsed={!panel.left.open}
							onResizeEnd={panel.left.setPanelWidth}
						>
							{FirstChild}
						</ResizablePanel>
						<div className="om-reader__page">{SecondChild}</div>
					</div>
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
			</div>
			<Toolbar />
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
	const { panel, i18n } = useLayout()
	const { session } = useBookContext()
	const { query } = session.search

	const toggle = useCallback(() => {
		if (panel.left.open && !panel.right.open && !isWideViewport()) {
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
	const { panel, i18n } = useLayout()

	const toggle = useCallback(() => {
		if (panel.right.open && !panel.left.open && !isWideViewport()) {
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
