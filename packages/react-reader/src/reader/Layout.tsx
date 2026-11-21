import { Children } from 'react'
import { ResizablePanel } from '../components/ResizablePanel'
import { useReader } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import Header from './Header'
import Toolbar from './Toolbar'

import '../styles/index.css'

export default function Layout({ children }: { children: React.ReactNode }) {
	const { title } = useReader().meta.manifest.metadata
	const { panel, layoutRef } = useLayout()

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
				{SecondChild}
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
