import { Children, useEffect, useRef } from 'react'
import { ResizablePanel } from '../components/ResizablePanel'
import { useReader } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import Header from './Header'
import Toolbar from './Toolbar'

import '../styles/index.css'

export default function Layout({ children }: { children: React.ReactNode }) {
	const {
		state: { session },
		meta: { manifest },
	} = useReader()
	const { panel, layoutRef } = useLayout()
	const { title } = manifest.metadata
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
				<Header />
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
