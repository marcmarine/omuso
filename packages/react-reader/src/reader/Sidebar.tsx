import { ResizablePanel } from '../components/ResizablePanel'
import { useReaderPanels } from '../providers/LayoutProvider'
import Search from './Search'
import TableOfContents from './TableOfContents'

const WIDTH_LIMITS = {
	left: { maxWidth: 250 },
	right: { minWidth: 300 },
}

export default function Sidebar({
	side,
	children,
}: {
	side: 'left' | 'right'
	children?: React.ReactNode
}) {
	const panel = useReaderPanels()[side]

	return (
		<ResizablePanel
			{...WIDTH_LIMITS[side]}
			className="om-sidebar"
			initialWidth={panel.width}
			collapsed={!panel.isOpen}
			onResizeEnd={panel.setWidth}
			position={side}
		>
			{children ?? (side === 'left' ? <TableOfContents /> : <Search />)}
		</ResizablePanel>
	)
}
