import { useCallback, useEffect, useRef, useState } from 'react'
import { classes } from '../utils'

type ResizablePanelProps = {
	children: React.ReactNode
	position?: 'left' | 'right'
	className?: string
	minWidth?: number
	maxWidth?: number
	collapsed: boolean
	initialWidth: number
	onResizeEnd?: (_width: number) => void
}

export function ResizablePanel({
	children,
	position = 'left',
	minWidth = 0,
	maxWidth = Infinity,
	initialWidth = 120,
	collapsed = false,
	className,
	onResizeEnd,
}: ResizablePanelProps) {
	const panelRef = useRef<HTMLDivElement | null>(null)
	const startX = useRef(0)
	const startWidth = useRef(initialWidth)

	const [width, setWidth] = useState(initialWidth)
	const [isResizing, setIsResizing] = useState(false)

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault()
			startX.current = e.clientX
			startWidth.current = panelRef.current
				? panelRef.current.offsetWidth
				: initialWidth
			setIsResizing(true)
		},
		[initialWidth],
	)

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!panelRef.current) return

			const delta = e.clientX - startX.current
			let newWidth =
				position === 'right'
					? startWidth.current - delta
					: startWidth.current + delta

			newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))

			panelRef.current.style.width = `${newWidth}px`

			setWidth(newWidth)
		},
		[position, minWidth, maxWidth],
	)

	const handleMouseUp = useCallback(() => {
		setIsResizing(false)
		if (onResizeEnd) {
			onResizeEnd(width)
		}
	}, [onResizeEnd, width])

	useEffect(() => {
		if (!isResizing) return

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isResizing, handleMouseMove, handleMouseUp])

	return (
		<div
			ref={panelRef}
			style={{ width }}
			className={classes(
				'or-panel',
				collapsed && 'or-panel--collapsed',
				className,
			)}
		>
			{children}

			<button
				type="button"
				tabIndex={-1}
				className={classes(
					'or-panel__resizer',
					position === 'right'
						? 'or-panel__resizer--right'
						: 'or-panel__resizer--left',
					isResizing && 'or-panel__resizer--active',
				)}
				onMouseDown={handleMouseDown}
			/>
		</div>
	)
}
