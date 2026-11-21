import { useReader } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import Header from './Header'
import Page from './Page'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'

import '../styles/index.css'

export default function Layout({ children }: { children?: React.ReactNode }) {
	const { title } = useReader().meta.manifest.metadata
	const { layoutRef } = useLayout()

	// The pieces are direct children of `.om-layout`, which places them by
	// their class, so their order doesn't matter for the grid.
	return (
		<section className="om-reader" aria-label={title}>
			<div ref={layoutRef} className="om-layout">
				{children ?? <DefaultPieces />}
			</div>
		</section>
	)
}

function DefaultPieces() {
	return (
		<>
			<Header />
			<Sidebar side="left" />
			<Page />
			<Sidebar side="right" />
			<Toolbar />
		</>
	)
}
