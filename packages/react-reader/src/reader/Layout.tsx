import { useReader } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import Content from './Content'
import Cover from './Cover'
import Header from './Header'
import Page from './Page'
import Search from './Search'
import Sidebar from './Sidebar'
import TableOfContents from './TableOfContents'
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
			<Sidebar side="left">
				<TableOfContents />
			</Sidebar>
			<Page>
				<Cover />
				<Content />
			</Page>
			<Sidebar side="right">
				<Search />
			</Sidebar>
			<Toolbar />
		</>
	)
}
