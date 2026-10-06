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
	const clampedInitialWidth = Math.max(
		minWidth,
		Math.min(maxWidth, initialWidth),
	)

	const panelRef = useRef<HTMLDivElement | null>(null)
	const startX = useRef(0)
	const startWidth = useRef(clampedInitialWidth)
	const currentWidth = useRef(clampedInitialWidth)

	const [width, setWidth] = useState(clampedInitialWidth)
	const [isResizing, setIsResizing] = useState(false)

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault()
			startX.current = e.clientX
			startWidth.current = panelRef.current
				? panelRef.current.offsetWidth
				: clampedInitialWidth
			currentWidth.current = startWidth.current
			setIsResizing(true)
		},
		[clampedInitialWidth],
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

			// Width is applied directly to the DOM while dragging and committed
			// to state on mouseup, so moving the mouse doesn't re-render.
			panelRef.current.style.width = `${newWidth}px`
			currentWidth.current = newWidth
		},
		[position, minWidth, maxWidth],
	)

	const handleMouseUp = useCallback(() => {
		setIsResizing(false)
		setWidth(currentWidth.current)
		if (onResizeEnd) {
			onResizeEnd(currentWidth.current)
		}
	}, [onResizeEnd])

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
			className={classes('om-resizable', className)}
			data-side={position}
			hidden={collapsed}
		>
			{children}

			<button
				type="button"
				tabIndex={-1}
				aria-hidden="true"
				className="om-resizable__handle"
				data-side={position}
				data-resizing={isResizing || undefined}
				onMouseDown={handleMouseDown}
			/>
		</div>
	)
}
