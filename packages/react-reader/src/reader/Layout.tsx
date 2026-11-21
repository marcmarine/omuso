import { Children } from 'react'
import { useReader } from '../providers/BookContextProvider'
import { useLayout } from '../providers/LayoutProvider'
import Header from './Header'
import Toolbar from './Toolbar'

import '../styles/index.css'

export default function Layout({ children }: { children: React.ReactNode }) {
	const { title } = useReader().meta.manifest.metadata
	const { layoutRef } = useLayout()

	const childrenArray = Children.toArray(children)
	const [FirstChild, SecondChild, ThirdChild] = childrenArray

	// The pieces are direct children of `.om-layout`, which places them by
	// grid area.
	return (
		<section className="om-reader" aria-label={title}>
			<div ref={layoutRef} className="om-layout">
				<Header />
				{FirstChild}
				{SecondChild}
				{ThirdChild}
				<Toolbar />
			</div>
		</section>
	)
}
